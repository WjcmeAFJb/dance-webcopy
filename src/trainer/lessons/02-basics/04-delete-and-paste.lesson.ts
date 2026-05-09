import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "04-delete-and-paste",
  folder: "02-basics",
  title: "Delete, then paste back",
  blurb:
    "The classic combo: yank-and-delete with d, paste-after with p. Kak's `d` is destructive AND copies — there is no separate yank step.",
  est_minutes: 4,
  requires: ["kak.normal.seek.word.next"],
  teaches: [
    "kak.normal.edit.yank.delete",
    "kak.normal.edit.paste.after",
    "kak.normal.edit.paste.before",
    "kak.normal.selections.yank",
  ],
  discrepancies: ["disc.register.default"],
  initial: {
    text: "alpha beta gamma delta\n",
  },
  steps: [
    {
      narrate:
        "Select the word **alpha** with **{{key:dance.seek.word}}** — exactly one press. The trailing space comes along for the ride.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 1 },
    },
    {
      narrate:
        "Now delete it (and copy at the same time): **{{key:dance.edit.yank-delete}}**. The text vanishes — but it's saved in the default register.",
      hint: "If your buffer still says `alpha beta gamma delta`, you didn't fire the right command. On defaults that's {{kakkey:d}}.",
      goal: { kind: "text-equals", expected: "beta gamma delta\n" },
    },
    {
      narrate:
        "Step the selection across the rest of the line: press **{{key:dance.seek.word}}** until your selection sits past **delta**.",
      hint: "Three more presses lands you on the trailing whitespace/newline after `delta`.",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 4 },
    },
    {
      narrate:
        "Paste your yank back with **{{key:dance.edit.paste.after}}** — it lands *after* the current selection.",
      goal: { kind: "text-matches", pattern: /delta.*alpha/ },
    },
    {
      narrate:
        "Compare: **{{key:dance.edit.paste.before}}** would have put it *before* the selection instead. Capital-P / lowercase-p — same convention as Vim.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.edit.paste.before" },
          { kind: "mode-is", mode: "normal" },
        ],
      },
    },
  ],
};
