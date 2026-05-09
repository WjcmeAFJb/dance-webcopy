import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "06-word-motion",
  folder: "01-vimtutor",
  title: "Vimtutor 2.1 — Word motion (w, b, e)",
  blurb:
    "In Vim `w` jumps; in Kakoune `w` *selects*. Same letter, different feel: the highlight grows to cover what you'd skip in Vim.",
  est_minutes: 4,
  requires: ["kak.normal.select.right"],
  teaches: ["kak.normal.seek.word.next", "kak.normal.seek.word.prev", "kak.normal.seek.word.end"],
  initial: {
    text: "the quick brown fox jumps over the lazy dog and naps in the sun\n",
  },
  steps: [
    {
      narrate:
        "Press {{key:dance.seek.word}} (default {{kakkey:w}}) once. Look at the editor: the selection isn't just one character anymore — it spans from the cursor to the start of the next word, **including the trailing space**. That's Kak's signature trick.",
      hint: "If the highlight didn't move, you might still be in Insert mode — escape first.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 1 },
    },
    {
      narrate:
        "Press {{key:dance.seek.word}} two more times. Each press throws away the old selection and creates a new one over the next word.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 3 },
    },
    {
      narrate:
        "Now {{key:dance.seek.wordEnd}} (default {{kakkey:e}}). It's the same idea but it ends at the *last character of the word* rather than the start of the next. No trailing space.",
      goal: { kind: "command-fired", id: "dance.seek.wordEnd" },
    },
    {
      narrate:
        "Reverse with {{key:dance.seek.word.backward}} (default {{kakkey:b}}). It selects backward from the cursor to the previous word start.",
      goal: { kind: "command-fired", id: "dance.seek.word.backward" },
    },
    {
      narrate:
        "Why does this matter? Because Kakoune lets you *see* what you're about to act on. Tap `w` until the right word is highlighted, then `d` to delete or `c` to change. Verb-noun becomes noun-verb.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.seek.word", count: 4 },
          { kind: "command-fired", id: "dance.seek.wordEnd", count: 2 },
        ],
      },
    },
  ],
};
