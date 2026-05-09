// Verify that the current observed editor state satisfies a lesson goal.
//
// Mirrors `dance-training/src/lessons/verifier.ts` but operates on the
// `ObservedEditorState` we read from real Monaco + Dance.

import type { Goal, ObservedEditorState, Range } from "./types";

export function verify(state: ObservedEditorState, goal: Goal): boolean {
  switch (goal.kind) {
    case "text-equals":
      return state.text === goal.expected;
    case "text-matches":
      return goal.pattern.test(state.text);
    case "selections-equal":
      return rangesEqual(state.selections, goal.ranges);
    case "cursor-at": {
      const r = state.selections[0];
      return !!r && r.active.line === goal.line && r.active.col === goal.col;
    }
    case "command-fired": {
      const count = state.commandLog.filter((e) => e.id === goal.id).length;
      if (goal.count !== undefined) return count >= goal.count;
      return count > 0;
    }
    case "register": {
      const reg = state.registers[goal.name];
      return Array.isArray(reg) && reg.length > 0 && reg[0] === goal.equals;
    }
    case "mode-is":
      return state.mode === goal.mode;
    case "all":
      return goal.goals.every((g) => verify(state, g));
    case "any":
      return goal.goals.some((g) => verify(state, g));
  }
}

function rangesEqual(a: readonly Range[], b: readonly Range[]): boolean {
  if (a.length !== b.length) return false;
  const arr = [...a];
  for (const r of b) {
    const idx = arr.findIndex((x) => rangeEqual(x, r));
    if (idx < 0) return false;
    arr.splice(idx, 1);
  }
  return true;
}

function rangeEqual(a: Range, b: Range): boolean {
  return (
    a.anchor.line === b.anchor.line &&
    a.anchor.col === b.anchor.col &&
    a.active.line === b.active.line &&
    a.active.col === b.active.col
  );
}
