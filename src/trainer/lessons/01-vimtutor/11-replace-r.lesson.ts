import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "11-replace-r",
  folder: "01-vimtutor",
  title: "Vimtutor 3.2 — Replace characters (r)",
  blurb:
    "Hit `r` then a character to overwrite the selection one-character-at-a-time. Stays in Normal mode.",
  est_minutes: 3,
  requires: ["kak.normal.select.right"],
  teaches: ["kak.normal.edit.replace"],
  initial: {
    text: ["Whan this lime was tuoed in, someone presswd some wrojg keys!", ""].join("\n"),
  },
  steps: [
    {
      narrate:
        "Walk the cursor over the `a` in `Whan` (it's the second character). Use {{key:dance.select.right.jump}} to get there.",
      goal: { kind: "cursor-at", line: 0, col: 3 },
    },
    {
      narrate:
        "Now press {{key:dance.edit.replaceCharacters}} (default {{kakkey:r}}) and then `e`. The single highlighted character is overwritten with `e` — and you stay in Normal, ready for the next move.",
      hint: "It's a two-keystroke combo: `r` first, then the replacement.",
      goal: { kind: "text-matches", pattern: /^When/ },
    },
    {
      narrate:
        "Walk through the rest of the line and replace each typo. Aim for `When this line was typed in, someone pressed some wrong keys!`",
      hint: "Move with hjkl, hit `r` plus the right letter. No mode switch needed.",
      goal: {
        kind: "text-equals",
        expected: "When this line was typed in, someone pressed some wrong keys!\n",
      },
    },
    {
      narrate:
        "Two extras worth knowing: `r` works on multi-character selections too — it replaces *every* character in the selection with the same one. And `R` (capital, {{key:dance.edit.yank-replace}}) replaces the selection with the **yank** register's contents.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
