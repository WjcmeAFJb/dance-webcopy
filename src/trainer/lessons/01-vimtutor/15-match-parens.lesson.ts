import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "15-match-parens",
  folder: "01-vimtutor",
  title: "Vimtutor 4.3 — Matching brackets (m, M)",
  blurb:
    "Vim's `%` jumps to the matching brace. Kak's `m` selects to it — and `M` extends instead of replacing.",
  est_minutes: 3,
  teaches: [
    "kak.normal.seek.match.fwd",
    "kak.normal.seek.match.bwd",
    "kak.normal.seek.match.fwd.extend",
  ],
  initial: {
    text: ["This ( is a test line with ('s, ['s ] and {'s } in it. ))", ""].join("\n"),
  },
  steps: [
    {
      narrate:
        "Position the selection on the first `(` in the line. Use {{key:dance.select.right.jump}} or {{key:dance.seek}} to land there.",
      hint: "The first `(` is at column 6.",
      goal: { kind: "cursor-at", line: 0, col: 6 },
    },
    {
      narrate:
        "Press {{key:dance.seek.enclosing}} (default {{kakkey:m}}). The selection now spans from the `(` to its matching `)` — that's *more useful* than Vim's `%` which only moves the cursor.",
      goal: { kind: "command-fired", id: "dance.seek.enclosing" },
    },
    {
      narrate:
        "Press it again. Kak walks to the next pair, replacing the selection. Use {{key:dance.seek.enclosing.extend}} (default {{kakkey:M}}) to *extend* instead of replace.",
      goal: { kind: "command-fired", id: "dance.seek.enclosing.extend" },
    },
    {
      narrate:
        "And {{key:dance.seek.enclosing.backward}} (default {{kakkey:<a-m>}}) walks the matches backward. The capital `M` family extends, the alt family reverses — that pattern repeats across Kak.",
      goal: { kind: "command-fired", id: "dance.seek.enclosing.backward" },
    },
    {
      narrate:
        "When you want to operate *inside* brackets (not on the brackets themselves), use object selection: `<a-i>(` for inner-paren, `<a-a>(` for around-paren. Object lessons are coming.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
