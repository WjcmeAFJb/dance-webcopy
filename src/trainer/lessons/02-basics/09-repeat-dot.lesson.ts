import type { Lesson } from "../../types";

export const lesson: Lesson = {
  id: "09-repeat-dot",
  folder: "02-basics",
  title: "Repeat: `.` for the last edit, `<a-.>` for the last seek",
  blurb:
    "Kak splits Vim's `.` into two: text-changing edits replay with `.`, character/word seeks replay with `<a-.>`. Together they cover almost every 'do that again' moment.",
  est_minutes: 4,
  requires: ["kak.normal.edit.yank.delete", "kak.normal.seek.f.fwd"],
  teaches: ["kak.normal.history.repeat", "kak.normal.history.repeat.seek"],
  initial: {
    text: "foo bar baz qux quux\nalpha beta gamma delta\n",
    mode: "normal",
  },
  steps: [
    {
      narrate:
        "Select the first word with **{{key:dance.seek.word}}**, then delete it with **{{key:dance.edit.yank-delete}}**. That single delete is now the *last edit*.",
      goal: { kind: "text-equals", expected: "bar baz qux quux\nalpha beta gamma delta\n" },
    },
    {
      narrate:
        "Move to the next word with **{{key:dance.seek.word}}**, then press **{{key:dance.history.repeat}}** ({{action:kak.normal.history.repeat}}, default {{kakkey:.}}). Kak replays the last edit on the new selection.",
      hint: "After `.` you should have `baz qux quux` on the first line. The dot does *not* replay motions — only the edit.",
      goal: { kind: "command-fired", id: "dance.history.repeat" },
    },
    {
      narrate:
        "Now seek-by-character. Press **{{key:dance.seek.included}}** ({{action:kak.normal.seek.f.fwd}}, default {{kakkey:f}}), then type the character `q` to seek to it. The selection extends to the next `q`.",
      hint: "If `f` isn't bound on your install, the chip will show whatever key Dance assigned to `dance.seek.included`.",
      goal: { kind: "command-fired", id: "dance.seek.included" },
    },
    {
      narrate:
        "Replay that seek with **{{key:dance.history.repeat.seek}}** ({{kakkey:<a-.>}}). Kak finds the *next* `q` without making you re-type the target character.",
      goal: { kind: "command-fired", id: "dance.history.repeat.seek" },
    },
    {
      narrate:
        "Two repeats, two scopes: **dot replays the last edit, alt-dot replays the last seek**. In Vim they're fused into one; in Kak they're orthogonal — and so they compose, e.g. `<a-.>.` means 'next match, repeat the edit on it'.",
      goal: { kind: "mode-is", mode: "normal" },
    },
  ],
};
