import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "02-trim",
  folder: "03-selections",
  title: "Trim: shrink a selection to its useful core",
  blurb:
    "Two operations: `_` strips whitespace from the ends of every selection; `<a-x>` drops any partial line from the boundaries. Both leave the *substance* of the selection intact.",
  est_minutes: 3,
  requires: ["kak.normal.seek.word.next"],
  teaches: ["kak.normal.selections.trim.whitespace", "kak.normal.selections.trim.lines"],
  initial: {
    text: "   indented hello   \n   another line     \n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Select the entire first line: navigate to its start, then **{{key:dance.select.lineEnd}}** ({{action:kak.normal.select.line.end}}, default {{kakkey:<a-l>}}) to extend to its end.",
      hint: "If your install isn't bound for line-end, just press {{key:dance.seek.word}} a few times to grab the words and their surrounding whitespace.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.select.lineEnd" },
          { kind: "command-fired", id: "dance.seek.word", count: 2 },
        ],
      },
    },
    {
      narrate:
        "Now press **{{key:dance.selections.trimWhitespace}}** ({{action:kak.normal.selections.trim.whitespace}}, default {{kakkey:_}}). The leading and trailing whitespace drops away — you're left with `indented hello`.",
      hint: "If `_` isn't bound, the chip will show whatever Dance command Dance picked for trim-whitespace.",
      goal: { kind: "command-fired", id: "dance.selections.trimWhitespace" },
    },
    {
      narrate:
        "Reset and try the other one. We'll select across two lines this time. Press **{{key:dance.select.down.extend}}** to extend down by one line — your selection now spans from line 1 to line 2 (a *partial* line at each end).",
      goal: { kind: "command-fired", id: "dance.select.down.extend" },
      reset: "initial",
    },
    {
      narrate:
        "Now **{{key:dance.selections.trimLines}}** ({{action:kak.normal.selections.trim.lines}}, default {{kakkey:<a-x>}}) trims any *incomplete lines* from the selection edges. If your selection covered half of line 1 and a sliver of line 2, only the fully-covered lines remain.",
      hint: "Compare with `x` (expand-to-lines, next lesson) — `<a-x>` *shrinks*, `x` *grows*.",
      goal: { kind: "command-fired", id: "dance.selections.trimLines" },
    },
    {
      narrate:
        "Two trims, one habit: when the boundaries of your selection are sloppy, normalise before the next verb. `_` for whitespace, `<a-x>` for partial lines.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
