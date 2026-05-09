import { useRef, useState } from "react";

import { DanceEditor, type DanceEditorHandle } from "./components/DanceEditor";
import { UploadKeybindings } from "./components/UploadKeybindings";
import { SAMPLE_KEYBINDINGS_RAW } from "./setup/keybindings";

export default function App() {
  const editorRef = useRef<DanceEditorHandle>(null);
  const [ready, setReady] = useState(false);

  return (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        gridTemplateRows: "auto auto 1fr",
        background: "#181818",
        color: "#cccccc",
      }}
    >
      <header
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid #2d2d2d",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>
          Dance · monaco-vscode-api
        </h1>
        <span style={{ color: "#8c8c8c", fontSize: 12 }}>
          Modal editing on Monaco. Activity bar → "Dance" pane shows registers + mode.
        </span>
        <a
          href="https://github.com/71/dance"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#4fc1ff", fontSize: 12 }}
        >
          dance docs
        </a>
        <a
          href="https://github.com/CodinGame/monaco-vscode-api"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#4fc1ff", fontSize: 12 }}
        >
          monaco-vscode-api
        </a>
      </header>

      <div style={{ padding: "8px 16px", borderBottom: "1px solid #2d2d2d" }}>
        <UploadKeybindings
          onUpload={async (json) => {
            if (!editorRef.current) {
              throw new Error("Editor not ready yet");
            }
            await editorRef.current.setKeybindings(json);
          }}
          onReset={async () => {
            if (!editorRef.current) return;
            await editorRef.current.setKeybindings(SAMPLE_KEYBINDINGS_RAW);
          }}
        />
      </div>

      <main style={{ minHeight: 0, position: "relative" }}>
        <DanceEditor
          ref={editorRef}
          onReady={() => setReady(true)}
        />
        {ready ? null : null}
      </main>
    </div>
  );
}
