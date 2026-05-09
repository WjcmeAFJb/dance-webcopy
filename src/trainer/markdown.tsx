// Tiny markdown-ish renderer for lesson narration.
//
// Supported syntax (a strict subset of CommonMark — we don't need a full
// parser for the lessons we ship):
//   {{key:dance.command.id}}   inline KeyChip
//   {{kakkey:t}}               inline literal Kakoune letter
//   {{action:dance.command.id}}alias for {{key:...}}
//   `code`                     inline code
//   **bold**                   strong text
//   *italic*                   emphasis
//   blank line                 paragraph break
//
// Lists, headings, and block-code are not supported intentionally — the
// lessons stay short and focused.

import { Fragment, type ReactNode } from "react";

import { KeyChip } from "./key-chip";

interface Token {
  kind: "text" | "code" | "bold" | "em" | "key" | "kakkey";
  value: string;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const push = (t: Token) => tokens.push(t);

  while (i < text.length) {
    if (text.startsWith("{{key:", i) || text.startsWith("{{action:", i)) {
      const close = text.indexOf("}}", i);
      if (close > 0) {
        const inner = text.slice(text.indexOf(":", i) + 1, close);
        push({ kind: "key", value: inner.trim() });
        i = close + 2;
        continue;
      }
    }
    if (text.startsWith("{{kakkey:", i)) {
      const close = text.indexOf("}}", i);
      if (close > 0) {
        const inner = text.slice(text.indexOf(":", i) + 1, close);
        push({ kind: "kakkey", value: inner.trim() });
        i = close + 2;
        continue;
      }
    }
    if (text[i] === "`") {
      const close = text.indexOf("`", i + 1);
      if (close > 0) {
        push({ kind: "code", value: text.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }
    if (text.startsWith("**", i)) {
      const close = text.indexOf("**", i + 2);
      if (close > 0) {
        push({ kind: "bold", value: text.slice(i + 2, close) });
        i = close + 2;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      const close = text.indexOf("*", i + 1);
      if (close > 0 && /[^\s]/.test(text[i + 1] ?? "")) {
        push({ kind: "em", value: text.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }

    // Otherwise accumulate into a text run until the next special.
    let j = i + 1;
    while (
      j < text.length &&
      !text.startsWith("{{key:", j) &&
      !text.startsWith("{{action:", j) &&
      !text.startsWith("{{kakkey:", j) &&
      text[j] !== "`" &&
      !(text.startsWith("**", j)) &&
      !(text[j] === "*" && /[^\s]/.test(text[j + 1] ?? ""))
    ) {
      j++;
    }
    push({ kind: "text", value: text.slice(i, j) });
    i = j;
  }
  return tokens;
}

function renderTokens(tokens: Token[]): ReactNode {
  return tokens.map((tok, idx) => {
    switch (tok.kind) {
      case "text":
        return <Fragment key={idx}>{tok.value}</Fragment>;
      case "code":
        return (
          <code key={idx} style={inlineCodeStyle}>
            {tok.value}
          </code>
        );
      case "bold":
        return <strong key={idx}>{tok.value}</strong>;
      case "em":
        return <em key={idx}>{tok.value}</em>;
      case "key":
        return <KeyChip key={idx} command={tok.value} />;
      case "kakkey":
        return <KeyChip key={idx} literalKey={tok.value} />;
    }
  });
}

export function Narration({ text }: { text: string }) {
  // Split into paragraphs on blank lines so the rendering looks like a
  // proper text block instead of a wall of inlines.
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} style={paragraphStyle}>
          {renderTokens(tokenize(p))}
        </p>
      ))}
    </>
  );
}

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 8px",
  lineHeight: 1.5,
  color: "#d4d4d4",
};

const inlineCodeStyle: React.CSSProperties = {
  background: "#2d2d30",
  border: "1px solid #3c3c3c",
  borderRadius: 4,
  padding: "0 4px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "0.92em",
  color: "#dcdcaa",
};
