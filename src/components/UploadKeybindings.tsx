// Drag-and-drop / file-picker UI for replacing the user keybindings.json
// at runtime. Posts the read text to the parent component, which forwards it
// to `DanceEditorHandle.setKeybindings`.

import { useCallback, useRef, useState } from "react";

export interface UploadKeybindingsProps {
  onUpload(json: string): Promise<void>;
  onReset?(): Promise<void>;
}

export function UploadKeybindings({ onUpload, onReset }: UploadKeybindingsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; msg: string } | undefined>();
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setStatus({ kind: "info", msg: `Reading ${file.name}…` });
      try {
        const text = await file.text();
        await onUpload(text);
        setStatus({ kind: "ok", msg: `Loaded ${file.name} (${text.length.toLocaleString()} chars).` });
      } catch (err) {
        setStatus({
          kind: "err",
          msg: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setBusy(false);
      }
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        void handleFile(file);
      }
    },
    [handleFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        border: `1px dashed ${dragOver ? "#4fc1ff" : "#3c3c3c"}`,
        background: dragOver ? "rgba(79,193,255,0.08)" : "#252526",
        borderRadius: 6,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <strong style={{ color: "#e7e7e7" }}>keybindings.json</strong>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          style={btnStyle}
        >
          Choose file…
        </button>
        {onReset && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onReset();
                setStatus({ kind: "ok", msg: "Reset to bundled keybindings." });
              } catch (err) {
                setStatus({
                  kind: "err",
                  msg: err instanceof Error ? err.message : String(err),
                });
              } finally {
                setBusy(false);
              }
            }}
            style={btnStyle}
          >
            Reset
          </button>
        )}
        <span style={{ color: "#8c8c8c", fontSize: 12 }}>
          drop a file here or pick one — applied live.
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          e.target.value = "";
        }}
      />
      {status && (
        <div
          style={{
            color:
              status.kind === "err"
                ? "#f48771"
                : status.kind === "ok"
                  ? "#73c991"
                  : "#9cdcfe",
            fontSize: 12,
          }}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#0e639c",
  color: "white",
  border: "1px solid #1177bb",
  padding: "4px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};
