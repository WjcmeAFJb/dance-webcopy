// <DanceEditor /> — reusable React component that mounts a Monaco editor
// driven by VSCode's full extension host with the Dance modal-editing
// extension preloaded. The companion extension contributes a "Mode" view
// alongside Dance's "Registers" view in the activity bar; both render via
// the real VSCode views service rather than ad-hoc React UI.
//
// Layout: the component renders the same DOM scaffolding as the upstream
// `setup.views.ts` — title bar, activity bar, sidebar, editor, status bar —
// then `attachPart` glues the corresponding VSCode "Part" instance into each
// container.
//
// The component is single-instance per page: monaco-vscode-api is global, so
// mounting twice is a programming error. Subsequent mounts reuse the bootstrap
// and simply re-attach parts.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { applyKeybindings } from "../setup/keybindings";
import { initializeDanceWorkbench } from "../setup/initialize";

export interface DanceEditorHandle {
  /** Replace the user keybindings.json from a string. */
  setKeybindings(json: string): Promise<void>;
}

export interface DanceEditorProps {
  /** Initial user keybindings.json content; falls back to the bundled sample. */
  initialKeybindings?: string;
  /** Called when bootstrap finishes successfully. */
  onReady?: () => void;
  /** Called if any part of bootstrap fails. */
  onError?: (err: unknown) => void;
  /** className applied to the outer wrapper */
  className?: string;
  /** style applied to the outer wrapper */
  style?: React.CSSProperties;
}

export const DanceEditor = forwardRef<DanceEditorHandle, DanceEditorProps>(function DanceEditor(
  props,
  ref,
) {
  const { initialKeybindings, onReady, onError, className, style } = props;

  const titleBarRef = useRef<HTMLDivElement>(null);
  const activityBarRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const editorsRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<"booting" | "ready" | "error">("booting");
  const [error, setError] = useState<string | undefined>();

  useImperativeHandle(
    ref,
    () => ({
      async setKeybindings(json: string) {
        await applyKeybindings(json);
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let detach: (() => void) | undefined;

    initializeDanceWorkbench({ initialKeybindings })
      .then(async () => {
        if (cancelled) return;
        const { Parts, attachPart, isPartVisibile, onPartVisibilityChange } = await import(
          "@codingame/monaco-vscode-views-service-override"
        );
        type PartId = (typeof Parts)[keyof typeof Parts];
        const map: Array<{ part: PartId; el: HTMLElement | null }> = [
          { part: Parts.TITLEBAR_PART, el: titleBarRef.current },
          { part: Parts.ACTIVITYBAR_PART, el: activityBarRef.current },
          { part: Parts.SIDEBAR_PART, el: sidebarRef.current },
          { part: Parts.EDITOR_PART, el: editorsRef.current },
          { part: Parts.STATUSBAR_PART, el: statusBarRef.current },
        ];
        const disposers: Array<() => void> = [];
        for (const { part, el } of map) {
          if (!el) continue;
          const disp = attachPart(part, el);
          disposers.push(() => disp.dispose());
          if (!isPartVisibile(part)) {
            el.style.display = "none";
          }
          const visDisp = onPartVisibilityChange(part, (visible) => {
            el.style.display = visible ? "" : "none";
          });
          disposers.push(() => visDisp.dispose());
        }
        detach = () => {
          for (const d of disposers) d();
        };
        setPhase("ready");
        onReady?.();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[dance-web] bootstrap failed", err);
        setError(err instanceof Error ? err.message : String(err));
        setPhase("error");
        onError?.(err);
      });

    return () => {
      cancelled = true;
      detach?.();
    };
    // initialKeybindings is consumed once on bootstrap; we deliberately don't
    // re-run on prop changes — use the imperative handle's `setKeybindings`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={className}
      style={{
        display: "grid",
        // `minmax(0,...)` and the explicit overflow:hidden prevent the
        // VSCode editor part (which can self-report a giant intrinsic size)
        // from inflating the grid cell.
        gridTemplateRows: "auto minmax(0, 1fr) auto",
        gridTemplateColumns: "auto auto minmax(0, 1fr)",
        gridTemplateAreas: `
          "title    title    title"
          "activity sidebar  editors"
          "status   status   status"
        `,
        background: "#1e1e1e",
        color: "#cccccc",
        fontFamily: "system-ui, sans-serif",
        height: "100%",
        minHeight: 0,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div ref={titleBarRef} style={{ gridArea: "title", overflow: "hidden" }} />
      <div ref={activityBarRef} style={{ gridArea: "activity", display: "flex", overflow: "hidden" }} />
      <div ref={sidebarRef} style={{ gridArea: "sidebar", width: 280, display: "flex", overflow: "hidden" }} />
      <div
        ref={editorsRef}
        style={{
          gridArea: "editors",
          minWidth: 0,
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
        }}
      />
      <div ref={statusBarRef} style={{ gridArea: "status", overflow: "hidden" }} />

      {phase === "booting" && (
        <div style={loadingOverlayStyle}>Loading Dance editor…</div>
      )}
      {phase === "error" && (
        <div style={{ ...loadingOverlayStyle, color: "#f48771" }}>
          Failed to start Dance editor:
          <pre style={{ whiteSpace: "pre-wrap", textAlign: "left", maxWidth: 720 }}>{error}</pre>
        </div>
      )}
    </div>
  );
});

const loadingOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeContent: "center",
  background: "rgba(30,30,30,0.92)",
  zIndex: 50,
  fontSize: 14,
};
