import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "07-line-objects-vs-lines",
  folder: "03-selections",
  title: "`x` vs `X` vs `<a-x>` vs `<a-K>`: the line family",
  blurb:
    "Four 'line-related' shortcuts that look interchangeable and aren't. Untangling them once saves a lifetime of confusion.",
  est_minutes: 4,
  requires: ["kak.normal.selections.expand"],
  teaches: [
    "kak.normal.selections.expand",
    "kak.normal.select.line.below",
    "kak.normal.select.line.extend",
    "kak.normal.selections.trim.lines",
    "kak.normal.select.line.above",
  ],
  initial: {
    text: "first paragraph line one\nfirst paragraph line two\nfirst paragraph line three\nfirst paragraph line four\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "**`x` — select line / expand-to-line.** Press **{{key:dance.selections.expandToLines}}**. Selection snaps out to whole line 1. *This is the core operation.*",
      hint: "Kak's `dance.selections.expandToLines` and `dance.select.line.below` share the default key `x`. They're nearly the same thing.",
      goal: { kind: "command-fired", id: "dance.selections.expandToLines" },
    },
    {
      narrate:
        "**`x` again — extend by one line.** Press it once more. The selection grows to cover line 2 as well. `x` is *idempotent on a fresh selection, then extending*.",
      goal: { kind: "command-fired", id: "dance.selections.expandToLines", count: 2 },
    },
    {
      narrate:
        "**`X` — extend by one line, even mid-line.** Reset, then run **{{key:dance.select.line.below.extend}}** ({{action:kak.normal.select.line.extend}}, default {{kakkey:X}}). Like `x`, but it always *extends*; it never snaps a partial selection.",
      goal: { kind: "command-fired", id: "dance.select.line.below.extend" },
      reset: "initial",
    },
    {
      narrate:
        "**`<a-x>` — trim partial lines.** It's the *opposite* of `x`. We covered this in lesson 02 — given a sloppy selection that crosses partial lines, **{{key:dance.selections.trimLines}}** chops them off. `x` grows; `<a-x>` shrinks.",
      goal: { kind: "command-fired", id: "dance.selections.trimLines" },
    },
    {
      narrate:
        "**`<a-K>` — select the line above.** Press **{{key:dance.select.line.above}}** ({{action:kak.normal.select.line.above}}, default {{kakkey:<a-K>}}). It selects the *previous* line as a fresh range — not an extension. (Yes, `<a-K>` is *also* sometimes used for filter-drop in some bindings; check your chip.)",
      hint: "Mnemonic: lowercase `x` goes down (or expands), `<a-K>` goes up (different family). When in doubt, look at your chip.",
      goal: { kind: "command-fired", id: "dance.select.line.above" },
    },
    {
      narrate:
        "**Recap, in one breath:** `x` expand/extend down · `X` always extend down · `<a-x>` trim partial · `<a-K>` line above. Memorise the *direction* and the *grow-vs-shrink*; the rest follows.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
