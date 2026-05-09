import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "05-reduce-to-cursor",
  folder: "03-selections",
  title: "Reduce to the cursor: `;`",
  blurb:
    "Drop the selection's anchor — keep only the active end. The release valve for when a selection has grown too big and you want to start fresh from where you are.",
  est_minutes: 3,
  requires: ["kak.normal.seek.word.next"],
  teaches: ["kak.normal.selections.reduce"],
  initial: {
    text: "the quick brown fox jumps over the lazy dog\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Press **{{key:dance.seek.word}}** four times. You now have a fat selection covering the first four words plus their whitespace.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 4 },
    },
    {
      narrate:
        "Press **{{key:dance.selections.reduce}}** ({{action:kak.normal.selections.reduce}}, default {{kakkey:;}}). The selection collapses to a one-cell range at the *cursor* (active end). Anchor and active become identical-ish — your future motions extend from this fresh starting point.",
      hint: "Compare with `<a-;>` (flip): `;` collapses the selection, `<a-;>` swaps its endpoints. They're both cheap and they pair: `<a-;>;` reduces to the *anchor* end instead.",
      goal: { kind: "command-fired", id: "dance.selections.reduce" },
    },
    {
      narrate:
        "Why `;`? It's the antidote to **selection creep**. After `f` + extend + extend + extend, you may want to start fresh from your current cursor without losing your place. `;` does that in one keystroke.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Drill: `w` `w` `w` `;` `w`. Watch the result — three word-grabs grow the selection (well, replace each time, but the cursor walks forward), `;` reduces, then the last `w` selects just the *next* word, not the entire span.",
      hint: "Press {{key:dance.seek.word}} three times, then {{key:dance.selections.reduce}}, then {{key:dance.seek.word}} once more.",
      goal: {
        kind: "all",
        goals: [
          { kind: "command-fired", id: "dance.seek.word", count: 4 },
          { kind: "command-fired", id: "dance.selections.reduce" },
        ],
      },
    },
  ],
};
