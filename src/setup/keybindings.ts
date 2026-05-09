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
import {
  parse as parseJsonc,
  printParseErrorCode,
  type ParseError,
} from "jsonc-parser";

import defaultKeybindings from "../../samples/keybindings.json?raw";
import { setUserKeybindings } from "../trainer/keymap";

const DEFAULT_CONFIGURATION = JSON.stringify(
  {
    "editor.fontSize": 14,
    "editor.minimap.enabled": false,
    "editor.lineNumbers": "on",
    "editor.renderWhitespace": "selection",
    "workbench.colorTheme": "Default Dark Modern",
    "files.autoSave": "off",
    // Match VSCode's built-in associations so settings/keybindings/.vscode
    // files open as JSON-with-comments rather than strict JSON.
    "files.associations": {
      "**/.vscode/*.json": "jsonc",
      "**/User/settings.json": "jsonc",
      "**/User/keybindings.json": "jsonc",
      "*.code-workspace": "jsonc",
      "tsconfig*.json": "jsonc",
      "jsconfig*.json": "jsonc",
    },
    // Block cursor in normal mode by default — VSCode's bare line caret
    // for the unmoded base feels wrong with modal editing. Dance's
    // per-mode `cursorStyle` overrides take effect on top of this for
    // insert mode (line) and the rest.
    "editor.cursorStyle": "block",
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
  setUserKeybindings(json);
}

/**
 * Validate a keybindings document (JSON-with-comments, like VSCode) and
 * replace the active keybindings.
 *
 * Accepts the same JSONC dialect as VSCode's own settings/keybindings editors:
 * `// line comments`, `/* block comments * /`, and trailing commas.
 *
 * Returns the parsed array on success. Throws SyntaxError on invalid JSONC or
 * a TypeError if the root element is not an array.
 */
export async function applyKeybindings(jsonc: string): Promise<unknown[]> {
  const errors: ParseError[] = [];
  const parsed = parseJsonc(jsonc, errors, {
    allowTrailingComma: true,
    allowEmptyContent: false,
    disallowComments: false,
  });
  if (errors.length > 0) {
    const first = errors[0];
    const lineInfo = locateOffset(jsonc, first.offset);
    throw new SyntaxError(
      `${printParseErrorCode(first.error)} at line ${lineInfo.line}, column ${lineInfo.column}`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new TypeError("keybindings.json must be a JSON array of binding objects");
  }
  // Hand the original JSONC text to VSCode — its keybinding registry has its
  // own JSONC parser, and preserving comments/trailing commas means the user
  // sees the same text they uploaded if they later open keybindings.json.
  await updateUserKeybindings(jsonc);
  setUserKeybindings(jsonc);
  return parsed;
}

function locateOffset(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10 /* \n */) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
