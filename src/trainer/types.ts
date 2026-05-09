// Lesson DSL types — ported from `../dance-training/src/lessons/types.ts`,
// stripped of references to the emulator. Lessons run against the real Dance
// extension here, so EditorState comes from observing Monaco + Dance directly.

export type DanceMode =
  | "normal"
  | "insert"
  | "select"
  | "match"
  | "view"
  | "object"
  | string;

export interface Position {
  /** 0-based line number (matches the dance-training lesson DSL). */
  line: number;
  /** 0-based column number, in UTF-16 code units (matches Monaco). */
  col: number;
}

export interface Range {
  anchor: Position;
  active: Position;
}

export interface InitialEditorState {
  text: string;
  /** 0-based selections. If absent, Dance places one anchored at line 0, col 0. */
  selections?: Range[];
  mode?: DanceMode;
}

export type Goal =
  | { kind: "text-equals"; expected: string }
  | { kind: "text-matches"; pattern: RegExp }
  /** Selections in 1-based form, order-insensitive. */
  | { kind: "selections-equal"; ranges: Range[] }
  | { kind: "cursor-at"; line: number; col: number }
  | { kind: "command-fired"; id: string; count?: number; args?: unknown }
  | { kind: "register"; name: string; equals: string }
  | { kind: "mode-is"; mode: DanceMode }
  | { kind: "all"; goals: Goal[] }
  | { kind: "any"; goals: Goal[] };

export interface Step {
  /**
   * Markdown-ish narration. Tokens supported:
   *   {{key:dance.command.id}}        — render the user's binding for that command
   *                                     (with fallback to Dance package.json default)
   *   {{kakkey:t}}                    — render a Kakoune canonical letter
   *   {{action:dance.command.id}}     — alias for {{key:...}}
   */
  narrate: string;
  /** Optional second-tier hint shown after `hintAfterMs` (or via the Hint button). */
  hint?: string;
  /** Pass condition. */
  goal: Goal;
  /** Optional state reset between steps. */
  reset?: "preserve" | "initial" | InitialEditorState;
  /** Time before showing `hint`. Default: 12 000 ms. */
  hintAfterMs?: number;
}

export type LessonFolder =
  | "01-vimtutor"
  | "02-basics"
  | "03-selections"
  | "04-multi-cursor"
  | "05-search-replace"
  | "06-text-objects"
  | "07-registers"
  | "08-macros"
  | "09-view"
  | "10-edit-power";

export interface Lesson {
  id: string;
  folder: LessonFolder;
  title: string;
  blurb: string;
  est_minutes: number;
  /** Action ids the user should already understand. */
  requires?: string[];
  /** Action ids this lesson teaches. */
  teaches: string[];
  /** Discrepancy ids relevant to this lesson. */
  discrepancies?: string[];
  initial: InitialEditorState;
  steps: Step[];
}

export interface ObservedEditorState {
  text: string;
  selections: Range[];
  mode: DanceMode;
  /** Map from register name to the array of strings it currently holds. */
  registers: Record<string, string[]>;
  /** Append-only log of dispatched dance.* commands. */
  commandLog: ReadonlyArray<{ id: string; args?: unknown; at: number }>;
}

export interface FolderInfo {
  id: LessonFolder;
  label: string;
  blurb: string;
}

export const FOLDERS: readonly FolderInfo[] = [
  {
    id: "01-vimtutor",
    label: "Vimtutor for Kakoune",
    blurb: "The classic Vim tutorial, restated for Kak's selection-first model.",
  },
  {
    id: "02-basics",
    label: "Basics",
    blurb: "Modes, escape, motion, and the rules selections live by.",
  },
  {
    id: "03-selections",
    label: "Selections",
    blurb: "Trim, expand, reduce, flip — selections are nouns.",
  },
  {
    id: "04-multi-cursor",
    label: "Multi-cursor",
    blurb: "Split, filter, rotate, align. The killer feature.",
  },
  {
    id: "05-search-replace",
    label: "Search & Replace",
    blurb: "Forward, backward, and regex-driven workflows.",
  },
  {
    id: "06-text-objects",
    label: "Text Objects",
    blurb: "Words, sentences, brackets, indents, syntax.",
  },
  {
    id: "07-registers",
    label: "Registers",
    blurb: "Yank, paste, named registers, and the clipboard.",
  },
  { id: "08-macros", label: "Macros", blurb: "Record. Replay. Compose." },
  { id: "09-view", label: "View", blurb: "Scroll, center, lock — be where you want to be." },
  { id: "10-edit-power", label: "Edit Power-ups", blurb: "Align, copy-indent, pipe, case." },
];
