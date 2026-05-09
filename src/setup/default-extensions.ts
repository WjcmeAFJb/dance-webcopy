// Eagerly-loaded VSCode default extensions.
//
// Each `?` import below has a top-level `registerExtension(...)` call that
// must run BEFORE the workbench scans the extension registry — otherwise
// the contributions (languages, grammars, file associations, schemas) are
// missing when models are loaded and files like `.vscode/settings.json`
// fall back to `plaintext`.
//
// `import "..."` (bare side-effect form) is preferred here so that future
// codebase migrations don't accidentally tree-shake these.

import "@codingame/monaco-vscode-theme-defaults-default-extension";

// JSON language: contributes the `json` and `jsonc` language definitions
// (extensions, filename patterns, configuration) plus tmLanguage grammars.
import "@codingame/monaco-vscode-json-default-extension";

// JSON language *features* (server-backed completions, validation, hover):
// the extension form runs through the workbench extension host. The
// standalone variant (`monaco-vscode-standalone-json-language-features`) is
// version-pinned to a different `@codingame/monaco-vscode-editor-api`, which
// causes "Another version of monaco-vscode-api has already been loaded" when
// mixed; stick with the extension form here.
import "@codingame/monaco-vscode-json-language-features-default-extension";
