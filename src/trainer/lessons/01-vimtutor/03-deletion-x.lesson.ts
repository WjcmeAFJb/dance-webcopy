import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "03-deletion-x",
  folder: "01-vimtutor",
  title: "Vimtutor 1.3 — Deleting one character (the Kak way)",
  blurb:
    "Vim's `x` deletes the character under the cursor. Kakoune dropped that shortcut: in Kak you select first, delete second.",
  est_minutes: 3,
  requires: ["kak.normal.select.right"],
  teaches: ["kak.normal.edit.yank.delete"],
  discrepancies: ["disc.register.default"],
  initial: {
    text: "The qquick brrown foxx jumpedd ovver thee lazy dogg.\n",
  },
  steps: [
    {
      narrate:
        "Heads up: in Kakoune, {{kakkey:x}} is bound to **select line below**, not delete. There is no single-character delete shortcut at all — you make a one-character selection and remove it.\n\nYour cursor is already a one-character selection. Press {{key:dance.edit.yank-delete}} to remove the highlighted character.",
      hint: "Default key is {{kakkey:d}}. It both yanks (copies) and deletes — there's no separate `dd`.",
      goal: { kind: "command-fired", id: "dance.edit.yank-delete" },
    },
    {
      narrate:
        "Now hop right with {{key:dance.select.right.jump}} a few times until you're sitting on the second `q` in `qquick`. Delete that, and the line starts looking right.",
      goal: { kind: "text-matches", pattern: /^The quick/ },
      reset: "initial",
    },
    {
      narrate:
        "Keep going. Walk through and excise every duplicated letter. Work towards: `The quick brown fox jumped over the lazy dog.`",
      hint: "Move with hjkl, then {{key:dance.edit.yank-delete}}. Selection-first, action-second.",
      goal: {
        kind: "text-equals",
        expected: "The quick brown fox jumped over the lazy dog.\n",
      },
    },
    {
      narrate:
        "Notice that {{key:dance.edit.yank-delete}} also copies the character to the clipboard — Dance pipes through your OS clipboard by default, unlike Kak's internal `\"` register. We'll come back to that in the yank/paste lesson.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
