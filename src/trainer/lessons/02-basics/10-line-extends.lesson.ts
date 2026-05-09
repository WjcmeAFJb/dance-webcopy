import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "10-line-extends",
  folder: "02-basics",
  title: "Capital HJKL: extend instead of jump",
  blurb:
    "Same shape, different verb. Lowercase hjkl *replace* the selection with a fresh one-cell range; uppercase HJKL *extend* the existing selection.",
  est_minutes: 3,
  requires: [
    "kak.normal.select.left",
    "kak.normal.select.down",
    "kak.normal.select.up",
    "kak.normal.select.right",
  ],
  teaches: [
    "kak.normal.select.left.extend",
    "kak.normal.select.down.extend",
    "kak.normal.select.up.extend",
    "kak.normal.select.right.extend",
  ],
  initial: {
    text: "first line of text\nsecond line of text\nthird line of text\nfourth line of text\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Press **{{key:dance.select.right.jump}}** three times. Each press *replaces* the selection — you always end up with a one-cell selection at the new spot.",
      goal: { kind: "cursor-at", line: 0, col: 4 },
    },
    {
      narrate:
        "Now press **{{key:dance.select.right.extend}}** five times. The active end keeps moving, but the **anchor stays put** — the selection grows.",
      hint: "Default chord is {{kakkey:L}}. The selection should now span ~9 characters.",
      goal: { kind: "command-fired", id: "dance.select.right.extend", count: 5 },
    },
    {
      narrate:
        "Extend down too: **{{key:dance.select.down.extend}}** twice. The selection now spans multiple lines, anchored at the original column on line 1.",
      goal: { kind: "command-fired", id: "dance.select.down.extend", count: 2 },
    },
    {
      narrate:
        "Shrink it: **{{key:dance.select.up.extend}}** once. Capital-K pulls the active end *back up*. Extends are bidirectional.",
      goal: { kind: "command-fired", id: "dance.select.up.extend" },
    },
    {
      narrate:
        "And jump back to a fresh single-cell selection with any lowercase motion — e.g. **{{key:dance.select.left.jump}}**. Lowercase = replace; uppercase = extend. Same convention applies to `w`/`W`, `e`/`E`, `b`/`B`.",
      goal: { kind: "command-fired", id: "dance.select.left.jump" },
    },
  ],
};
