// Single-flight bootstrap of monaco-vscode-api. Browsers can only host one
// VSCode workbench per page; calling this twice resolves to the same promise.
//
// The order matters:
//   1. Set up worker URLs on `window.MonacoEnvironment`.
//   2. Register the in-memory workspace and seed user keybindings (so the
//      keybindings service reads them during init).
//   3. Call `initialize()` with our service overrides.
//   4. Register the Dance vsix and the companion mode view (after the
//      extension service is online).
//
// `initialize()` MUST be called exactly once per page. Component remounts
// reuse the same workbench.

import { initialize as initializeMonacoServices } from "@codingame/monaco-vscode-api";
import { setUnexpectedErrorHandler } from "@codingame/monaco-vscode-api/monaco";
import * as monaco from "monaco-editor";
import "vscode/localExtensionHost";

import { registerWorkers } from "./workers";
import { buildServiceOverrides } from "./services";
import { registerWorkspace, WORKSPACE_FILE } from "./workspace";
import { seedUserKeybindings } from "./keybindings";
import { openNewCodeEditor } from "./openEditor";
import { registerDanceCompanion } from "./extensions";

import type { IWorkbenchConstructionOptions } from "@codingame/monaco-vscode-api";

let bootstrap: Promise<void> | undefined;

export interface InitializeOptions {
  /** JSON string for the user keybindings.json — defaults to the bundled sample. */
  initialKeybindings?: string;
}

export function initializeDanceWorkbench(opts: InitializeOptions = {}): Promise<void> {
  if (bootstrap) {
    return bootstrap;
  }
  bootstrap = (async () => {
    registerWorkers();

    await registerWorkspace();
    await seedUserKeybindings(opts.initialKeybindings);

    const constructOptions: IWorkbenchConstructionOptions = {
      // Disable workspace-trust prompts: the playground is a static
      // in-memory workspace, and the modal dialog blocks editor focus.
      enableWorkspaceTrust: false,
      windowIndicator: {
        label: "Dance (web)",
        tooltip: "Dance running on monaco-vscode-api",
        command: "",
      },
      workspaceProvider: {
        trusted: true,
        async open() {
          window.open(window.location.href);
          return true;
        },
        workspace: { workspaceUri: WORKSPACE_FILE },
      },
      configurationDefaults: {
        "window.title": "Dance${separator}${dirty}${activeEditorShort}",
      },
      productConfiguration: {
        nameShort: "DanceWeb",
        nameLong: "Dance in the browser",
      },
      welcomeBanner: {
        message: "Press the Dance icon in the activity bar to see registers and mode.",
      },
      defaultLayout: {
        editors: [
          {
            uri: monaco.Uri.file("/workspace/playground.txt"),
            viewColumn: 1,
          },
        ],
        layout: {
          editors: { orientation: 0, groups: [{ size: 1 }] },
        },
        // Open the Dance "registers" view in the sidebar at startup so the
        // sidebar has visible content (otherwise the layout service decides
        // the sidebar is empty and collapses it to zero width).
        views: [{ id: "registers" }],
        force: true,
      },
    };

    // Wait one frame so the React-rendered layout is laid out before VSCode's
    // LayoutService runs. Otherwise its constructor can throw "Unable to
    // figure out browser width and height" if any ancestor is mid-layout.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const services = buildServiceOverrides(openNewCodeEditor as any);
    // The container hosts the workbench root. The activity bar / sidebar /
    // editor / status bar parts can subsequently be re-parented via attachPart
    // into our React refs.
    await initializeMonacoServices(services, document.body, constructOptions);

    setUnexpectedErrorHandler((err) => {
      // Suppress noise from internal services that fail late during teardown
      // (e.g. when the user reloads the page mid-init).
      console.info("[dance-web] vscode internal error:", err);
    });

    await registerDanceCompanion();
  })().catch((err) => {
    bootstrap = undefined;
    throw err;
  });
  return bootstrap;
}

export function isInitialized(): boolean {
  return bootstrap !== undefined;
}
