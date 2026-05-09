// Observable view of "what is happening in the editor" that the trainer can
// subscribe to. Combines:
//   - The active Dance editor's mode (via Dance's exported API).
//   - The active Monaco editor's selections + model text.
//   - The Dance registers (read on demand).
//   - A log of every dispatched dance.* command (we wrap ICommandService
//     once at boot to record them).
//
// All reads are synchronous so the verifier can check goals immediately
// after a keystroke.

import * as monaco from "monaco-editor";
import { getService } from "@codingame/monaco-vscode-api";
import { ICommandService } from "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service";

import type { DanceMode, ObservedEditorState, Range } from "./types";

interface DancePerEditorState {
  readonly editor: monaco.editor.ICodeEditor & { document?: { uri: monaco.Uri } };
  readonly mode: { readonly name: string };
}

interface DanceEditors {
  readonly active: DancePerEditorState | undefined;
  readonly onModeDidChange: monaco.IEvent<DancePerEditorState>;
}

interface DanceRegisters {
  /** Returns the named register by case-sensitive name. */
  get?: (name: string) => unknown;
  /** Iterable of register entries. */
  readonly registers?: Iterable<unknown>;
}

interface DanceExtensionState {
  readonly editors: DanceEditors;
  readonly registers: DanceRegisters;
}

/* ------------------------------------------------------------------ */
/*  Command log                                                        */
/* ------------------------------------------------------------------ */

const commandLog: Array<{ id: string; args?: unknown; at: number }> = [];
const commandListeners = new Set<(entry: { id: string; args?: unknown; at: number }) => void>();

let commandHookInstalled = false;

async function installCommandHook(): Promise<void> {
  if (commandHookInstalled) return;
  commandHookInstalled = true;
  const cmd = (await getService(ICommandService)) as {
    executeCommand: (id: string, ...args: unknown[]) => Promise<unknown>;
  };
  const original = cmd.executeCommand.bind(cmd);
  cmd.executeCommand = async (id: string, ...args: unknown[]) => {
    if (id.startsWith("dance.")) {
      const entry = { id, args: args[0], at: performance.now() };
      commandLog.push(entry);
      // Cap to the last 1000 entries so a long session doesn't bloat memory.
      if (commandLog.length > 1000) commandLog.splice(0, commandLog.length - 1000);
      for (const fn of commandListeners) {
        try {
          fn(entry);
        } catch {
          /* swallow listener errors */
        }
      }
    }
    return original(id, ...args);
  };
}

export function ensureCommandTracking(): Promise<void> {
  return installCommandHook();
}

export function onDanceCommand(
  listener: (entry: { id: string; args?: unknown; at: number }) => void,
): () => void {
  commandListeners.add(listener);
  return () => commandListeners.delete(listener);
}

export function getCommandLog(): ReadonlyArray<{ id: string; args?: unknown; at: number }> {
  return commandLog;
}

export function clearCommandLog(): void {
  commandLog.length = 0;
}

/* ------------------------------------------------------------------ */
/*  Dance state                                                        */
/* ------------------------------------------------------------------ */

let danceState: DanceExtensionState | undefined;

export async function ensureDanceHandle(): Promise<DanceExtensionState | undefined> {
  if (danceState) return danceState;
  const vscode = await import("vscode");
  let ext = vscode.extensions.getExtension("gregoire.dance");
  for (let i = 0; i < 30 && !ext; i++) {
    await new Promise((r) => setTimeout(r, 100));
    ext = vscode.extensions.getExtension("gregoire.dance");
  }
  if (!ext) return undefined;
  const exports = (ext.isActive ? ext.exports : await ext.activate()) as
    | { extension?: DanceExtensionState }
    | undefined;
  danceState = exports?.extension;
  return danceState;
}

/* ------------------------------------------------------------------ */
/*  Observed snapshot                                                  */
/* ------------------------------------------------------------------ */

function activeEditor(): monaco.editor.ICodeEditor | undefined {
  const editors = monaco.editor.getEditors();
  if (!editors.length) return undefined;
  for (let i = editors.length - 1; i >= 0; i--) {
    const ed = editors[i];
    if ((ed as monaco.editor.ICodeEditor).hasTextFocus?.()) return ed;
  }
  return editors[editors.length - 1];
}

export function snapshot(): ObservedEditorState {
  const ed = activeEditor();
  const model = ed?.getModel();
  // Monaco selections are 1-based; the lesson DSL is 0-based to match the
  // dance-training reference. We convert here.
  const selections: Range[] = (ed?.getSelections() ?? []).map((s) => ({
    anchor: { line: s.selectionStartLineNumber - 1, col: s.selectionStartColumn - 1 },
    active: { line: s.positionLineNumber - 1, col: s.positionColumn - 1 },
  }));
  const mode = (danceState?.editors.active?.mode.name as DanceMode | undefined) ?? "normal";
  const registers = readRegisters();
  return {
    text: model?.getValue() ?? "",
    selections,
    mode,
    registers,
    commandLog: commandLog,
  };
}

function readRegisters(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!danceState?.registers) return out;
  // Dance's Registers exposes a `registers` iterable of Register objects with
  // `.name` and an async `getValues()` (resolved). The synchronous picture
  // we surface here is best-effort: we read the cached `_values` if present.
  try {
    const all = (danceState.registers as { registers?: Iterable<unknown> }).registers;
    if (all && typeof (all as Iterable<unknown>)[Symbol.iterator] === "function") {
      for (const reg of all as Iterable<{ name?: string; _values?: string[] }>) {
        if (reg.name && Array.isArray(reg._values)) {
          out[reg.name] = reg._values;
        }
      }
    }
  } catch {
    /* fall through */
  }
  return out;
}
