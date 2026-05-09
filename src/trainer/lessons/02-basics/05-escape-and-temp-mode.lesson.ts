import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "05-escape-and-temp-mode",
  folder: "02-basics",
  title: "Escape, and the *temporary* normal trick",
  blurb:
    "Two ways out of Insert: full Escape, or `<a-;>` for one normal-mode command and back. The second one is shockingly useful once it's in your fingers.",
  est_minutes: 4,
  requires: ["kak.normal.mode.insert", "kak.normal.mode.normal"],
  teaches: ["kak.normal.mode.normal", "kak.insert.escape-once"],
  initial: {
    text: "function helloWorld() {\n  return 0;\n}\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Enter Insert with **{{key:dance.modes.insert.before}}**. We're going to type a few characters, then bounce out.",
      goal: { kind: "mode-is", mode: "insert" },
    },
    {
      narrate:
        "Type something. When you're ready to leave Insert, press **{{kakkey:<esc>}}** — the one true exit. You'll do this thousands of times per coding session.",
      hint: "Escape is bound directly inside the editor, so even without a custom binding it just works.",
      goal: { kind: "mode-is", mode: "normal" },
    },
    {
      narrate:
        "Now the trick. Re-enter Insert with **{{key:dance.modes.insert.before}}**, type a couple of characters, then press **{{key:dance.modes.set.temporarily.normal}}** (Kak: {{action:kak.insert.escape-once}}). This pops you to Normal **for exactly one command**, then drops back into Insert.",
      hint: "The default chord is {{kakkey:<a-;>}} — Alt-semicolon. It's the same key Kak's docs call *escape-once*.",
      goal: { kind: "command-fired", id: "dance.modes.set.temporarily.normal" },
    },
    {
      narrate:
        "While briefly in Normal, run any motion — say **{{key:dance.select.right.jump}}** — and notice you snap right back to Insert afterwards. (In this emulator the *briefly* part is simulated; on a real Dance install the round-trip is instantaneous.)",
      hint: "Use temp-normal to fix a typo three lines up without losing your place: `<a-;>` then `k` then `r` then keep typing.",
      goal: {
        kind: "any",
        goals: [
          { kind: "command-fired", id: "dance.select.right.jump" },
          { kind: "command-fired", id: "dance.select.left.jump" },
          { kind: "command-fired", id: "dance.select.up.jump" },
          { kind: "command-fired", id: "dance.select.down.jump" },
        ],
      },
    },
    {
      narrate:
        "Press **{{kakkey:<esc>}}** to land back in Normal for good. Two escape paths, one habit: full escape for a real *exit*, temp-escape for a one-shot detour.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
