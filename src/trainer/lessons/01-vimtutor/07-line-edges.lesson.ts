import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "07-line-edges",
  folder: "01-vimtutor",
  title: "Vimtutor 2.2 — Line edges (<a-h>, <a-l>)",
  blurb:
    "Vim's `0` and `$` jump to the line boundaries. Kakoune binds them to Alt-h and Alt-l — and they *select to* the boundary instead of just moving.",
  est_minutes: 3,
  requires: ["kak.normal.select.right"],
  teaches: ["kak.normal.select.line.start", "kak.normal.select.line.end"],
  initial: {
    text: ["    indented line of medium length", "another line for practice", ""].join("\n"),
  },
  steps: [
    {
      narrate:
        "Move the selection a few cells into line 1 using {{key:dance.select.right.jump}} so you're somewhere in the middle.",
      goal: { kind: "command-fired", id: "dance.select.right.jump", count: 3 },
    },
    {
      narrate:
        "Press {{key:dance.select.lineEnd}} (default {{kakkey:<a-l>}}). The selection now stretches from where you were to the end of the line. In Vim `$` would just move the caret; here you've got everything in between under one selection — perfect input for `d` or `c`.",
      goal: { kind: "command-fired", id: "dance.select.lineEnd" },
    },
    {
      narrate:
        "Now {{key:dance.select.lineStart}} (default {{kakkey:<a-h>}}). The selection extends backward to column 0, including any leading whitespace.",
      hint: "If you want to skip the indent and land on the first non-blank, that's `gi` (covered later).",
      goal: { kind: "command-fired", id: "dance.select.lineStart" },
    },
    {
      narrate:
        "These two are great primitives for line-level surgery. `<a-h>d` wipes from cursor to start; `<a-l>d` wipes from cursor to end. Try one of them now.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.edit.yank-delete" },
          { kind: "command-fired", id: "dance.edit.delete" },
        ],
      },
    },
  ],
};
