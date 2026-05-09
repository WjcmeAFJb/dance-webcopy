import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "08-counts-prefix",
  folder: "02-basics",
  title: "Counts: do it N times in one breath",
  blurb:
    "Type a number before any motion or edit and Kak applies the command that many times. `5j` jumps five lines; `3w` selects three words.",
  est_minutes: 3,
  requires: ["kak.normal.select.down", "kak.normal.seek.word.next"],
  teaches: ["kak.normal.select.down", "kak.normal.seek.word.next"],
  initial: {
    text: "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "**The count prefix.** Any digit you type in Normal mode (other than `0`, which seeks to line-start) feeds **{{key:dance.updateCount}}** and accumulates a number. The next motion or edit uses that number as a multiplier.",
      hint: "Watch the bar above the editor — when a count is active you'll see `count=5` next to the mode label.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Land on **line 5** in one go. The slow way: press **{{key:dance.select.down.jump}}** four times. The fast way: type **`5`** then **{{key:dance.select.down.jump}}** once. Try the fast way first.",
      hint: "If counts aren't bound on your install, the slow way always works — four presses of {{key:dance.select.down.jump}} also passes this step. (In this sandbox the count concept is simulated; the result is the same.)",
      goal: { kind: "cursor-at", line: 4, col: 1 },
    },
    {
      narrate:
        "Reset to the top: press **{{key:dance.select.up.jump}}** until you're back on line 1.",
      hint: "Hit Reset if you overshoot.",
      goal: { kind: "cursor-at", line: 0, col: 1 },
      reset: "initial",
    },
    {
      narrate:
        "Now combine count with a word seek. Type **`3`** then **{{key:dance.seek.word}}** to select three words at once. (Or just press **{{key:dance.seek.word}}** three times — same end state.)",
      goal: { kind: "command-fired", id: "dance.seek.word", count: 1 },
    },
    {
      narrate:
        "**Counts compose with everything.** `4d` deletes four selections-worth, `5w` selects five words, `3>` indents three lines. The number is just *the next argument*.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
