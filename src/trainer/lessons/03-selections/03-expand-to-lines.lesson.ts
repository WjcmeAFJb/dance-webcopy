import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "03-expand-to-lines",
  folder: "03-selections",
  title: "Expand to whole lines: `x`",
  blurb:
    "`x` snaps your selection out to cover whole lines — and the *next* `x` extends down by one more line. The line-grabber you reach for whenever you think 'one more line'.",
  est_minutes: 3,
  requires: ["kak.normal.select.right"],
  teaches: ["kak.normal.selections.expand", "kak.normal.select.line.below"],
  initial: {
    text: "alpha\nbeta\ngamma\ndelta\nepsilon\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Your selection is one cell on line 1. Press **{{key:dance.selections.expandToLines}}** ({{action:kak.normal.selections.expand}}, default {{kakkey:x}}). The selection snaps out to cover *all of line 1*, including the trailing newline.",
      hint: "Note: in Kak, `x` and 'select line below' share the same default key — they're the same operation, applied to a one-cell vs. line-shaped selection. The Dance command id is `dance.selections.expandToLines`.",
      goal: { kind: "command-fired", id: "dance.selections.expandToLines" },
    },
    {
      narrate:
        "Press **{{key:dance.selections.expandToLines}}** *again*. Now it extends to cover line 2 as well — a quick way to grab N consecutive lines.",
      goal: { kind: "command-fired", id: "dance.selections.expandToLines", count: 2 },
    },
    {
      narrate:
        "Keep going for a third line. You should now have lines 1-3 selected (alpha, beta, gamma).",
      goal: { kind: "command-fired", id: "dance.selections.expandToLines", count: 3 },
    },
    {
      narrate:
        "**Why `x` and not just `J` (extend down)?** `J` extends the active end one cell down — possibly mid-line. `x` always *aligns to whole lines*. After `x`, the next verb (delete, indent, pipe…) operates on clean line boundaries.",
      goal: { kind: "mode-is", mode: "normal" },
      reset: "initial",
    },
    {
      narrate:
        "One more drill. Grab a single character with a motion, then press `x` once to expand to the line, then **{{key:dance.edit.yank-delete}}** to delete the whole line. The combo `xd` is the Kak idiom for 'delete this line'.",
      hint: "From the start: `x` then `d`. Two keys, one full-line delete.",
      goal: { kind: "text-matches", pattern: /^beta\n/ },
    },
  ],
};
