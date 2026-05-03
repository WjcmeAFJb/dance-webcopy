# Dance in the browser

A reusable React component that embeds **[Dance]** (a Kakoune-inspired modal-editing
extension for VSCode) into a Monaco editor running entirely in the browser, on top of
**[`@codingame/monaco-vscode-api`]**.

The interesting bits:

- A real VSCode workbench (activity bar, sidebar, editor, status bar) rendered into
  React refs via `attachPart`.
- The Dance `.vsix` is loaded as a built-in extension at build time by
  `@codingame/monaco-vscode-rollup-vsix-plugin`. All of Dance — registers, marks,
  modes, menus, `dance.run`, motions, the registers TreeView — comes along with it.
- A small companion extension contributes a "Mode" `TreeView` that lives next to
  Dance's "Registers" view in the same activity-bar pane. Both views render through
  the standard VSCode views API; there is no ad-hoc React UI for them.
- `keybindings.json` is editable at runtime: drop a file on the upload box and the
  user keybindings are replaced via VSCode's
  `updateUserKeybindings(json)`.

[Dance]: https://github.com/71/dance
[`@codingame/monaco-vscode-api`]: https://github.com/CodinGame/monaco-vscode-api

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # static bundle in dist/
npm run preview  # serve dist/ on http://localhost:4173/
```

## Smoke test

A headless playwright script drives the editor end-to-end:

```bash
npm run dev &
node scripts/smoke.mjs
```

It validates: editor mounts, Dance mode segment shows, `i`/`Esc` flips modes, word
motion (`w`), `%` selects the buffer, registers populate after `"ay`, `dance.run`
executes a JS payload, and a runtime keybindings.json upload is honored.

## Using the component

```tsx
import { DanceEditor } from "./components/DanceEditor";

export default function App() {
  const editorRef = useRef<DanceEditorHandle>(null);
  return (
    <DanceEditor
      ref={editorRef}
      initialKeybindings="[]"
      onReady={() => console.log("ready")}
    />
  );
}

// Replace user keybindings.json from a string:
await editorRef.current?.setKeybindings(jsonText);
```

`<DanceEditor>` mounts at most once per page (the underlying VSCode workbench is a
process-wide singleton).

## Architecture

```
src/
  main.tsx                 # React entry; installs window.__dance for testing
  App.tsx                  # Page chrome + upload UI
  components/
    DanceEditor.tsx        # The reusable component; renders refs, attaches parts
    UploadKeybindings.tsx  # Drag-and-drop + file picker for keybindings.json
  setup/
    workers.ts             # eager `window.MonacoEnvironment` + Vite ?worker imports
    services.ts            # service overrides for the workbench
    workspace.ts           # in-memory filesystem + IndexedDB userdata
    keybindings.ts         # initUserKeybindings / updateUserKeybindings
    extensions.ts          # registers Dance vsix + companion
    initialize.ts          # single-flight bootstrap (called from DanceEditor)
  companion/
    manifest.ts            # contributes "Mode" view to Dance's container
    mode-view.ts           # TreeDataProvider that taps Dance's exported API
extensions/
  dance.vsix               # built from the upstream `dance` source (v0.5.16)
samples/
  keybindings.json         # included sample (the user's "Reset" target)
```

## Why some things are the way they are

- **`enableWorkerExtensionHost: false`** in `services.ts`. The web-worker host runs
  extensions in an iframe whose `MonacoEnvironment` is hard to share; falling back
  to the local-process host avoids that wiring and Dance has no need to be off the
  main thread.
- **`document.documentElement` to the layout-service-override**. The default
  `LayoutService.layout()` calls `getClientArea(this.mainContainer)` without a
  fallback dimension; passing `<html>` instead of `<body>` makes that call take
  the cheap `element.clientWidth/Height` branch and never throw.
- **`?worker` for every Monaco/VSCode worker** in `setup/workers.ts`. Vite resolves
  bare specifiers in `?worker` imports and emits separate worker chunks in both
  dev and build, where `new URL("@codingame/...", import.meta.url)` only works in
  dev (via `esbuild-import-meta-url-plugin`).
- **`minmax(0, 1fr)` and `overflow: hidden`** in the DanceEditor grid. The VSCode
  editor part self-reports an intrinsic content height that, in plain `1fr`,
  inflates the grid cell to thousands of pixels.
