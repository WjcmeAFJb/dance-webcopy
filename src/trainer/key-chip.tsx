// Render a key chip — looks like a tiny keyboard button. Used inside lesson
// narration via the `{{key:command-id}}` token, and by the trainer panel
// header to list teaches/required commands.

import { lookupKeyFor, chordLabels, type ResolvedBinding } from "./keymap";

export type KeyChipProps =
  | { command: string; literalKey?: undefined; className?: string }
  | { literalKey: string; command?: undefined; className?: string };

export function KeyChip(props: KeyChipProps) {
  if (props.literalKey != null) {
    return <KeyChord chord={{ modifiers: [], key: props.literalKey }} />;
  }
  const command = props.command!;
  const binding = lookupKeyFor(command);
  if (!binding) {
    return (
      <span style={chipUnknownStyle} title={`No keybinding for ${command}`}>
        unbound
        <code style={{ opacity: 0.6, marginLeft: 4 }}>{command}</code>
      </span>
    );
  }
  return <Sequence binding={binding} />;
}

function Sequence({ binding }: { binding: ResolvedBinding }) {
  return (
    <span
      style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
      title={`${binding.command}${binding.when ? `   when: ${binding.when}` : ""}`}
    >
      {binding.sequence.map((chord, i) => (
        <span key={i} style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
          <KeyChord chord={chord} />
        </span>
      ))}
    </span>
  );
}

function KeyChord({ chord }: { chord: { modifiers: readonly string[]; key: string } }) {
  const labels = chordLabels(chord as never);
  return (
    <span style={chordWrapStyle}>
      {labels.map((label, i) => (
        <kbd key={i} style={kbdStyle}>
          {label}
        </kbd>
      ))}
    </span>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  minWidth: 18,
  padding: "1px 6px",
  background: "#2d2d30",
  border: "1px solid #3c3c3c",
  borderBottomWidth: 2,
  borderRadius: 4,
  color: "#e1e1e1",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 11,
  lineHeight: 1.2,
  textAlign: "center",
};

const chordWrapStyle: React.CSSProperties = {
  display: "inline-flex",
  gap: 2,
  alignItems: "center",
};

const chipUnknownStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "1px 6px",
  background: "rgba(244, 135, 113, 0.15)",
  border: "1px dashed #f48771",
  borderRadius: 4,
  color: "#f48771",
  fontSize: 11,
};
