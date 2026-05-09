import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "05-append-line-end",
  folder: "01-vimtutor",
  title: "Vimtutor 1.5 — Insert at line edges (A, I)",
  blurb:
    "Two convenience modes: jump to the end of the line and start typing, or jump to the first non-blank and start typing.",
  est_minutes: 3,
  requires: ["kak.normal.insert.before", "kak.normal.insert.after"],
  teaches: ["kak.normal.insert.lineEnd", "kak.normal.insert.lineStart"],
  initial: {
    text: ["    There is some text missing from th", "    A short line", ""].join("\n"),
  },
  steps: [
    {
      narrate:
        "Cursor is anywhere on line 1. Press {{key:dance.modes.insert.lineEnd}} (default {{kakkey:A}}) and type `is line.` — you'll land in Insert mode at the very end of the line, no manual seeking required.",
      hint: "After the `A`, just type the missing tail and {{kakkey:<esc>}} when done.",
      goal: { kind: "text-matches", pattern: /missing from this line\./ },
    },
    {
      narrate:
        "On line 2, demonstrate the mirror: {{key:dance.modes.insert.lineStart}} (default {{kakkey:I}}) jumps to the first non-whitespace character and enters Insert *before* it. Type `Hello, ` (with a space) so the line reads `    Hello, A short line`.",
      hint: "`I` skips the leading whitespace; `<a-h>` would go to the absolute column 0.",
      goal: { kind: "text-matches", pattern: /Hello, A short line/ },
    },
    {
      narrate:
        "These two are the most-used Insert variants in practice. `A` for appending tails, `I` for prepending leaders. Both leave you in Insert mode until you escape.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
