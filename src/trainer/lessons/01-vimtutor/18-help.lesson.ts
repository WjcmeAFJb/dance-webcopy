import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "18-help",
  folder: "01-vimtutor",
  title: "Vimtutor 7.1 — Where to find help",
  blurb:
    "Vim has `:help`. Dance has VS Code's command palette plus this app's /coverage and /settings pages.",
  est_minutes: 2,
  teaches: [],
  initial: {
    text: [
      "You finished the vimtutor port. Where to next?",
      "",
      "  - /coverage — every Kak action, with its Dance binding (or note 'missing').",
      "  - /settings — your current keybindings, edit and reset.",
      "  - 02-basics  — gentler re-walk of the same material.",
      "  - 03-selections onward — Kak-specific power moves.",
      "",
      "Browse them in the sidebar; come back here when you want a refresher.",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "Vim's `:help` is its own little reading mode. Dance has nothing of the sort built in — the closest thing is *this app*. The **Coverage** page lists every Kakoune normal-mode action and shows whether Dance implements it.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "The **Settings** page shows the keymap currently in effect. If you edit a binding there, every lesson immediately re-renders with your new key (every `{{key:...}}` chip is live).",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "VS Code's command palette (`Ctrl/Cmd+Shift+P`) is the universal escape hatch — anything Dance exposes is searchable there as `Dance: ...`. That's how you discover commands you don't have a binding for yet.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Lastly, the upstream Kakoune docs (`man kak`, the asciidoc files in the Kak repo) are the canonical reference for action *semantics*. Dance follows them where it can; the **Discrepancies** chips you've been seeing flag the cases where it doesn't.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
