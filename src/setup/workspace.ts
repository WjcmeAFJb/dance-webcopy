// Workspace files: a tiny in-memory filesystem so Dance has something to act
// on and the Editor part has a model to attach. Files are stored in a
// RegisteredFileSystemProvider; the userdata layer (settings, keybindings,
// state) lives in IndexedDB so it survives reloads.

import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  createIndexedDBProviders,
  registerFileSystemOverlay,
} from "@codingame/monaco-vscode-files-service-override";
import * as monaco from "monaco-editor";

export const WORKSPACE_FOLDER = "/workspace";
export const WORKSPACE_FILE = monaco.Uri.file("/dance.code-workspace");
export const DEFAULT_FILE = monaco.Uri.file(`${WORKSPACE_FOLDER}/playground.txt`);

const PLAYGROUND_CONTENT = `Welcome to Dance in the browser.

Press \` to switch to insert mode and start typing.
Press <Esc> to return to normal mode.

Dance is a Kakoune-inspired modal editor. Try the following:
  - h j k l       move the cursor (use arrow keys if you prefer)
  - w b           select word forward / backward
  - x             extend selection to full line(s)
  - %             select the entire buffer
  - s             "select" within current selections (filter regex)
  - "ay           yank into register a
  - "ap           paste from register a
  - mm            add a mark and jump back to it later
  - <space>       open the main Dance menu
  - g h           goto line start
  - g l           goto line end
  - <C-r>         then press a register key to view its contents

Look at the activity bar on the left → "Dance" pane shows registers and mode.
Drop a keybindings.json file using the upload box above to remap keys.

Have fun!
`;

const SECOND_FILE_CONTENT = `// A second buffer to demonstrate buffer switching.
// Use Ctrl-Tab or the editor tabs above.
function fibonacci(n) {
  if (n < 2) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(i, fibonacci(i));
}
`;

// VSCode ships a "JSON with comments" (jsonc) language mode: settings.json,
// keybindings.json, tsconfig.json, .vscode/extensions.json and friends are all
// jsonc. Including a sample under .vscode/settings.json shows the JSON
// language server picking it up automatically (associations are part of the
// language contribution from the JSON default extension).
const JSONC_SETTINGS_SAMPLE = `// VSCode-style JSON with comments (jsonc).
// Comments and trailing commas are tolerated by the parser.
{
  // The current theme — try changing it through the command palette.
  "workbench.colorTheme": "Default Dark Modern",

  /*
   * Block comments work too. The JSON language server still validates the
   * keys that are not commented out against the workspace settings schema.
   */
  "editor.fontSize": 14,
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "selection",
  "files.autoSave": "off",

  // Trailing commas are allowed in jsonc:
  "dance.enabled": true,
}
`;

export async function registerWorkspace(): Promise<void> {
  // Wires up `vscode-userdata://...` to IndexedDB so user settings,
  // keybindings, and workspace state persist across reloads. Must be done
  // before the configuration / keybindings services start reading.
  await createIndexedDBProviders();

  const provider = new RegisteredFileSystemProvider(false);
  provider.registerFile(new RegisteredMemoryFile(DEFAULT_FILE, PLAYGROUND_CONTENT));
  provider.registerFile(
    new RegisteredMemoryFile(
      monaco.Uri.file(`${WORKSPACE_FOLDER}/sample.js`),
      SECOND_FILE_CONTENT,
    ),
  );
  provider.registerFile(
    new RegisteredMemoryFile(
      monaco.Uri.file(`${WORKSPACE_FOLDER}/.vscode/settings.json`),
      JSONC_SETTINGS_SAMPLE,
    ),
  );
  provider.registerFile(
    new RegisteredMemoryFile(
      WORKSPACE_FILE,
      JSON.stringify({ folders: [{ path: WORKSPACE_FOLDER }] }, null, 2),
    ),
  );
  registerFileSystemOverlay(1, provider);
}
