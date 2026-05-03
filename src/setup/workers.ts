// Worker URL registration for monaco-vscode-api.
//
// **Side-effect-on-load**: this module installs `window.MonacoEnvironment`
// **eagerly** when imported. It MUST be imported before any
// `monaco-editor` / `monaco-vscode-api` / `vscode/*` module resolves —
// otherwise those modules can read MonacoEnvironment, find it missing, and
// throw "You must define a function MonacoEnvironment.getWorkerUrl or
// MonacoEnvironment.getWorker for the worker label: …".
//
// `?worker` is Vite's native syntax for importing a Worker constructor; it
// emits a separate worker chunk in production and resolves bare module
// specifiers correctly in both dev and build.

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import ExtensionHostWorker from "@codingame/monaco-vscode-api/workers/extensionHost.worker?worker";
import TextMateWorker from "@codingame/monaco-vscode-textmate-service-override/worker?worker";
import LanguageDetectionWorker from "@codingame/monaco-vscode-language-detection-worker-service-override/worker?worker";

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker?: (moduleId: string, label: string) => Worker | undefined;
      getWorkerUrl?: (moduleId: string, label: string) => string | undefined;
      getWorkerOptions?: (moduleId: string, label: string) => WorkerOptions | undefined;
    };
  }
}

window.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    switch (label) {
      case "editorWorkerService":
        return new EditorWorker();
      case "extensionHostWorkerMain":
        return new ExtensionHostWorker();
      case "TextMateWorker":
        return new TextMateWorker();
      case "LanguageDetectionWorker":
        return new LanguageDetectionWorker();
      default:
        return undefined;
    }
  },
};

// Compat shim so existing call-sites can still call `registerWorkers()`,
// even though the side-effect-on-load above is what actually wires things up.
export function registerWorkers(): void {
  // no-op; module load already installed MonacoEnvironment.
}
