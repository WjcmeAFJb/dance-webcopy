import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "04-insert-and-modes",
  folder: "01-vimtutor",
  title: "Vimtutor 1.4 — Insert mode (i, a, o, O)",
  blurb:
    "The four classic ways to enter Insert mode: before, after, on a new line below, on a new line above.",
  est_minutes: 4,
  requires: ["kak.normal.mode.insert", "kak.normal.mode.normal"],
  teaches: [
    "kak.normal.insert.before",
    "kak.normal.insert.after",
    "kak.normal.edit.newLine.below.insert",
    "kak.normal.edit.newLine.above.insert",
  ],
  initial: {
    text: ["There is text misng this .", "There is some text missing from this line.", ""].join(
      "\n",
    ),
  },
  steps: [
    {
      narrate:
        "Make line 1 match line 2 by inserting the missing pieces. First, walk the selection to land just after the `s` in `misng` — you want to insert `si` between `s` and `n`. Use {{key:dance.select.right.jump}}.",
      hint: "Aim to have the `n` of `misng` selected. That's column 16.",
      goal: { kind: "cursor-at", line: 0, col: 15 },
    },
    {
      narrate:
        "Press {{key:dance.modes.insert.before}} to enter Insert mode **before** the selection. Type `si` and then escape with {{kakkey:<esc>}}.",
      hint: "Default key is {{kakkey:i}}. Inserting *before* means your text lands to the left of the selected character.",
      goal: { kind: "text-matches", pattern: /missing/ },
    },
    {
      narrate:
        "Now reach the trailing `.` and insert `line` before it. Move the selection there and use {{key:dance.modes.insert.before}} again.",
      hint: "Selection-first: position the highlight on the `.`, then insert before it.",
      goal: {
        kind: "text-matches",
        pattern: /^There is some text missing from this line ?\.\n/,
      },
    },
    {
      narrate:
        "There's also {{key:dance.modes.insert.after}} (default {{kakkey:a}}) which puts you in Insert mode *after* the selection — useful when you want to append a character to the end of a word without overshooting. Try it: select any character and press it.",
      goal: { kind: "command-fired", id: "dance.modes.insert.after" },
      reset: { text: "fox\n" },
    },
    {
      narrate:
        "Finally the line-makers: {{key:dance.edit.newLine.below.insert}} (default {{kakkey:o}}) opens a fresh line **below** and drops you into Insert. Try it now.",
      goal: { kind: "command-fired", id: "dance.edit.newLine.below.insert" },
    },
    {
      narrate:
        "And {{key:dance.edit.newLine.above.insert}} (default {{kakkey:O}}) opens one **above**. Try the uppercase variant.",
      goal: { kind: "command-fired", id: "dance.edit.newLine.above.insert" },
    },
  ],
};
