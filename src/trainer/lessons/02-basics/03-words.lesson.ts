import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "03-words",
  folder: "02-basics",
  title: "Word seeks: w, b, e",
  blurb:
    "Selection-aware word motion. The defining Kak twist: motions *select what they cover*, so the next verb operates on the word you just walked over.",
  est_minutes: 4,
  requires: ["kak.normal.select.right"],
  teaches: [
    "kak.normal.seek.word.next",
    "kak.normal.seek.word.prev",
    "kak.normal.seek.word.end",
    "kak.normal.seek.WORD.next",
  ],
  initial: {
    text: "the quick brown fox jumps over the lazy dog\n",
  },
  steps: [
    {
      narrate:
        "Press **{{key:dance.seek.word}}** once. Watch the highlight: the selection grows from your cursor to cover the next word **plus** the trailing whitespace. In Vim `w` only *moves*; here it *selects*.",
      goal: { kind: "command-fired", id: "dance.seek.word" },
    },
    {
      narrate:
        "Now press **{{key:dance.seek.wordEnd}}**. This selects up to the **end** of the next word — no trailing whitespace this time. Useful when you want to delete a word and keep the space.",
      goal: { kind: "command-fired", id: "dance.seek.wordEnd" },
    },
    {
      narrate:
        "Walk a word backwards with **{{key:dance.seek.word.backward}}**. Notice the selection's *anchor* swaps to the right and *active* end faces left — selections in Kak have direction.",
      goal: { kind: "command-fired", id: "dance.seek.word.backward" },
    },
    {
      narrate:
        "Try the **WORD** variant: **{{key:dance.seek.word.ws}}**. Big-W treats punctuation as part of the word — useful when you want `foo.bar.baz` as a single unit.",
      hint: "On default Dance bindings this is {{kakkey:<a-w>}}.",
      goal: { kind: "command-fired", id: "dance.seek.word.ws" },
    },
    {
      narrate:
        "Take stock: each motion left a selection behind. That's the rhythm — *select first, act after*. Next lesson: actually edit using those selections.",
      goal: {
        kind: "any",
        goals: [
          { kind: "mode-is", mode: "normal" },
          { kind: "mode-is", mode: "insert" },
        ],
      },
    },
  ],
};
