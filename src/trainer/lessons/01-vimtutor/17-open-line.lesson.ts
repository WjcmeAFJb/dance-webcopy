import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "17-open-line",
  folder: "01-vimtutor",
  title: "Vimtutor 6.1 — Open new lines (o, O)",
  blurb: "Lowercase opens below, uppercase opens above. Both leave you in Insert. Same as Vim.",
  est_minutes: 3,
  requires: ["kak.normal.mode.insert"],
  teaches: [
    "kak.normal.edit.newLine.below.insert",
    "kak.normal.edit.newLine.above.insert",
    "kak.normal.edit.newLine.below",
    "kak.normal.edit.newLine.above",
  ],
  initial: {
    text: ["First paragraph line.", "Third paragraph line.", ""].join("\n"),
  },
  steps: [
    {
      narrate:
        "With the selection on line 1, press {{key:dance.edit.newLine.below.insert}} (default {{kakkey:o}}). A blank line appears below and you're put in Insert. Type `Second paragraph line.` and {{kakkey:<esc>}}.",
      hint: "The new line is created relative to the *selection's* line — same as Vim's caret.",
      goal: {
        kind: "text-equals",
        expected: "First paragraph line.\nSecond paragraph line.\nThird paragraph line.\n",
      },
    },
    {
      narrate:
        "Now insert a header above line 1. With the selection still on the first line, press {{key:dance.edit.newLine.above.insert}} (default {{kakkey:O}}). Type `# Notes` and escape.",
      hint: "Capital `O` mirrors lowercase `o` upward.",
      goal: { kind: "text-matches", pattern: /^# Notes\nFirst paragraph/ },
    },
    {
      narrate:
        "Kak also offers *no-Insert* variants: {{key:dance.edit.newLine.below}} (default {{kakkey:<a-o>}}) and {{key:dance.edit.newLine.above}} (default {{kakkey:<a-O>}}) just open the line and stay in Normal — useful when you want to paste, not type.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.edit.newLine.below" },
          { kind: "command-fired", id: "dance.edit.newLine.above" },
        ],
      },
    },
    {
      narrate: "Counts also work here: typing `3` then `o` opens three blank lines below. Try it.",
      goal: {
        kind: "command-fired",
        id: "dance.edit.newLine.below.insert",
      },
    },
  ],
};
