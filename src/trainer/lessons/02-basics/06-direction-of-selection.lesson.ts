import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "06-direction-of-selection",
  folder: "02-basics",
  title: "Selections have direction (and you can change it)",
  blurb:
    "A Kak selection has an *anchor* and an *active end* — they are not the same. Reducing, flipping, and forcing direction lets you reuse selections you already have.",
  est_minutes: 5,
  requires: ["kak.normal.seek.word.next"],
  teaches: [
    "kak.normal.selections.reduce",
    "kak.normal.selections.flipDirection",
    "kak.normal.selections.faceForward",
  ],
  initial: {
    text: "the quick brown fox jumps over the lazy dog\n",
  },
  steps: [
    {
      narrate:
        "Press **{{key:dance.seek.word}}** twice. You now have a selection covering `the quick `. The *active* end is the right side (where motions extend from); the *anchor* is the left side.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 2 },
    },
    {
      narrate:
        "Now press **{{key:dance.selections.reduce}}** — `;` on default bindings. This collapses the selection down to a single cell at its **cursor** (active end). Useful when you want to drop a multi-character selection but stay where the cursor is.",
      hint: "Think of `;` as 'reduce-to-here'. After this, your selection is one character wide at the right side of `quick `.",
      goal: { kind: "command-fired", id: "dance.selections.reduce" },
    },
    {
      narrate:
        "Grab another word with **{{key:dance.seek.word}}**, then press **{{key:dance.selections.changeDirection}}** ({{action:kak.normal.selections.flipDirection}}). The anchor and active end swap — your motions will now extend the *other* way.",
      hint: "Default chord is {{kakkey:<a-;>}}. After flipping, pressing `e` would shrink the selection from the left, not extend it on the right.",
      goal: { kind: "command-fired", id: "dance.selections.changeDirection" },
    },
    {
      narrate:
        "Sometimes you don't care which way the selection faces — you just want it forward. **{{key:dance.selections.faceForward}}** ({{action:kak.normal.selections.faceForward}}, default {{kakkey:<a-:>}}) forces every selection to point forward, regardless of current state.",
      goal: { kind: "command-fired", id: "dance.selections.faceForward" },
    },
    {
      narrate:
        "Why care? When you pipe selections, sort them, or extend with `H`/`L`, *direction matters*. `<a-:>` is the cheap way to normalise before you act.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
