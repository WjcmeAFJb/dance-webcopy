import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "06-split-on-lines",
  folder: "03-selections",
  title: "Split on lines: `<a-s>` — one selection per line",
  blurb:
    "Take a multi-line selection and slice it into one-selection-per-line. The fastest way into multi-cursor land for line-based edits.",
  est_minutes: 3,
  requires: ["kak.normal.selections.expand"],
  teaches: ["kak.normal.selections.split.lines"],
  initial: {
    text: "function alpha() {}\nfunction beta()  {}\nfunction gamma() {}\nfunction delta() {}\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Grow the selection over the first three lines: press **{{key:dance.selections.expandToLines}}** ({{kakkey:x}}) three times to cover lines 1-3.",
      hint: "Three presses of `x` — first expands to line 1, second extends to line 2, third to line 3.",
      goal: { kind: "command-fired", id: "dance.selections.expandToLines", count: 3 },
    },
    {
      narrate:
        "Now press **{{key:dance.selections.splitLines}}** ({{action:kak.normal.selections.split.lines}}, default {{kakkey:<a-s>}}). Your single 3-line selection becomes **three separate selections**, one per line. Multi-cursor mode, achieved.",
      hint: "On the editor, you should see three blocks instead of one big one. Each is independent — verbs apply to all of them at once.",
      goal: { kind: "command-fired", id: "dance.selections.splitLines" },
    },
    {
      narrate:
        "**Why split-lines is special.** Most multi-cursor entries (`s`, `S`, `<a-K>`) are regex-driven. `<a-s>` is the *boring, reliable* one: it just slices on `\\n`. Use it whenever you've expanded to a region and want the same edit on each line.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Try a downstream edit. With three selections active, press **{{key:dance.modes.insert.lineEnd}}** to enter Insert at the end of *each* line.",
      hint: "Default chord is {{kakkey:A}}. After this, every selection is at end-of-line and you're in Insert.",
      goal: { kind: "mode-is", mode: "insert" },
    },
    {
      narrate:
        "Type a few characters — they appear on **every** line at once. That's multi-cursor in two keystrokes (`<a-s>` + `A`) starting from a multi-line selection.",
      goal: { kind: "mode-is", mode: "insert" },
    },
  ],
};
