import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "08-counts",
  folder: "01-vimtutor",
  title: "Vimtutor 2.3 — Numeric counts",
  blurb:
    "Type a number first to repeat the next motion N times. In Dance the digits feed `dance.updateCount`.",
  est_minutes: 3,
  requires: ["kak.normal.seek.word.next"],
  teaches: ["kak.normal.seek.word.next"],
  initial: {
    text: "one two three four five six seven eight nine ten\n",
  },
  steps: [
    {
      narrate:
        "Position cursor at the start of the line if it isn't there. Now we'll demonstrate counts. Type `3` and then {{key:dance.seek.word}}. The number gets accumulated by `dance.updateCount` and consumed by the next command.",
      hint: "Watch the count chip in the status bar — typing digits builds it up.",
      goal: { kind: "command-fired", id: "dance.updateCount" },
    },
    {
      narrate:
        "After your `3w`, the selection should now span across roughly three words. Counts work with most motions: `5j` jumps five lines, `2e` selects to the end of the second word ahead.",
      goal: { kind: "command-fired", id: "dance.seek.word" },
    },
    {
      narrate:
        "Try another: type `2` then {{key:dance.seek.wordEnd}} to extend to the end of the second word forward.",
      goal: {
        kind: "all",
        goals: [
          { kind: "command-fired", id: "dance.updateCount", count: 2 },
          { kind: "command-fired", id: "dance.seek.wordEnd" },
        ],
      },
    },
    {
      narrate:
        "Counts also stack with editing operators: `2d` deletes the next two selections (after a motion). The model is *operator + count + motion*, just like Vim — except the motion creates a selection that the operator then consumes.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
