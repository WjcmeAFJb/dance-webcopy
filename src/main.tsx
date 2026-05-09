import "./styles.css";

// MUST be the first runtime import — installs window.MonacoEnvironment as a
// side effect so the worker spawn that happens deep inside the
// monaco-vscode-api module load doesn't run before our worker registry.
import "./setup/workers";

// VSCode default extensions: register at module load time so their language
// contributions (json, jsonc, themes) are in the registry before the
// workbench scans it.
import "./setup/default-extensions";

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
      registeredLanguages(): Promise<Array<{
        id: string;
        extensions: string[];
        filenames: string[];
        filenamePatterns: string[];
      }>>;
      openModel(uriPath: string): Promise<{ languageId: string } | null>;
      listExtensions(): Promise<Array<{ id: string; isActive: boolean }>>;
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
  async registeredLanguages() {
    const api = await import("@codingame/monaco-vscode-api");
    const langMod = (await import(
      "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service"
    )) as { ILanguageService: unknown };
    const svc = (await api.getService(langMod.ILanguageService as never)) as {
      getRegisteredLanguageIds?: () => string[];
      getExtensions?: (id: string) => string[];
      getFilenames?: (id: string) => string[];
    };
    if (!svc?.getRegisteredLanguageIds) return [];
    return svc.getRegisteredLanguageIds().map((id) => ({
      id,
      extensions: (svc.getExtensions?.(id) ?? []) as string[],
      filenames: (svc.getFilenames?.(id) ?? []) as string[],
      filenamePatterns: [] as string[],
    }));
  },
  async listExtensions() {
    const vsc = await import("vscode");
    return vsc.extensions.all.map((e) => ({
      id: e.id,
      isActive: e.isActive,
    }));
  },
  async openModel(uriPath) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monacoNs = (window as any).monaco;
    if (!monacoNs) return null;
    const uri = monacoNs.Uri.file(uriPath);
    const api = await import("@codingame/monaco-vscode-api");
    const cmdMod = (await import(
      "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service"
    )) as { ICommandService: unknown };
    const cmd = (await api.getService(cmdMod.ICommandService as never)) as {
      executeCommand(c: string, ...a: unknown[]): Promise<unknown>;
    };
    await cmd.executeCommand("vscode.open", uri);
    for (let i = 0; i < 20; i++) {
      const model = monacoNs.editor.getModel(uri);
      if (model) return { languageId: model.getLanguageId() };
      await new Promise((r) => setTimeout(r, 150));
    }
    return null;
  },
};
