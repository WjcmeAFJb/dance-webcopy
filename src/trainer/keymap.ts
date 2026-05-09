// Keybinding lookup for the trainer.
//
// Given a Dance command id, return the key sequence the user would press to
// invoke it. We resolve in this priority:
//   1. The current user keybindings.json (uploaded or seeded), parsed as JSONC.
//   2. Dance's default keybindings from its package.json (vendored as JSON).
// Negation entries (`"-someCommand"`) suppress matching defaults.
//
// Two "fancy" features beyond a literal command match:
//
//  • **dance.run heuristic** — many dance-training bindings use `dance.run`
//    with `args.commands` (a list of `[".sub.command", { ... }]` tuples) or
//    `args.code` (a JS string that calls `vscode.commands.executeCommand`).
//    We expand each binding's `dispatchedCommands` so `dance.select.down.jump`
//    matches a binding whose `args.code` contains
//    `executeCommand('dance.select.down.jump')`.
//
//  • **Layout-independent codes** — VSCode lets keybindings reference physical
//    scan codes (`[KeyK]`, `[Digit1]`, `[Comma]`). We render those as the
//    canonical character ("K", "1", ",") so the chip looks like a real key.

import { parse as parseJsonc } from "jsonc-parser";
import danceDefaults from "./dance-default-keybindings";
import { DANCE_COMMANDS } from "./dance-commands";

import type { DanceMode } from "./types";

/* ------------------------------------------------------------------ */
/*  Kakoune-canonical → Dance command id mapping                       */
/* ------------------------------------------------------------------ */

// Lessons reference Kakoune-canonical action ids (`kak.normal.edit.yank.delete`)
// in their `teaches` lists and in `{{action:...}}` narration tokens. Dance's
// own command ids (`dance.edit.yank-delete`) don't follow a 1:1 textual rule,
// so we look them up via the canonical `DANCE_COMMANDS` table that ships with
// dance-training. Multiple Dance commands can claim the same `kak.*` id; we
// keep the first one — it's typically the canonical jump form, with extend
// variants listed afterwards.
const KAK_TO_DANCE: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const c of DANCE_COMMANDS) {
    if (c.kak && !m.has(c.kak)) m.set(c.kak, c.id);
  }
  return m;
})();

export function resolveCommand(id: string): string {
  // Already a Dance command id.
  if (id.startsWith("dance.")) return id;
  // Kakoune-canonical → Dance id.
  const mapped = KAK_TO_DANCE.get(id);
  if (mapped) return mapped;
  // Heuristic fallback for the simple movement family.
  if (/^kak\.normal\.select\.(left|down|up|right)$/.test(id)) {
    return id.replace(/^kak\.normal\.select\.(\w+)$/, "dance.select.$1.jump");
  }
  return id;
}

/**
 * Sibling Dance commands that share a key with `command`. For example, the
 * lesson catalog references `dance.edit.paste.after`, which has no default
 * keybinding — the user actually presses the same `P` key that Dance binds
 * to `dance.edit.paste.after.select` (the post-paste-select variant). We try
 * the bare command first, then `*.select`, then `*.jump`, etc.
 */
function commandVariants(command: string): string[] {
  const variants = [command];
  if (!command.endsWith(".select")) variants.push(`${command}.select`);
  if (!command.endsWith(".jump")) variants.push(`${command}.jump`);
  // Some `.extend` ↔ `.jump` toggles share keys (e.g. for line motions).
  if (command.endsWith(".extend")) variants.push(command.slice(0, -".extend".length));
  if (command.endsWith(".jump")) variants.push(command.slice(0, -".jump".length));
  return variants;
}

