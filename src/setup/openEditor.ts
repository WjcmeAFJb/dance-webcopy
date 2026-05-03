// Fallback handler for "open new editor" requests from VSCode actions that
// can't find a host. We just no-op return null so the views service knows
// the request wasn't handled — Dance and the editor parts handle their own
// editor opening, so this hook only fires in pathological cases.

import type { IReference, IResolvedTextEditorModel } from "@codingame/monaco-vscode-views-service-override";
import type * as monaco from "monaco-editor";

export type OpenEditorFn = (
  modelRef: IReference<IResolvedTextEditorModel>,
  options: monaco.editor.IEditorOptions | undefined,
  sideBySide: boolean | undefined,
) => Promise<monaco.editor.ICodeEditor | undefined>;

export const openNewCodeEditor: OpenEditorFn = async () => undefined;
