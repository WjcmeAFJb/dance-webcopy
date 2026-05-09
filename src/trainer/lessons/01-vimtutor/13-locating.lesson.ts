import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "13-locating",
  folder: "01-vimtutor",
  title: "Vimtutor 4.1 — Locating yourself (gg, ge, gi)",
  blurb:
    "Vim's `G` and `gg` jump to file edges. Kak puts these under a goto submenu reachable via `g`.",
  est_minutes: 4,
  teaches: [
    "kak.normal.goto",
    "kak.normal.goto.firstLine",
    "kak.normal.goto.lastLine",
    "kak.normal.goto.lineStartIndent",
  ],
  discrepancies: ["disc.linenumbers"],
  initial: {
    text: [
      "first line",
      "    second line with leading whitespace",
      "third line",
      "fourth line",
      "fifth line",
      "sixth line",
      "seventh line",
      "eighth line",
      "ninth line",
      "tenth and last line",
      "",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "Press {{key:dance.select.firstLine.jump}} (default keys are `gg` — first `g` opens the goto menu, second `g` confirms first line). Watch the selection jump to line 1.",
      hint: "`g` in Kak is a prefix that opens a submenu of jumps.",
      goal: { kind: "cursor-at", line: 0, col: 1 },
    },
    {
      narrate:
        "Now {{key:dance.select.lastLine}} (default `ge`) — same submenu, but `e` for *end of file*. In Vim that's just `G`. Land on the last line.",
      goal: { kind: "command-fired", id: "dance.select.lastLine" },
    },
    {
      narrate: "Get back to the first line with {{key:dance.select.firstLine.jump}}.",
      goal: { kind: "cursor-at", line: 0, col: 1 },
    },
    {
      narrate:
        "Move down to line 2 (the indented one). Now press {{key:dance.select.lineStart.skipBlank.jump}} (default `gi`). The cursor lands on the first non-whitespace character — Vim's `^`. Useful when you want to start typing right at the indent.",
      goal: { kind: "command-fired", id: "dance.select.lineStart.skipBlank.jump" },
    },
    {
      narrate:
        "**A quirk worth flagging**: VS Code (with Dance) toggles `editor.lineNumbers` between absolute and relative when modes change. Real Kak doesn't do this. If the flicker bothers you, set `dance.modes.normal.lineNumbers` to a fixed value.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
