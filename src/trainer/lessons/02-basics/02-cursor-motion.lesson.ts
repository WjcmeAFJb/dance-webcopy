import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "02-cursor-motion",
  folder: "02-basics",
  title: "Cursor motion: h, j, k, l",
  blurb:
    "Move the selection one cell at a time. Vi's hjkl muscle memory still pays off — the small twist is that you're moving a *one-character selection*, not a caret.",
  est_minutes: 3,
  requires: ["kak.normal.mode.normal"],
  teaches: [
    "kak.normal.select.left",
    "kak.normal.select.down",
    "kak.normal.select.up",
    "kak.normal.select.right",
  ],
  discrepancies: ["disc.selection.shape"],
  initial: {
    text: "abcdef\nghijkl\nmnopqr\nstuvwx",
  },
  steps: [
    {
      narrate:
        "Press **{{key:dance.select.right.jump}}** once. The one-character selection slides to the next cell — it does not extend.",
      hint: "On default bindings this is {{kakkey:l}}. The capital-L extend variant lives in lesson 10.",
      goal: { kind: "cursor-at", line: 0, col: 2 },
    },
    {
      narrate: "Now go down a line: **{{key:dance.select.down.jump}}**.",
      goal: { kind: "cursor-at", line: 1, col: 2 },
    },
    {
      narrate: "Step back up with **{{key:dance.select.up.jump}}** — same column on line 1.",
      goal: { kind: "cursor-at", line: 0, col: 2 },
    },
    {
      narrate:
        "And one cell left with **{{key:dance.select.left.jump}}**. You're back to column 1.",
      goal: { kind: "cursor-at", line: 0, col: 1 },
    },
    {
      narrate:
        "Last challenge: navigate down to **line 4** (the `stuvwx` line) and over to its **third character**.",
      hint: "That's `o` in `stuvwx`. Two presses of {{key:dance.select.down.jump}}, then a couple of {{key:dance.select.right.jump}}.",
      goal: { kind: "cursor-at", line: 3, col: 3 },
    },
  ],
};
