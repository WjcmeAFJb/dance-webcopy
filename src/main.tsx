import "./styles.css";

// MUST be the first runtime import — installs window.MonacoEnvironment as a
// side effect so the worker spawn that happens deep inside the
// monaco-vscode-api module load doesn't run before our worker registry.
import "./setup/workers";

import * as monaco from "monaco-editor";
import { createRoot } from "react-dom/client";

import App from "./App";
import { applyKeybindings } from "./setup/keybindings";

// Expose monaco for the smoke test and DevTools tinkering.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).monaco = monaco;

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root container in index.html");
}

createRoot(root).render(
  // StrictMode is intentionally off: the bootstrap is single-flight, but the
  // attachPart cleanup running between strict-mode invocations would tear down
  // the editor before the second pass mounts. Re-enable once we model that.
  <App />,
);

// Test/debug surface: lets the smoke test (and curious users in DevTools)
// drive the workbench without needing to reach into bundle-internal modules.
declare global {
  interface Window {
    __dance?: {
      applyKeybindings(json: string): Promise<unknown>;
      readSelections(): Array<{
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
        text: string;
      }>;
      executeCommand(command: string, ...args: unknown[]): Promise<unknown>;
    };
  }
}

(window as Window).__dance = {
  applyKeybindings,
  readSelections() {
    // monaco-editor (re-exported by monaco-vscode-api) keeps a registry of
    // all open editors; the active editor's selections are what Dance
    // manipulates.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).monaco;
    if (!monaco?.editor?.getEditors) return [];
    const editors = monaco.editor.getEditors();
    if (!editors.length) return [];
    const editor = editors[editors.length - 1];
    const selections = editor.getSelections() ?? [];
    const model = editor.getModel();
    return selections.map((s: any) => ({
      startLine: s.startLineNumber,
      startColumn: s.startColumn,
      endLine: s.endLineNumber,
      endColumn: s.endColumn,
      text: model?.getValueInRange(s) ?? "",
    }));
  },
  async executeCommand(command, ...args) {
    const api = await import("@codingame/monaco-vscode-api");
    const svc = await import(
      "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service"
    );
    const cmd = (await api.getService((svc as any).ICommandService)) as {
      executeCommand(command: string, ...args: unknown[]): Promise<unknown>;
    };
    return cmd.executeCommand(command, ...args);
  },
};
