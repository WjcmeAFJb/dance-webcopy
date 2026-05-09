import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "04-whole-buffer",
  folder: "03-selections",
  title: "Select the whole buffer: `%`",
  blurb:
    "One keystroke replaces every selection with a single one spanning the entire file. The setup move for global edits.",
  est_minutes: 2,
  teaches: ["kak.normal.select.buffer"],
  initial: {
    text: "function add(a, b) {\n  return a + b;\n}\n\nfunction sub(a, b) {\n  return a - b;\n}\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Press **{{key:dance.select.buffer}}** ({{action:kak.normal.select.buffer}}, default {{kakkey:%}}). The single selection now spans **every character** of the buffer.",
      hint: "On a US-QWERTY layout `%` is shift-5. In this sandbox bare `5` also works (the emulator helps you out).",
      goal: { kind: "command-fired", id: "dance.select.buffer" },
    },
    {
      narrate:
        "**Why this matters.** `%` is the natural setup for buffer-wide operations: `%s\\d+<ret>` selects every digit-run, `%>` indents the entire file, `%|sort<ret>` (in real Kak) pipes the whole buffer through `sort`. Each is *one* `%` plus one verb.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Now move away. Press **{{key:dance.select.left.jump}}** to drop back to a one-cell selection — `%` doesn't pin anything, it's just a selection like any other.",
      goal: { kind: "command-fired", id: "dance.select.left.jump" },
    },
    {
      narrate:
        "Press **{{key:dance.select.buffer}}** again, and immediately delete with **{{key:dance.edit.yank-delete}}**. The buffer empties — `%d` is the *clear-the-file* idiom.",
      hint: "The emulator's text-equals goal accepts an empty buffer (or a single newline, depending on initial state).",
      goal: { kind: "text-matches", pattern: /^$|^\s*$/ },
    },
  ],
};
