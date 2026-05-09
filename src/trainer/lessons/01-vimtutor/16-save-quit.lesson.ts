import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "16-save-quit",
  folder: "01-vimtutor",
  title: "Vimtutor 5.1 — Saving (Dance + VS Code)",
  blurb:
    "Vim's `:w` writes the buffer; in VS Code it's `Ctrl/Cmd+S` or the command palette. Dance has no `:colon` prompt of its own.",
  est_minutes: 2,
  teaches: ["kak.normal.mode.normal"],
  initial: {
    text: [
      "Imagine this is a real file you've been editing.",
      "In Kakoune you'd type :w<Enter> to save it.",
      "In Dance + VS Code you have three good paths:",
      "  - Ctrl+S (Cmd+S on Mac).",
      "  - Command palette -> 'File: Save'.",
      "  - dance.run with a workbench command.",
      "",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "Make sure you're in Normal mode. If you wrote something accidentally, escape and undo with {{key:dance.history.undo}} (default {{kakkey:u}}).",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "There is no `:w` prompt in Dance. The closest equivalent is `dance.run` invoked from a binding, where you can call `workbench.action.files.save` programmatically.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "For everyday saving the answer is just **Ctrl/Cmd+S**. VS Code's keyboard shortcut works in any mode. Saving doesn't switch you out of Normal.",
      hint: "The harness can't fire OS keys for you, so this step just checks you stayed in Normal.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "If you really want a Vim-style `:w` you can rebind any key (say `Space-w`) to `workbench.action.files.save` via `dance.run`. The /settings page in this app explains how.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
