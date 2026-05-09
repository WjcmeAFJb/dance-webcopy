import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "12-change-c",
  folder: "01-vimtutor",
  title: "Vimtutor 3.3 — Change (c)",
  blurb:
    "Yank-delete-and-insert in one keystroke. Acts on whatever's selected, then drops you in Insert.",
  est_minutes: 3,
  requires: ["kak.normal.seek.word.next", "kak.normal.edit.yank.delete"],
  teaches: ["kak.normal.edit.yank.delete.insert"],
  initial: {
    text: ["This lubw has a few wptfd that mrrf changing usf the change operator.", ""].join("\n"),
  },
  steps: [
    {
      narrate:
        "Select the gibberish word `lubw`. Use {{key:dance.seek.word}} a couple of times to walk forward, and {{key:dance.seek.wordEnd}} to tighten the selection over the word itself.",
      hint: "You can also use `<a-i>w` (inner word object) — covered later.",
      goal: { kind: "command-fired", id: "dance.seek.wordEnd" },
    },
    {
      narrate:
        "With `lubw` selected, press {{key:dance.edit.yank-delete-insert}} (default {{kakkey:c}}). The selection vanishes and you land in Insert mode at that spot. Type `line` and {{kakkey:<esc>}}.",
      hint: "`c` in Kak is `d` plus mode switch — yank, delete, insert.",
      goal: { kind: "text-matches", pattern: /This line has/ },
    },
    {
      narrate:
        "Repeat for the other gibberish words: `wptfd` -> `words`, `mrrf` -> `need`, `usf` -> `using`. Select word, change, type, escape.",
      hint: "After the first c-edit you've memorized the rhythm. Trust it.",
      goal: {
        kind: "text-equals",
        expected: "This line has a few words that need changing using the change operator.\n",
      },
    },
    {
      narrate:
        "Note that {{key:dance.edit.yank-delete-insert}} preserves the deleted text in the clipboard, just like `d`. If you want to throw it away instead, there's {{key:dance.edit.delete-insert}} (default {{kakkey:<a-c>}}).",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
