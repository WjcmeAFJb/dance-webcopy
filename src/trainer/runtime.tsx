// Lesson runtime: keeps a Monaco model that backs the lesson buffer, polls
// the observable state on every Dance command, advances steps when goals
// are met, and exposes a small reactive view for the panel UI.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as monaco from "monaco-editor";

import type { InitialEditorState, Lesson, Step } from "./types";
import { verify } from "./verifier";
import {
  clearCommandLog,
  ensureCommandTracking,
  ensureDanceHandle,
  onDanceCommand,
  snapshot,
} from "./observable";

export interface LessonRuntimeApi {
  lesson: Lesson;
  stepIndex: number;
  step: Step;
  /** True when the active step's goal has been satisfied. */
  passed: boolean;
  /** Whether to surface the secondary hint. */
  hintVisible: boolean;
  showHint(): void;
  goNext(): void;
  goPrevious(): void;
  resetStep(): void;
  /** Drop everything and re-seed the lesson from `initial`. */
  resetLesson(): void;
  /** Total steps in the lesson. */
  total: number;
  /** True once the runtime has connected to a real Monaco model. */
  bound: boolean;
}

// Use the file URI registered by `setup/workspace.ts`. VSCode's file service
// can resolve it (a custom scheme would error with "Unable to resolve
// resource") and the lesson runtime overwrites its contents on each lesson
// load via `model.setValue`.
export const LESSON_FILE_URI = monaco.Uri.file("/workspace/.lesson.txt");

function applyInitial(model: monaco.editor.ITextModel, initial: InitialEditorState) {
  model.setValue(initial.text);
}

/**
 * Hook that drives a lesson. Pass the Monaco editor that should host the
 * lesson buffer (typically the active editor under the Dance instance).
 */
export function useLessonRuntime(lesson: Lesson): LessonRuntimeApi {
  const [stepIndex, setStepIndex] = useState(0);
  const [passed, setPassed] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [bound, setBound] = useState(false);
  const hintTimer = useRef<number | undefined>(undefined);

  const total = lesson.steps.length;
  const step = lesson.steps[Math.min(stepIndex, total - 1)] ?? lesson.steps[0];

  const seed = useCallback(() => {
    const model = ensureLessonModel();
    applyInitial(model, lesson.initial);
    clearCommandLog();
    // Move the active editor to this model so the lesson buffer is what
    // Dance acts on.
    const editor = pickActiveEditor();
    if (editor && editor.getModel() !== model) {
      editor.setModel(model);
    }
    if (editor) {
      const initialSel = lesson.initial.selections?.[0];
      const monacoSel = initialSel
        ? new monaco.Selection(
            initialSel.anchor.line + 1,
            initialSel.anchor.col + 1,
            initialSel.active.line + 1,
            initialSel.active.col + 1,
          )
        : new monaco.Selection(1, 1, 1, 2);
      editor.setSelection(monacoSel);
      editor.revealPositionInCenter({
        lineNumber: monacoSel.positionLineNumber,
        column: monacoSel.positionColumn,
      });
      editor.focus();
    }
    setBound(!!editor);
  }, [lesson]);

  const resetStep = useCallback(() => {
    seed();
    setPassed(false);
    setHintVisible(false);
  }, [seed]);

  const resetLesson = useCallback(() => {
    setStepIndex(0);
    seed();
    setPassed(false);
    setHintVisible(false);
  }, [seed]);

  // Seed on mount + whenever the lesson changes.
  useEffect(() => {
    void ensureCommandTracking();
    void ensureDanceHandle();
    seed();
    setStepIndex(0);
    setPassed(false);
    setHintVisible(false);
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, [lesson, seed]);

  // Schedule the hint after `hintAfterMs` (default 12s).
  useEffect(() => {
    setHintVisible(false);
    if (!step.hint) return;
    const delay = step.hintAfterMs ?? 12_000;
    hintTimer.current = window.setTimeout(() => setHintVisible(true), delay);
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, [stepIndex, step]);

  // Verify after every Dance command, plus selection/text/mode changes.
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const state = snapshot();
      const ok = verify(state, step.goal);
      setPassed((prev) => (prev === ok ? prev : ok));
    };

    const cmdUnsub = onDanceCommand(() => tick());

    let editor: monaco.editor.ICodeEditor | undefined;
    const monacoSubs: monaco.IDisposable[] = [];
    const attach = () => {
      editor = pickActiveEditor();
      if (!editor) return;
      monacoSubs.push(editor.onDidChangeCursorSelection(tick));
      monacoSubs.push(editor.onDidChangeModelContent(tick));
    };
    attach();

    // Initial verify.
    tick();

    return () => {
      alive = false;
      cmdUnsub();
      for (const d of monacoSubs) d.dispose();
    };
  }, [step]);

  const goNext = useCallback(() => {
    if (stepIndex >= total - 1) return;
    const nextIdx = stepIndex + 1;
    const next = lesson.steps[nextIdx];
    setStepIndex(nextIdx);
    if (next.reset === "initial") {
      seed();
    } else if (typeof next.reset === "object" && next.reset !== null) {
      const model = ensureLessonModel();
      applyInitial(model, next.reset);
      const editor = pickActiveEditor();
      if (editor) editor.setSelection(new monaco.Selection(1, 1, 1, 2));
    }
    clearCommandLog();
    setPassed(false);
    setHintVisible(false);
  }, [stepIndex, total, lesson.steps, seed]);

  const goPrevious = useCallback(() => {
    if (stepIndex <= 0) return;
    setStepIndex(stepIndex - 1);
    clearCommandLog();
    setPassed(false);
    setHintVisible(false);
  }, [stepIndex]);

  const showHint = useCallback(() => setHintVisible(true), []);

  return useMemo(
    () => ({
      lesson,
      stepIndex,
      step,
      passed,
      hintVisible,
      showHint,
      goNext,
      goPrevious,
      resetStep,
      resetLesson,
      total,
      bound,
    }),
    [
      lesson,
      stepIndex,
      step,
      passed,
      hintVisible,
      showHint,
      goNext,
      goPrevious,
      resetStep,
      resetLesson,
      total,
      bound,
    ],
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function ensureLessonModel(): monaco.editor.ITextModel {
  let model = monaco.editor.getModel(LESSON_FILE_URI);
  if (!model) {
    model = monaco.editor.createModel("", "plaintext", LESSON_FILE_URI);
  }
  return model;
}

function pickActiveEditor(): monaco.editor.ICodeEditor | undefined {
  const all = monaco.editor.getEditors();
  if (!all.length) return undefined;
  for (let i = all.length - 1; i >= 0; i--) {
    if ((all[i] as monaco.editor.ICodeEditor).hasTextFocus?.()) return all[i];
  }
  return all[all.length - 1];
}
