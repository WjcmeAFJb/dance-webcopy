import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "01-cursor-motion",
  folder: "01-vimtutor",
  title: "Vimtutor 1.1 — Cursor motion (Kak edition)",
  blurb:
    "The opening of vimtutor, ported to Kakoune: hjkl moves, except in Kak you're nudging a *selection*, never a bare caret.",
  est_minutes: 3,
  teaches: [
    "kak.normal.select.left",
    "kak.normal.select.down",
    "kak.normal.select.up",
    "kak.normal.select.right",
  ],
  discrepancies: ["disc.selection.shape"],
  initial: {
    text: [
      "         k",
      "         |",
      "    h <-- + --> l",
      "         |",
      "         v",
      "         j",
      "",
      "** Hop down with j until you land on the bottom marker line, then jump to the end of it. **",
      "",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "Welcome. Kakoune's hjkl feel like Vim's, with one difference you'll notice immediately: every motion key in Normal mode *replaces* the current selection with a new one. There is no selection-less state. Your block of one character is a selection of length 1.\n\nMove down once with {{key:dance.select.down.jump}}.",
      hint: "If you don't have a custom binding, it's the {{kakkey:j}} key.",
      goal: { kind: "cursor-at", line: 1, col: 1 },
    },
    {
      narrate:
        "Good. Keep going — land the cursor on line 8 (the row that says `** Hop down ... **`). Press {{key:dance.select.down.jump}} until you're there.",
      hint: "Six more presses from here.",
      goal: { kind: "cursor-at", line: 7, col: 1 },
    },
    {
      narrate:
        "Now drift right with {{key:dance.select.right.jump}} a few times. Watch the selection: each press grabs the next cell, dropping the previous one.",
      goal: { kind: "command-fired", id: "dance.select.right.jump", count: 3 },
    },
    {
      narrate:
        "If you ever overshoot, {{key:dance.select.left.jump}} walks you back, and {{key:dance.select.up.jump}} undoes a `j`. Try left and up once each.",
      goal: {
        kind: "all",
        goals: [
          { kind: "command-fired", id: "dance.select.left.jump" },
          { kind: "command-fired", id: "dance.select.up.jump" },
        ],
      },
    },
    {
      narrate:
        "That's the whole motion vocabulary at this level: four keys, four directions. Vim users sometimes describe the *cursor* as moving — in Kakoune it's clearer to say the *selection* is moving. Same fingers, different mental model.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.select.down.jump", count: 4 },
          { kind: "command-fired", id: "dance.select.right.jump", count: 4 },
        ],
      },
    },
  ],
};
