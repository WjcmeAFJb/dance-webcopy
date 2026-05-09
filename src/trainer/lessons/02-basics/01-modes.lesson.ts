import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "01-modes",
  folder: "02-basics",
  title: "Modes 101: normal, insert, and back",
  blurb:
    "Kakoune is modal. Normal mode moves and selects; Insert mode types. Master the cycle and everything else clicks.",
  est_minutes: 5,
  teaches: [
    "kak.normal.mode.insert",
    "kak.normal.mode.normal",
    "kak.normal.insert.before",
    "kak.normal.insert.after",
    "kak.normal.insert.lineStart",
    "kak.normal.insert.lineEnd",
  ],
  discrepancies: ["disc.linenumbers", "disc.selection.shape"],
  initial: {
    text: "Hello, Kakoune.\nThe selection is the noun; the next key is the verb.\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "You start in **Normal mode**. The bar above the editor reads `MODE: NORMAL`. Notice the **block-shaped selection** on the first character — that's the *current selection*, and every command operates on it. Press {{key:dance.modes.insert.before}} to enter Insert mode **before** that selection.",
      hint: "On a default Dance/Kak install this is just {{kakkey:i}}. If your chip shows a different key, press what it shows.",
      goal: { kind: "mode-is", mode: "insert" },
    },
    {
      narrate:
        "You are now in **Insert mode** — type a few characters. The cursor is a thin caret here, like in any normal editor. When you're done, press {{kakkey:<esc>}} to return to Normal.",
      hint: "Escape lives top-left of your keyboard. Pressing it is the universal *get-me-out* — you'll do it constantly.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Now try **{{key:dance.modes.insert.after}}** — Insert *after* the selection. This is how you append. Watch where the caret lands.",
      goal: { kind: "mode-is", mode: "insert" },
    },
    {
      narrate:
        "Press Escape, then **{{key:dance.modes.insert.lineStart}}** to enter Insert at the **start of the line** (skipping leading whitespace).",
      hint: "If you forget to escape first, you'll just type a literal `I`. Escape, then capital I.",
      goal: {
        kind: "all",
        goals: [
          { kind: "mode-is", mode: "insert" },
          { kind: "command-fired", id: "dance.modes.insert.lineStart" },
        ],
      },
    },
    {
      narrate:
        "Escape once more, then **{{key:dance.modes.insert.lineEnd}}** to insert at the **end of the line** — the equivalent of vim's `A`.",
      goal: {
        kind: "all",
        goals: [
          { kind: "mode-is", mode: "insert" },
          { kind: "command-fired", id: "dance.modes.insert.lineEnd" },
        ],
      },
    },
    {
      narrate:
        "Escape one last time. You've now seen four entry points into Insert and one way out. **Select mode** (the third member of the trio) is similar to Normal but extends instead of replacing — we'll meet it in a later lesson.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
