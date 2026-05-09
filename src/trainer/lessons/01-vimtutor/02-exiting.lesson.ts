import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "02-exiting",
  folder: "01-vimtutor",
  title: "Vimtutor 1.2 — Bailing out (Dance edition)",
  blurb:
    "Vimtutor's second lesson teaches `:q!` so you can flee a wedged editor. Inside VS Code there's no `:q` — but there *is* a Normal mode you can always retreat to.",
  est_minutes: 2,
  teaches: ["kak.normal.mode.normal", "kak.normal.mode.insert"],
  discrepancies: ["disc.linenumbers"],
  initial: {
    text: [
      "Vim teaches you :q! early because terminals trap you.",
      "VS Code is graphical, so the equivalent reflex is different:",
      "    1. Make sure you're in Normal mode (the chip in the corner).",
      "    2. If you typed garbage in Insert, just hit <esc>.",
      "    3. Save and close the tab from the command palette.",
      "",
      "Below: practice the Insert -> Normal bounce a few times.",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "First, drop into Insert with {{key:dance.modes.insert.before}}. In Vim this is the `i` key; in Dance it's whatever you've bound (default still {{kakkey:i}}).",
      goal: { kind: "mode-is", mode: "insert" },
    },
    {
      narrate:
        "Pretend you mistyped. The Vim escape hatch is `<esc>` — same in Kak/Dance. Press it now.",
      hint: "Top-left of your keyboard. The Escape key.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "If you're worried about flickering line-numbers when you switch modes — Dance toggles the `editor.lineNumbers` setting between absolute and relative. That's a Dance-only behaviour, configurable in `dance.modes`.",
      goal: { kind: "command-fired", id: "dance.modes.set.normal" },
    },
    {
      narrate:
        "To save in VS Code use the command palette (`Ctrl+Shift+P` -> `File: Save`) or the OS shortcut. The closest Dance does to `:q!` is closing the tab. There's no in-editor `:q` prompt; we'll cover saving in lesson 16.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
