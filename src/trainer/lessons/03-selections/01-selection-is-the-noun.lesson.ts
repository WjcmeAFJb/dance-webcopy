import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "01-selection-is-the-noun",
  folder: "03-selections",
  title: "The selection is the noun",
  blurb:
    "Read this once and a lot of Kak's surprises stop being surprising. Vi has motions and operators; Kak only has selections and verbs.",
  est_minutes: 4,
  teaches: [
    "kak.normal.select.right",
    "kak.normal.seek.word.next",
    "kak.normal.selections.flipDirection",
  ],
  discrepancies: ["disc.selection.shape"],
  initial: {
    text: "In Kak, the selection is the noun.\nThe next key you press is the verb.\nYou compose them, like a sentence.\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "**A Kak selection always exists.** Even at startup you have a one-character selection on the first cell. There is no 'naked cursor' — every command has a noun to operate on. *Look* at the highlight on the editor right now.",
      hint: "If the highlight isn't visible, check the `MODE: NORMAL` indicator above the editor. You're in Normal — the selection is there.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "**Motions extend the noun, not the cursor.** Press **{{key:dance.seek.word}}** once. The selection grows to cover the next word — that's both 'movement' and 'selection' in one stroke. Vim users: imagine `vw` fused into one keypress.",
      goal: { kind: "command-fired", id: "dance.seek.word" },
    },
    {
      narrate:
        "**Verbs consume the selection.** Whatever you press next — `d`, `c`, `y`, `>` — operates on what's highlighted. There's no `dw`, just `w` then `d`. Try it: press **{{key:dance.edit.yank-delete}}** to delete the selected word.",
      hint: "Default chord is {{kakkey:d}}. The selected word disappears.",
      goal: { kind: "command-fired", id: "dance.edit.yank-delete" },
    },
    {
      narrate:
        "**Selections have direction.** Press **{{key:dance.seek.word}}** to grab a word, then **{{key:dance.selections.changeDirection}}** ({{action:kak.normal.selections.flipDirection}}, default {{kakkey:<a-;>}}). The active end swaps sides — future motions now extend the *other* way.",
      goal: { kind: "command-fired", id: "dance.selections.changeDirection" },
    },
    {
      narrate:
        "**Multi-cursor is just multiple selections.** Every command in Kak is implicitly a *map* over a list of selections. We'll get there in folder 04 — for now, hold this thought: when you see `s`, `S`, `<a-s>`, `,`, `<a-,>`, `(`, `)`, those are the verbs that *manipulate the selection list itself*.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Tiny drill. Walk the cursor down to the third line with **{{key:dance.select.down.jump}}**, watching the selection slide. The highlight is your *position* — you can't lose it.",
      hint: "Two presses of the down-jump key gets you to line 3.",
      goal: { kind: "cursor-at", line: 2, col: 1 },
      reset: "initial",
    },
  ],
};
