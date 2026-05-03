// Extension wiring: load the Dance vsix as a built-in extension via the rollup
// vsix plugin, and register a tiny companion that adds a "Mode" view alongside
// Dance's "Registers" view in the same activity-bar container.

import {
  ExtensionHostKind,
  registerExtension,
} from "@codingame/monaco-vscode-api/extensions";

import { companionManifest } from "../companion/manifest";
import { createModeView } from "../companion/mode-view";

// The rollup-vsix-plugin transforms .vsix imports at build time, registering
// the .vsix as a built-in extension and exposing a `whenReady` promise. The
// import side effect registers all of Dance's contributions (commands,
// keybindings, menus, views, status-bar items, etc.). Awaiting `whenReady`
// guarantees Dance's `vscode.extensions.getExtension('gregoire.dance')` will
// resolve in the companion before we ask for its exported API.
import { whenReady as danceWhenReady } from "../../extensions/dance.vsix";

let companionDisposer: (() => void) | undefined;

export async function registerDanceCompanion(): Promise<void> {
  if (companionDisposer) {
    return;
  }

  await danceWhenReady;

  const result = registerExtension(companionManifest, ExtensionHostKind.LocalProcess);
  const api = await result.getApi();

  const view = createModeView(api);
  view.registerProviderWith(api);

  companionDisposer = () => {
    view.dispose();
    void result.dispose();
  };
}

export function disposeDanceCompanion(): void {
  companionDisposer?.();
  companionDisposer = undefined;
}
