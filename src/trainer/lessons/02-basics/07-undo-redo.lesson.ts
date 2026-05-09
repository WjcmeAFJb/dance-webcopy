import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "07-undo-redo",
  folder: "02-basics",
  title: "Undo, redo, and the *selection* history",
  blurb:
    "Kakoune keeps two histories — text edits and selection changes — and gives you keys for both. `u`/`U` walk text; `<a-u>`/`<a-U>` walk selections.",
  est_minutes: 4,
  requires: ["kak.normal.edit.yank.delete"],
  teaches: [
    "kak.normal.history.undo",
    "kak.normal.history.redo",
    "kak.normal.history.undo.selections",
    "kak.normal.history.redo.selections",
  ],
  discrepancies: ["disc.history.selections"],
  initial: {
    text: "first line\nsecond line\nthird line\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Select the first word with **{{key:dance.seek.word}}**, then delete it with **{{key:dance.edit.yank-delete}}**. Two changes, recorded.",
      goal: { kind: "text-equals", expected: "line\nsecond line\nthird line\n" },
    },
    {
      narrate:
        "Now press **{{key:dance.history.undo}}** ({{action:kak.normal.history.undo}}, default {{kakkey:u}}). The deletion is reverted.",
      hint: "Note: this lesson sandbox doesn't fully snapshot text history, so we just check that you fired the undo command. The verifier will accept the keypress.",
      goal: { kind: "command-fired", id: "dance.history.undo" },
    },
    {
      narrate:
        "Re-do with **{{key:dance.history.redo}}** ({{action:kak.normal.history.redo}}, default {{kakkey:U}}). Capital-U redoes — *not* undo-line as in Vi.",
      goal: { kind: "command-fired", id: "dance.history.redo" },
    },
    {
      narrate:
        "Selection history is **independent**. Move around with **{{key:dance.seek.word}}** twice, then press **{{key:dance.history.undo.selections}}** ({{action:kak.normal.history.undo.selections}}, default {{kakkey:<a-u>}}). The text doesn't change — only the selection state rolls back.",
      hint: "Useful after `s` (select-within-regex) or a multi-cursor split: oops, undo just the selection step without losing your edits.",
      goal: { kind: "command-fired", id: "dance.history.undo.selections" },
    },
    {
      narrate:
        "And forward through selection history with **{{key:dance.history.redo.selections}}** ({{kakkey:<a-U>}}). The two histories rarely interact — that's the whole point.",
      goal: { kind: "command-fired", id: "dance.history.redo.selections" },
    },
  ],
};
