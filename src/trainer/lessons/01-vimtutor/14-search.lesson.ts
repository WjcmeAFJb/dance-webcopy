import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "14-search",
  folder: "01-vimtutor",
  title: "Vimtutor 4.2 — Search (/, ?, n, N)",
  blurb:
    "Forward and backward search, with `n` and N to walk the matches. Plus Kak's `<a-n>` and `<a-N>` for the reverse direction.",
  est_minutes: 4,
  teaches: [
    "kak.normal.search.forward",
    "kak.normal.search.backward",
    "kak.normal.search.next",
    "kak.normal.search.prev",
    "kak.normal.search.next.add",
    "kak.normal.search.prev.add",
  ],
  discrepancies: ["disc.search.case"],
  initial: {
    text: [
      "Search for ERROR strings: errroor is a typo, errroor again,",
      "and one more errroor here. Then back to clean prose.",
      "errroor count: three. Use n to walk forward, <a-n> backward.",
      "",
    ].join("\n"),
  },
  steps: [
    {
      narrate:
        "Press {{key:dance.search}} (default {{kakkey:/}}). A prompt opens — type `errroor` and confirm. The next match becomes the new selection.",
      hint: "In Dance the prompt accepts a JS regex. So `err+oor` would also work.",
      goal: { kind: "command-fired", id: "dance.search" },
    },
    {
      narrate: "Repeat the search forward with {{key:dance.search.next}} (default {{kakkey:n}}).",
      goal: { kind: "command-fired", id: "dance.search.next" },
    },
    {
      narrate:
        "Walk backward with {{key:dance.search.previous}} (default {{kakkey:<a-n>}}). In Vim that'd be `N`; Kak uses Alt-n so capital N can mean *add a match*.",
      goal: { kind: "command-fired", id: "dance.search.previous" },
    },
    {
      narrate:
        "And here's a Kak superpower: {{key:dance.search.next.add}} (default {{kakkey:N}}) keeps the current selection AND adds the next match. You end up with multiple cursors. Try it once.",
      hint: "Multi-cursor edits are a couple of folders away — but the seed is right here.",
      goal: { kind: "command-fired", id: "dance.search.next.add" },
    },
    {
      narrate:
        "Backward search is {{key:dance.search.backward}} (default {{kakkey:<a-/>}}). Vim's `?` would be its analogue, but Kak reserves the unmodified `?` for *extend*-search.",
      goal: { kind: "command-fired", id: "dance.search.backward" },
    },
    {
      narrate:
        "**Heads up on case**: Dance's `/` runs your input as a JavaScript regex with no smart-case fallback. If you want smart-case, use {{key:dance.search.selection.smart}} on a selection, or pass `(?i)` in the pattern.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
