// The Trainer side panel. Lists folders → lessons on the left, the active
// lesson narration + verifier status on the right. Drives state via
// `useLessonRuntime`.

import { useCallback, useMemo, useState } from "react";

import { ALL_LESSONS, lessonsByFolder } from "./catalog";
import { Narration } from "./markdown";
import { KeyChip } from "./key-chip";
import { useLessonRuntime } from "./runtime";
import { FOLDERS, type FolderInfo, type Lesson, type LessonFolder } from "./types";

export interface TrainerPanelProps {
  /** True once the editor's bootstrap has finished and Dance is ready. */
  ready: boolean;
}

export function TrainerPanel({ ready }: TrainerPanelProps) {
  const grouped = useMemo(() => lessonsByFolder(), []);
  // No lesson is auto-selected: the lesson runtime takes over the active
  // editor's model when it starts, and we want to give the user the
  // playground first. They click a lesson to begin.
  const [selectedId, setSelectedId] = useState<string>("");
  const lesson = useMemo<Lesson | undefined>(
    () => ALL_LESSONS.find((l) => l.id === selectedId),
    [selectedId],
  );

  return (
    <div style={panelStyle}>
      <LessonList
        grouped={grouped}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {!lesson ? (
        <div style={waitingStyle}>
          <strong>Pick a lesson to start.</strong>
          <p style={{ marginTop: 8, opacity: 0.7, lineHeight: 1.5 }}>
            Lessons are sourced from{" "}
            <a
              href="https://github.com/igor-ramazanov/dance-training"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#4fc1ff" }}
            >
              dance-training
            </a>
            . Each step's hints render the binding from the keybindings.json
            you uploaded — drop a different file above and the instructions
            update live.
          </p>
        </div>
      ) : ready ? (
        <LessonRunner key={lesson.id} lesson={lesson} />
      ) : (
        <div style={waitingStyle}>
          <strong>Trainer waiting…</strong>
          <p style={{ marginTop: 8, opacity: 0.7 }}>
            The Dance editor is booting. The trainer connects automatically as soon
            as the editor reports a Dance mode.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lesson list                                                        */
/* ------------------------------------------------------------------ */

function LessonList(props: {
  grouped: Map<LessonFolder, Lesson[]>;
  selectedId: string;
  onSelect(id: string): void;
}) {
  const [openFolder, setOpenFolder] = useState<LessonFolder | undefined>(
    () => folderOf(props.selectedId),
  );
  return (
    <aside style={listStyle}>
      <h2 style={listTitleStyle}>Lessons</h2>
      {FOLDERS.map((folder) => {
        const lessons = props.grouped.get(folder.id) ?? [];
        if (lessons.length === 0) return null;
        const open = openFolder === folder.id;
        return (
          <div key={folder.id}>
            <button
              type="button"
              onClick={() =>
                setOpenFolder((cur) => (cur === folder.id ? undefined : folder.id))
              }
              style={folderHeaderStyle}
            >
              <span style={folderChevronStyle}>{open ? "▾" : "▸"}</span>
              <span>{folder.label}</span>
              <span style={folderCountStyle}>{lessons.length}</span>
            </button>
            {open && (
              <ul style={lessonUlStyle}>
                {lessons.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => props.onSelect(l.id)}
                      style={
                        l.id === props.selectedId ? lessonItemActiveStyle : lessonItemStyle
                      }
                      title={l.blurb}
                    >
                      <span style={lessonIdStyle}>{shortId(l.id)}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={lessonTitleStyle}>{l.title}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}

function folderOf(id: string): LessonFolder | undefined {
  const lesson = ALL_LESSONS.find((l) => l.id === id);
  return lesson?.folder;
}

function shortId(id: string): string {
  return id.replace(/^(\d+)-.*/, "$1");
}

function folderLabel(id: LessonFolder): string {
  const f: FolderInfo | undefined = FOLDERS.find((x) => x.id === id);
  return f?.label ?? id;
}

/* ------------------------------------------------------------------ */
/*  Lesson runner                                                      */
/* ------------------------------------------------------------------ */

function LessonRunner({ lesson }: { lesson: Lesson }) {
  const api = useLessonRuntime(lesson);
  const onAdvance = useCallback(() => {
    if (api.passed && api.stepIndex < api.total - 1) {
      api.goNext();
    }
  }, [api]);

  return (
    <section style={runnerStyle}>
      <header style={runnerHeaderStyle}>
        <span style={folderTagStyle}>{folderLabel(lesson.folder)}</span>
        <h2 style={runnerTitleStyle}>{lesson.title}</h2>
        <p style={runnerBlurbStyle}>{lesson.blurb}</p>
        {lesson.teaches.length > 0 && (
          <div style={teachesRowStyle}>
            <span style={teachesLabelStyle}>Teaches:</span>
            {lesson.teaches.slice(0, 6).map((cmd) => (
              <KeyChip key={cmd} command={normalizeCmd(cmd)} />
            ))}
          </div>
        )}
      </header>

      <div style={progressStyle}>
        Step {api.stepIndex + 1} of {api.total}
        {api.passed ? <span style={passedTagStyle}>✓ goal met</span> : null}
      </div>

      <div style={narrationStyle}>
        <Narration text={api.step.narrate} />
      </div>

      {api.step.hint && (
        <div style={hintStyle}>
          {api.hintVisible ? (
            <>
              <strong style={{ color: "#dcdcaa" }}>Hint:</strong>{" "}
              <Narration text={api.step.hint} />
            </>
          ) : (
            <button type="button" style={hintBtnStyle} onClick={api.showHint}>
              Show hint
            </button>
          )}
        </div>
      )}

      <div style={controlsStyle}>
        <button type="button" style={btnStyle} onClick={api.goPrevious} disabled={api.stepIndex === 0}>
          ← Prev
        </button>
        <button type="button" style={btnStyle} onClick={api.resetStep}>
          Reset step
        </button>
        <button type="button" style={btnStyle} onClick={api.resetLesson}>
          Restart lesson
        </button>
        <button
          type="button"
          style={api.passed ? btnPrimaryStyle : btnStyle}
          onClick={onAdvance}
          disabled={!api.passed || api.stepIndex >= api.total - 1}
        >
          Next →
        </button>
      </div>
    </section>
  );
}

// Some lesson `teaches` entries use the canonical `kak.normal.…` namespace
// rather than the `dance.…` command id our editor recognizes. The KeyChip
// only ever looks up dance.* commands, so map the obvious cases or fall
// through to the original string for the "unbound" badge.
function normalizeCmd(s: string): string {
  if (s.startsWith("kak.normal.select.")) {
    const dir = s.split(".").slice(-1)[0];
    return `dance.select.${dir}.jump`;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const panelStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  height: "100%",
  minHeight: 0,
  background: "#1f1f1f",
  color: "#d4d4d4",
  fontSize: 13,
  borderLeft: "1px solid #2d2d2d",
};

const listStyle: React.CSSProperties = {
  borderRight: "1px solid #2d2d2d",
  overflow: "auto",
  padding: "8px 0",
};

const listTitleStyle: React.CSSProperties = {
  margin: "4px 12px 8px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  color: "#888",
  fontWeight: 600,
};

const folderHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  textAlign: "left",
  padding: "6px 12px",
  background: "transparent",
  color: "#cccccc",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const folderChevronStyle: React.CSSProperties = {
  width: 12,
  textAlign: "center",
  color: "#6a6a6a",
};

const folderCountStyle: React.CSSProperties = {
  marginLeft: "auto",
  fontSize: 11,
  color: "#888",
};

const lessonUlStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const lessonItemBaseStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  alignItems: "center",
  gap: 6,
  padding: "5px 12px 5px 28px",
  background: "transparent",
  border: "none",
  color: "#bbb",
  cursor: "pointer",
  textAlign: "left",
  fontSize: 12,
};

const lessonItemStyle: React.CSSProperties = {
  ...lessonItemBaseStyle,
};

const lessonItemActiveStyle: React.CSSProperties = {
  ...lessonItemBaseStyle,
  background: "#094771",
  color: "white",
};

const lessonIdStyle: React.CSSProperties = {
  width: 22,
  flexShrink: 0,
  fontFamily: "ui-monospace, monospace",
  color: "#888",
  fontSize: 11,
};

const lessonTitleStyle: React.CSSProperties = {
  display: "block",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const runnerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "auto",
  padding: "16px 18px 12px",
};

const runnerHeaderStyle: React.CSSProperties = {
  borderBottom: "1px solid #2d2d2d",
  paddingBottom: 10,
  marginBottom: 12,
};

const folderTagStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#2d2d30",
  border: "1px solid #3c3c3c",
  borderRadius: 12,
  padding: "1px 8px",
  fontSize: 11,
  color: "#b0b0b0",
  marginBottom: 6,
};

const runnerTitleStyle: React.CSSProperties = {
  margin: "4px 0 4px",
  fontSize: 16,
  color: "#e7e7e7",
  fontWeight: 600,
};

const runnerBlurbStyle: React.CSSProperties = {
  margin: 0,
  color: "#a8a8a8",
  fontSize: 12,
};

const teachesRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 8,
};

const teachesLabelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 11,
};

const progressStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "#9aa0a6",
  marginBottom: 8,
};

const passedTagStyle: React.CSSProperties = {
  marginLeft: "auto",
  color: "#73c991",
};

const narrationStyle: React.CSSProperties = {
  background: "#252526",
  border: "1px solid #2d2d2d",
  borderRadius: 6,
  padding: "12px 14px",
  marginBottom: 8,
};

const hintStyle: React.CSSProperties = {
  background: "rgba(220, 220, 170, 0.07)",
  border: "1px dashed #555",
  borderRadius: 6,
  padding: "8px 12px",
  marginBottom: 8,
};

const hintBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: "#dcdcaa",
  border: "1px solid #555",
  borderRadius: 4,
  padding: "2px 8px",
  fontSize: 12,
  cursor: "pointer",
};

const controlsStyle: React.CSSProperties = {
  marginTop: "auto",
  paddingTop: 12,
  display: "flex",
  gap: 6,
};

const btnStyle: React.CSSProperties = {
  background: "#2d2d30",
  border: "1px solid #3c3c3c",
  color: "#cccccc",
  padding: "5px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#0e639c",
  color: "white",
  borderColor: "#1177bb",
};

const waitingStyle: React.CSSProperties = {
  padding: "24px 18px",
  color: "#888",
};
