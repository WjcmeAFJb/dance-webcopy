// Keybinding lookup for the trainer.
//
// Given a Dance command id, return the key sequence the user would press to
// invoke it. We resolve in this priority:
//   1. The current user keybindings.json (uploaded or seeded), parsed as JSONC.
//   2. Dance's default keybindings from its package.json (vendored as JSON).
// Negation entries (`"-someCommand"`) suppress matching defaults.
//
// We deliberately keep the matching logic simple: only `dance.mode == 'normal'`
// (or no when-clause) is treated as in-scope. The dance-training repo has a
// full when-clause evaluator; for the trainer it is enough to pick the first
// reasonable match — the lessons we ship are normal-mode focused.

import { parse as parseJsonc } from "jsonc-parser";
import danceDefaults from "./dance-default-keybindings";

import type { DanceMode } from "./types";

export interface KeyChord {
  /** "ctrl", "alt", "shift", "meta" — matches VSCode's spelling. */
  modifiers: ReadonlyArray<"ctrl" | "alt" | "shift" | "meta">;
  /** The base key, lowercased ("k", "escape", "f1", "tab", ";", " "). */
  key: string;
}

export interface ResolvedBinding {
  command: string;
  /** Sequence — multi-chord bindings have `length > 1` (e.g. "g g"). */
  sequence: KeyChord[];
  /** Original "key" string from VSCode for tooltip display. */
  raw: string;
  /** When-clause string (kept for display; we don't fully evaluate it). */
  when?: string;
  /** True if this is a `-command` negation entry. */
  isNegation: boolean;
  /** Hint when a `dance.run` wraps another command via `args.command`. */
  args?: unknown;
}

interface RawKeybinding {
  key: string;
  command: string;
  when?: string;
  args?: unknown;
}

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

function parseKey(raw: string): KeyChord[] {
  // VSCode key strings: "ctrl+shift+k" or chord "ctrl+k ctrl+s".
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseChord);
}

function parseChord(chord: string): KeyChord {
  const parts = chord.split("+").map((p) => p.trim());
  const modifiers: Array<"ctrl" | "alt" | "shift" | "meta"> = [];
  let key = "";
  for (const p of parts) {
    const low = p.toLowerCase();
    if (low === "ctrl" || low === "control") modifiers.push("ctrl");
    else if (low === "alt" || low === "option") modifiers.push("alt");
    else if (low === "shift") modifiers.push("shift");
    else if (low === "meta" || low === "cmd" || low === "win") modifiers.push("meta");
    else key = low;
  }
  return { modifiers, key };
}

function parseBindings(raw: RawKeybinding[]): ResolvedBinding[] {
  return raw.map<ResolvedBinding>((b) => ({
    raw: b.key,
    when: b.when,
    args: b.args,
    isNegation: b.command.startsWith("-"),
    command: b.command.startsWith("-") ? b.command.slice(1) : b.command,
    sequence: parseKey(b.key),
  }));
}

const danceDefaultsParsed = parseBindings(danceDefaults as RawKeybinding[]);

let userBindings: ResolvedBinding[] = [];

export function setUserKeybindings(jsonc: string): void {
  if (!jsonc.trim()) {
    userBindings = [];
    return;
  }
  try {
    const parsed = parseJsonc(jsonc, [], { allowTrailingComma: true });
    if (!Array.isArray(parsed)) {
      userBindings = [];
      return;
    }
    userBindings = parseBindings(parsed as RawKeybinding[]);
  } catch {
    // Leave the previous user bindings in place if the upload was malformed.
  }
}

/* ------------------------------------------------------------------ */
/*  Lookup                                                             */
/* ------------------------------------------------------------------ */

/**
 * Resolve the key sequence the user should press to invoke `command`.
 * Returns `undefined` if the command has no binding (or is suppressed by a
 * negation entry).
 */
export function lookupKeyFor(
  command: string,
  mode: DanceMode = "normal",
): ResolvedBinding | undefined {
  // 1. User-configured bindings override defaults — including negations.
  const userMatches = userBindings.filter((b) => matchesCommand(b, command));
  if (userMatches.some((b) => b.isNegation && whenMatchesMode(b.when, mode))) {
    // Explicitly disabled.
    return undefined;
  }
  const userPositive = userMatches.find(
    (b) => !b.isNegation && whenMatchesMode(b.when, mode),
  );
  if (userPositive) return userPositive;

  // 2. Defaults, but only those NOT suppressed by a user `-command` entry
  //    matching the same key-sequence.
  return danceDefaultsParsed.find((b) => {
    if (b.isNegation) return false;
    if (b.command !== command) return false;
    if (!whenMatchesMode(b.when, mode)) return false;
    // If the user added a `-cmd` for the same key & command, the default is
    // suppressed.
    if (
      userBindings.some(
        (u) =>
          u.isNegation && u.command === command && u.raw.toLowerCase() === b.raw.toLowerCase(),
      )
    ) {
      return false;
    }
    return true;
  });
}

function matchesCommand(b: ResolvedBinding, command: string): boolean {
  return b.command === command;
}

function whenMatchesMode(when: string | undefined, mode: DanceMode): boolean {
  if (!when) return true;
  // Cheap parser: accept any when clause that mentions our mode (or doesn't
  // mention dance.mode at all).
  const m = when.match(/dance\.mode\s*==\s*['"]([^'"]+)['"]/);
  if (!m) return true;
  return m[1] === mode;
}

/* ------------------------------------------------------------------ */
/*  Display                                                            */
/* ------------------------------------------------------------------ */

const PRINTABLE_KEY_LABELS: Record<string, string> = {
  escape: "Esc",
  enter: "↵",
  tab: "Tab",
  backspace: "⌫",
  delete: "Del",
  space: "␣",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  home: "Home",
  end: "End",
  pageup: "PgUp",
  pagedown: "PgDn",
};

export function chordLabels(chord: KeyChord): string[] {
  const labels: string[] = [];
  for (const mod of chord.modifiers) {
    labels.push(mod === "meta" ? "⌘" : mod === "alt" ? "⌥" : mod === "ctrl" ? "Ctrl" : "Shift");
  }
  const k = chord.key;
  if (k in PRINTABLE_KEY_LABELS) {
    labels.push(PRINTABLE_KEY_LABELS[k]);
  } else if (k.length === 1) {
    labels.push(k.toUpperCase());
  } else {
    labels.push(k);
  }
  return labels;
}
