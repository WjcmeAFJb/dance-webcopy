import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "09-operators-on-selections",
  folder: "01-vimtutor",
  title: "Vimtutor 2.4 — Operators (the inversion)",
  blurb:
    "Vim says `d2w` (delete two words). Kakoune says `2w` then `d` (select two words, then delete). Same outcome, opposite order.",
  est_minutes: 4,
  requires: ["kak.normal.seek.word.next", "kak.normal.edit.yank.delete"],
  teaches: ["kak.normal.edit.yank.delete", "kak.normal.edit.delete"],
  initial: {
    text: "this  ABC DE  line  FGHI JK LMN OP  of words is  Q RS TUV  cleaned up.\n",
  },
  steps: [
    {
      narrate:
        "Position the cursor on the `A` of `ABC` (use {{key:dance.seek.word}} to walk forward). When the highlight covers `ABC ` and a bit, you're set up for the next step.",
      hint: "Two presses of {{key:dance.seek.word}} from the line start should put the selection over `ABC `.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 2 },
    },
    {
      narrate:
        "Now extend the selection across two words using a count. Type `2` then {{key:dance.seek.word}} so the selection covers `ABC DE `.",
      goal: {
        kind: "all",
        goals: [
          { kind: "command-fired", id: "dance.updateCount" },
          { kind: "command-fired", id: "dance.seek.word", count: 3 },
        ],
      },
    },
    {
      narrate:
        "And here's the punch line: with `ABC DE ` highlighted, press {{key:dance.edit.yank-delete}}. The operator acts on whatever's selected — no need to re-specify `2w`.",
      hint: "This is the heart of the noun-verb difference. Selection is the noun.",
      goal: { kind: "text-matches", pattern: /this\s+line/ },
    },
    {
      narrate:
        "Continue cleaning the line so it reads `this line of words is cleaned up.`. Each unwanted run of UPPERCASE words is a count-of-w + d.",
      goal: {
        kind: "text-equals",
        expected: "this  line  of words is  cleaned up.\n",
      },
    },
    {
      narrate:
        "If you want to delete *without* clobbering the clipboard, use {{key:dance.edit.delete}} (default {{kakkey:<a-d>}}). It's the same effect minus the yank — handy when you want to keep your last copy intact.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
