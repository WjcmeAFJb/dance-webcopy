import { useRef, useState } from "react";

import { DanceEditor, type DanceEditorHandle } from "./components/DanceEditor";
import { UploadKeybindings } from "./components/UploadKeybindings";
import { SAMPLE_KEYBINDINGS_RAW } from "./setup/keybindings";
import { TrainerPanel } from "./trainer/panel";

export default function App() {
  const editorRef = useRef<DanceEditorHandle>(null);
  const [ready, setReady] = useState(false);
  const [trainerVisible, setTrainerVisible] = useState(true);

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
          Dance · trainer
        </h1>
        <span style={{ color: "#8c8c8c", fontSize: 12 }}>
          Real Dance + Monaco. Lessons sourced from{" "}
          <a
            href="https://github.com/igor-ramazanov/dance-training"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#4fc1ff" }}
          >
            dance-training
          </a>
          . Upload your own keybindings.json — every key chip below renders the binding{" "}
          <em>you</em> use.
        </span>
        <button
          type="button"
          onClick={() => setTrainerVisible((v) => !v)}
          style={toggleBtnStyle}
        >
          {trainerVisible ? "Hide trainer" : "Show trainer"}
        </button>
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

      <main
        style={{
          minHeight: 0,
          position: "relative",
          display: "grid",
          gridTemplateColumns: trainerVisible ? "minmax(0, 1fr) 480px" : "minmax(0, 1fr)",
        }}
      >
        <div style={{ minWidth: 0, position: "relative" }}>
          <DanceEditor ref={editorRef} onReady={() => setReady(true)} />
        </div>
        {trainerVisible && <TrainerPanel ready={ready} />}
      </main>
    </div>
  );
}

const toggleBtnStyle: React.CSSProperties = {
  marginLeft: "auto",
  background: "#0e639c",
  color: "white",
  border: "1px solid #1177bb",
  padding: "4px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};