export interface KeyChord {
  /** "ctrl", "alt", "shift", "meta" — matches VSCode's spelling. */
  modifiers: ReadonlyArray<"ctrl" | "alt" | "shift" | "meta">;
  /** Resolved key. Either a typed character ("k"), a named key ("escape"),
   *  or a layout-independent scan code ({ kind: "code", code: "KeyK" }). */
  key:
    | { kind: "char"; char: string }
    | { kind: "named"; name: string }
    | { kind: "code"; code: string };
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
  /**
   * For `dance.run` bindings, the underlying commands the wrapper actually
   * dispatches. For everything else, this is just `[command]`. The lookup
   * matches against this list, so a `dance.run` binding whose args invoke
   * `dance.select.down.jump` will be returned when the trainer asks for
   * that command.
   */
  dispatchedCommands: readonly string[];
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

const MOD_ALIASES: Record<string, "ctrl" | "alt" | "shift" | "meta"> = {
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  shift: "shift",
  meta: "meta",
  cmd: "meta",
  win: "meta",
};

const NAMED_KEYS = new Set([
  "escape",
  "enter",
  "tab",
  "backspace",
  "delete",
  "space",
  "up",
  "down",
  "left",
  "right",
  "home",
  "end",
  "pageup",
  "pagedown",
  "insert",
  "capslock",
]);
for (let i = 1; i <= 24; i++) NAMED_KEYS.add(`f${i}`);

const BRACKET_RE = /^\[(.+)\]$/;

function parseChord(input: string): KeyChord {
  if (!input) {
    return { modifiers: [], key: { kind: "char", char: "" } };
  }
  const tokens = input.split("+");
  const modifiers: Array<"ctrl" | "alt" | "shift" | "meta"> = [];
  let keyToken = "";
  for (let i = 0; i < tokens.length; i++) {
    const tok = (tokens[i] ?? "").trim();
    if (i === tokens.length - 1) {
      keyToken = tok;
      break;
    }
    const alias = MOD_ALIASES[tok.toLowerCase()];
    if (alias && !modifiers.includes(alias)) modifiers.push(alias);
  }

  // Bracketed scan code: [KeyK], [Digit1], [Comma], ...
  const m = keyToken.match(BRACKET_RE);
  if (m) {
    return { modifiers, key: { kind: "code", code: m[1]! } };
  }

  const lower = keyToken.toLowerCase();
  if (NAMED_KEYS.has(lower)) {
    return { modifiers, key: { kind: "named", name: lower } };
  }

  // Single-character key. VSCode is case-insensitive for single letters in
  // keybinding strings — `"H"` matches the same key as `"h"`, NOT `Shift+H`.
  // So we don't infer a shift modifier from uppercase here.
  if (keyToken.length === 1) {
    return { modifiers, key: { kind: "char", char: keyToken.toLowerCase() } };
  }

  // Fallback: treat as a named key by lowercased text.
  return { modifiers, key: { kind: "named", name: lower || "?" } };
}

function parseSequence(raw: string): KeyChord[] {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseChord);
}

/* ------------------------------------------------------------------ */
/*  dance.run heuristic                                                */
/* ------------------------------------------------------------------ */

// VSCode actions that several dance-training bindings fall through to for
// motions; rewrite them to the closest Dance equivalent so the trainer can
// match them when the lesson asks for the Dance command name.
const VSCODE_TO_DANCE: Record<string, string> = {
  cursorDown: "dance.select.down.jump",
  cursorUp: "dance.select.up.jump",
  cursorLeft: "dance.select.left.jump",
  cursorRight: "dance.select.right.jump",
  cursorDownSelect: "dance.select.down.extend",
  cursorUpSelect: "dance.select.up.extend",
  cursorLeftSelect: "dance.select.left.extend",
  cursorRightSelect: "dance.select.right.extend",
  cursorHome: "dance.select.lineStart",
  cursorEnd: "dance.select.lineEnd",
  cursorTop: "dance.select.firstLine.jump",
  cursorBottom: "dance.select.lastLine.jump",
  cursorWordLeft: "dance.seek.word.backward",
  cursorWordRight: "dance.seek.word",
  cursorWordEndRight: "dance.seek.wordEnd",
  cursorPageUp: "dance.select.firstVisibleLine.jump",
  cursorPageDown: "dance.select.lastVisibleLine.jump",
  undo: "dance.history.undo",
  redo: "dance.history.redo",
};

