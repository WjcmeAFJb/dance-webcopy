// TreeDataProvider for the "Mode" view in the Dance sidebar pane.
//
// We tap into Dance's exported API to get a strongly-typed handle on the
// current PerEditorState and its Mode. From there we surface live updates via
// `Editors.onModeDidChange`, plus active document, selection count, and a
// peek of the primary cursor.

import type * as vscode from "vscode";

interface DanceMode {
  readonly name: string;
  readonly cursorStyle?: number;
  readonly selectionBehavior?: number;
}

interface DancePerEditorState {
  readonly editor: vscode.TextEditor;
  readonly mode: DanceMode;
  readonly isActive: boolean;
}

interface DanceEditors {
  readonly active: DancePerEditorState | undefined;
  readonly onModeDidChange: vscode.Event<DancePerEditorState>;
}

interface DanceExtensionState {
  readonly editors: DanceEditors;
}

interface DanceExports {
  readonly extension: DanceExtensionState;
  readonly api: unknown;
}

type ModeNode =
  | { kind: "header"; label: string; description?: string }
  | { kind: "field"; label: string; value: string; iconId?: string };

export function createModeView(vsc: typeof vscode): {
  registerProviderWith(api: typeof vscode): void;
  dispose(): void;
} {
  const onDidChangeTreeData = new vsc.EventEmitter<ModeNode | undefined>();
  const subscriptions: vscode.Disposable[] = [];
  let dance: DanceExtensionState | undefined;

  const provider: vscode.TreeDataProvider<ModeNode> = {
    onDidChangeTreeData: onDidChangeTreeData.event,
    getTreeItem(node) {
      if (node.kind === "header") {
        const item = new vsc.TreeItem(node.label, vsc.TreeItemCollapsibleState.None);
        item.description = node.description;
        item.iconPath = new vsc.ThemeIcon("circle-large-filled");
        item.contextValue = "danceMode.header";
        return item;
      }
      const item = new vsc.TreeItem(node.label, vsc.TreeItemCollapsibleState.None);
      item.description = node.value;
      if (node.iconId) {
        item.iconPath = new vsc.ThemeIcon(node.iconId);
      }
      return item;
    },
    async getChildren() {
      const editor = dance?.editors.active;
      if (editor === undefined) {
        return [
          { kind: "header", label: "No active editor", description: "open a buffer" },
        ];
      }
      const document = editor.editor.document;
      const selections = editor.editor.selections;
      const primary = selections[0];
      const fileName = document.uri.path.split("/").pop() ?? document.uri.path;
      const cursor = primary
        ? `${primary.active.line + 1}:${primary.active.character + 1}`
        : "—";

      const cursorStyle = describeCursorStyle(editor.mode.cursorStyle);
      const selBehavior = describeSelectionBehavior(editor.mode.selectionBehavior);

      const nodes: ModeNode[] = [
        { kind: "header", label: editor.mode.name, description: "current mode" },
        { kind: "field", label: "Document", value: fileName, iconId: "file" },
        { kind: "field", label: "Selections", value: String(selections.length), iconId: "selection" },
        { kind: "field", label: "Primary cursor", value: cursor, iconId: "location" },
      ];
      if (cursorStyle) {
        nodes.push({ kind: "field", label: "Cursor style", value: cursorStyle, iconId: "edit" });
      }
      if (selBehavior) {
        nodes.push({ kind: "field", label: "Selection behavior", value: selBehavior, iconId: "list-selection" });
      }
      return nodes;
    },
  };

  function attach(api: typeof vscode): void {
    const setup = async () => {
      // Dance may activate slightly after our companion runs. Poll briefly
      // until the extension entry is registered, then await its activation.
      let ext = api.extensions.getExtension("gregoire.dance");
      for (let i = 0; ext == null && i < 20; i++) {
        await new Promise((r) => setTimeout(r, 100));
        ext = api.extensions.getExtension("gregoire.dance");
      }
      if (ext == null) {
        console.warn(
          "[dance-web] gregoire.dance extension never appeared. Visible extensions:",
          api.extensions.all.map((e) => e.id),
        );
        return;
      }
      const exports = (ext.isActive ? ext.exports : await ext.activate()) as
        | DanceExports
        | undefined;
      if (!exports?.extension) {
        console.warn("[dance-web] dance.exports.extension missing", exports);
        return;
      }
      dance = exports.extension;
      onDidChangeTreeData.fire(undefined);

      subscriptions.push(
        dance.editors.onModeDidChange(() => onDidChangeTreeData.fire(undefined)),
        api.window.onDidChangeActiveTextEditor(() => onDidChangeTreeData.fire(undefined)),
        api.window.onDidChangeTextEditorSelection(() => onDidChangeTreeData.fire(undefined)),
      );
    };
    setup().catch((err) => console.error("[dance-web] mode view attach failed", err));
  }

  return {
    registerProviderWith(api) {
      subscriptions.push(api.window.registerTreeDataProvider("danceMode", provider));
      attach(api);
    },
    dispose() {
      onDidChangeTreeData.dispose();
      while (subscriptions.length > 0) {
        subscriptions.pop()?.dispose();
      }
    },
  };
}

function describeCursorStyle(style: number | undefined): string | undefined {
  switch (style) {
    case 1: return "Line";
    case 2: return "Block";
    case 3: return "Underline";
    case 4: return "LineThin";
    case 5: return "BlockOutline";
    case 6: return "UnderlineThin";
    default: return undefined;
  }
}

function describeSelectionBehavior(b: number | undefined): string | undefined {
  switch (b) {
    case 1: return "Caret";
    case 2: return "Character";
    default: return undefined;
  }
}
