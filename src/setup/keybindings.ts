// Helpers for seeding the user keybindings.json before VSCode boots, and for
// replacing it later when the user uploads a different file.
//
// The user keybindings file lives at `vscode-userdata:/User/keybindings.json`
// and is read once at service-init by the keybindings service. The
// `init*` form must be called BEFORE `initialize()`; the `update*` form can be
// called any time after.

import {
  initUserKeybindings,
  updateUserKeybindings,
} from "@codingame/monaco-vscode-keybindings-service-override";
import { initUserConfiguration } from "@codingame/monaco-vscode-configuration-service-override";

import defaultKeybindings from "../../samples/keybindings.json?raw";

const DEFAULT_CONFIGURATION = JSON.stringify(
  {
    "editor.fontSize": 14,
    "editor.minimap.enabled": false,
    "editor.lineNumbers": "on",
    "editor.renderWhitespace": "selection",
    "workbench.colorTheme": "Default Dark Modern",
    "files.autoSave": "off",
    // Ensure Dance is enabled out of the gate.
    "dance.enabled": true,
  },
  null,
  2,
);

export const SAMPLE_KEYBINDINGS_RAW = defaultKeybindings;

// Empty starter keybindings: lets Dance's package.json keybindings own the
// keymap. Users can upload their own JSON (or the bundled sample) to layer
// overrides on top.
const EMPTY_KEYBINDINGS = "[]";

export async function seedUserKeybindings(json: string = EMPTY_KEYBINDINGS): Promise<void> {
  await Promise.all([
    initUserConfiguration(DEFAULT_CONFIGURATION),
    initUserKeybindings(json),
  ]);
}

/**
 * Validate a JSON keybindings document and replace the active keybindings.
 *
 * Returns the parsed array on success. Throws SyntaxError on invalid JSON or
 * a TypeError if the root element is not an array.
 */
export async function applyKeybindings(json: string): Promise<unknown[]> {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new TypeError("keybindings.json must be a JSON array of binding objects");
  }
  await updateUserKeybindings(json);
  return parsed;
}