const EXECUTE_CMD_RE = /executeCommand\s*\(\s*['"`]([^'"`]+)['"`]/g;

function computeDispatchedCommands(command: string, args: unknown): string[] {
  // Always include the literal command first so direct-binding lookups still
  // work even before we look at dance.run wrappers.
  const out: string[] = [command];
  if (command !== "dance.run") return out;
  if (typeof args !== "object" || args === null) return out;
  const a = args as { command?: unknown; commands?: unknown; code?: unknown };

  if (typeof a.command === "string") {
    const id = a.command.startsWith(".") ? `dance${a.command}` : a.command;
    out.push(VSCODE_TO_DANCE[id] ?? id);
  }

  if (Array.isArray(a.commands)) {
    for (const entry of a.commands) {
      if (Array.isArray(entry) && typeof entry[0] === "string") {
        const id = entry[0].startsWith(".") ? `dance${entry[0]}` : entry[0];
        out.push(VSCODE_TO_DANCE[id] ?? id);
      } else if (typeof entry === "string") {
        const id = entry.startsWith(".") ? `dance${entry}` : entry;
        out.push(VSCODE_TO_DANCE[id] ?? id);
      }
    }
  }

  if (a.code !== undefined) {
    const code = Array.isArray(a.code) ? a.code.join("\n") : String(a.code);
    EXECUTE_CMD_RE.lastIndex = 0;
    for (let m = EXECUTE_CMD_RE.exec(code); m !== null; m = EXECUTE_CMD_RE.exec(code)) {
      const id = m[1]!;
      out.push(VSCODE_TO_DANCE[id] ?? id);
    }
  }

  return Array.from(new Set(out));
}

/* ------------------------------------------------------------------ */
/*  Top-level parse                                                    */
/* ------------------------------------------------------------------ */

function parseBindings(raw: RawKeybinding[]): ResolvedBinding[] {
  const out: ResolvedBinding[] = [];
  for (const b of raw) {
    if (!b || typeof b.key !== "string" || typeof b.command !== "string") continue;
    try {
      const isNegation = b.command.startsWith("-");
      const command = isNegation ? b.command.slice(1) : b.command;
      out.push({
        raw: b.key,
        when: b.when,
        args: b.args,
        isNegation,
        command,
        sequence: parseSequence(b.key),
        dispatchedCommands: computeDispatchedCommands(command, b.args),
      });
    } catch {
      // Malformed entry — skip silently; the upload's syntax check elsewhere
      // already surfaces parse problems to the user.
    }
  }
  return out;
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
    // Leave previous bindings in place if the upload was malformed.
  }
}

/* ------------------------------------------------------------------ */
/*  Lookup                                                             */
/* ------------------------------------------------------------------ */

/**
 * Resolve the key sequence the user should press to invoke `command`.
 *
 * Negation semantics mirror VSCode: a `-command` entry removes ONLY the
 * default whose `(key, command)` pair matches it; it does not "globally
 * disable" the command. So if the user negates `h → dance.select.left.jump`
 * but adds a new `[KeyN] → dance.run` (whose code dispatches the same
 * command), the trainer should display the `[KeyN]` chip — that is what the
 * user actually presses.
 *
 * Returns `undefined` only when there are no positive bindings at all (user
 * or default) for the command in this mode.
 */
export function lookupKeyFor(
  command: string,
  mode: DanceMode = "normal",
): ResolvedBinding | undefined {
  for (const variant of commandVariants(command)) {
    const hit = lookupKeyExact(variant, mode);
    if (hit) return hit;
  }
  return undefined;
}

function lookupKeyExact(
  command: string,
  mode: DanceMode,
): ResolvedBinding | undefined {
  // 1. User positive bindings whose `when` is satisfiable in `mode` and that
  //    don't require some overlay (whichkey / vspacecode / jumpy2 jump-mode).
  const userPositives = userBindings.filter(
    (b) =>
      !b.isNegation &&
      bindingDispatches(b, command) &&
      whenMatchesMode(b.when, mode) &&
      !whenIsImpossible(b.when),
  );
  if (userPositives.length > 0) {
    return rankBindings(userPositives)[0];
  }

  // 2. Dance defaults, excluding ones negated by the user for the same key.
  const negatedKeys = new Set(
    userBindings
      .filter(
        (u) =>
          u.isNegation && u.command === command && whenMatchesMode(u.when, mode),
      )
      .map((u) => u.raw.toLowerCase()),
  );
  const defaultMatches = danceDefaultsParsed.filter(
    (b) =>
      !b.isNegation &&
      bindingDispatches(b, command) &&
      whenMatchesMode(b.when, mode) &&
      !negatedKeys.has(b.raw.toLowerCase()),
  );
  return rankBindings(defaultMatches)[0];
}

/**
 * Display-rank bindings: prefer single-chord, char-key bindings (the keys
 * the user's hand goes to first) over multi-chord and dance.run wrappers.
 */
function rankBindings(bindings: ResolvedBinding[]): ResolvedBinding[] {
  return [...bindings].sort((a, b) => keyRank(a) - keyRank(b));
}

function keyRank(b: ResolvedBinding): number {
  // Direct command (not dance.run) outranks indirect wrappers.
  const direct = b.command !== "dance.run" ? 0 : 1;
  // Single-chord outranks multi-chord.
  const lengthRank = b.sequence.length === 1 ? 0 : 2;
  // Within single-chord: prefer code keys (layout-independent; render as
  // the canonical letter regardless of layout) > char > named.
  const head = b.sequence[0]?.key;
  let kindRank = 3;
  if (b.sequence.length === 1 && head) {
    if (head.kind === "code") kindRank = 0;
    else if (head.kind === "char") kindRank = 1;
    else kindRank = 2;
  }
  return lengthRank * 4 + kindRank * 2 + direct;
}

function bindingDispatches(b: ResolvedBinding, command: string): boolean {
  return b.dispatchedCommands.includes(command) || b.command === command;
}

/** Debug helper used by smoke tests + DevTools. Returns counts and matches. */
export function debugLookup(command: string, mode: DanceMode = "normal"): unknown {
  return {
    userBindingCount: userBindings.length,
    defaultsBindingCount: danceDefaultsParsed.length,
    userMatches: userBindings
      .filter((b) => bindingDispatches(b, command))
      .map((b) => ({
        raw: b.raw,
        command: b.command,
        isNegation: b.isNegation,
        whenMatches: whenMatchesMode(b.when, mode),
        whenImpossible: whenIsImpossible(b.when),
        when: b.when,
        dispatched: b.dispatchedCommands,
      }))
      .slice(0, 20),
    defaultMatches: danceDefaultsParsed
      .filter((b) => bindingDispatches(b, command))
      .map((b) => ({ raw: b.raw, when: b.when }))
      .slice(0, 5),
  };
}

function whenMatchesMode(when: string | undefined, mode: DanceMode): boolean {
  if (!when) return true;
  const m = when.match(/dance\.mode\s*==\s*['"]([^'"]+)['"]/);
  if (!m) return true;
  return m[1] === mode;
}

/** Reject when-clauses that require modes/contexts we never enter (jumpy
 *  jump-mode, whichkey, etc.) — the trainer should still pick the binding
 *  that fires under normal editor focus. */
function whenIsImpossible(when: string | undefined): boolean {
  if (!when) return false;
  // Bindings that require an active jumpy/whichkey overlay etc. fire only
  // inside that overlay. They are never the "first chord you press from
  // normal editing", so we skip them in the trainer's display lookup.
  return /(?:^|[^!])\b(?:jumpy2\.jump-mode|jumpy2\.isActive|whichkey(?:Visible|Active)|vspacecodeVisible)\b/.test(
    when,
  );
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
  insert: "Ins",
  capslock: "Caps",
};

const SCANCODE_LABELS: Record<string, string> = {
  Backquote: "`",
  Backslash: "\\",
  BracketLeft: "[",
  BracketRight: "]",
  Comma: ",",
  Equal: "=",
  IntlBackslash: "\\",
  IntlRo: "ろ",
  IntlYen: "¥",
  Minus: "-",
  Period: ".",
  Quote: "'",
  Semicolon: ";",
  Slash: "/",
  Space: "␣",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
  Enter: "↵",
  Tab: "Tab",
  Backspace: "⌫",
  Delete: "Del",
  Home: "Home",
  End: "End",
  PageUp: "PgUp",
  PageDown: "PgDn",
};

export function chordLabels(chord: KeyChord): string[] {
  const labels: string[] = [];
  for (const mod of chord.modifiers) {
    labels.push(mod === "meta" ? "⌘" : mod === "alt" ? "⌥" : mod === "ctrl" ? "Ctrl" : "Shift");
  }
  const k = chord.key;
  if (k.kind === "named") {
    labels.push(PRINTABLE_KEY_LABELS[k.name] ?? k.name);
  } else if (k.kind === "code") {
    labels.push(scancodeLabel(k.code));
  } else {
    labels.push(k.char.length === 1 ? k.char.toUpperCase() : k.char);
  }
  return labels;
}

function scancodeLabel(code: string): string {
  // Fast paths first for the most common physical-letter / digit codes.
  if (/^Key([A-Z])$/.test(code)) return code.slice(3);
  if (/^Digit(\d)$/.test(code)) return code.slice(5);
  if (/^Numpad(\d)$/.test(code)) return code.slice(6);
  return SCANCODE_LABELS[code] ?? code;
}
