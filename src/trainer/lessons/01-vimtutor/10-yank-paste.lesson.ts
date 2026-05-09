import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "10-yank-paste",
  folder: "01-vimtutor",
  title: "Vimtutor 3.1 — Yank and paste (y, p, P)",
  blurb:
    "Copy with `y`, paste after with `p`, paste before with `P`. In Dance the default register is the system clipboard — that's a real difference from Kak.",
  est_minutes: 4,
  requires: ["kak.normal.seek.word.next", "kak.normal.edit.yank.delete"],
  teaches: [
    "kak.normal.selections.yank",
    "kak.normal.edit.paste.after",
    "kak.normal.edit.paste.before",
    "kak.normal.edit.pasteAll.after",
    "kak.normal.edit.pasteAll.before",
  ],
  discrepancies: ["disc.register.default"],
  initial: {
    text: [
      "d) Can you learn too?",
      "b) Violets are blue,",
      "c) Intelligence is learned,",
      "a) Roses are red,",
      "",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "Goal: re-order the four lines into a-b-c-d. First, select line `d) Can you learn too?` — use {{key:dance.select.line.below}} (default {{kakkey:x}}) to grab the whole line.",
      hint: "{{kakkey:x}} in Kak does *not* mean delete. It selects the line under the cursor.",
      goal: { kind: "command-fired", id: "dance.select.line.below" },
    },
    {
      narrate: "Now {{key:dance.edit.yank-delete}} to remove and yank the line into the clipboard.",
      goal: { kind: "text-matches", pattern: /^b\) Violets are blue,/ },
    },
    {
      narrate:
        "Move down to the last line (`a) Roses are red,`) and select it. Then {{key:dance.edit.paste.after}} (default {{kakkey:p}}) to drop the yanked line **after** the current selection.",
      hint: "If you've got a line-shaped yank, `p` puts it on a fresh line below.",
      goal: { kind: "command-fired", id: "dance.edit.paste.after" },
    },
    {
      narrate:
        "There's also {{key:dance.edit.paste.before}} (default {{kakkey:P}}) for pasting *before* the current selection. The capital is the symmetric move — same in Vim, same in Kak.",
      goal: { kind: "command-fired", id: "dance.edit.paste.before" },
      reset: { text: "alpha\nbravo\ncharlie\n" },
    },
    {
      narrate:
        "**Important Dance behaviour**: yank/paste flows through the OS clipboard by default. If you copy something in your browser, Dance's `p` will paste it. Kakoune kept things in an internal `\"` register — Dance's choice favours integration with the rest of VS Code.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Bonus: with multiple selections you can paste the *stack* of yanks one-per-cursor with {{key:dance.edit.pasteAll.after}} (default {{kakkey:<a-p>}}). We'll explore that in the multi-cursor folder.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
