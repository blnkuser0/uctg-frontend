import React from "react";

const URL = /^(https?:\/\/[^\s<]+)$/i;
const MARKDOWN_LINK = /^\[([^\]]+)]\((https?:\/\/[^\s)]+)\)$/i;

function renderToken(token: string, key: string): React.ReactNode {
  const link = token.match(MARKDOWN_LINK);
  if (link) {
    return <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline decoration-current/50 underline-offset-2 hover:decoration-current">{link[1]}</a>;
  }
  if (URL.test(token)) {
    return <a key={key} href={token} target="_blank" rel="noopener noreferrer" className="underline decoration-current/50 underline-offset-2 hover:decoration-current">{token}</a>;
  }
  if (token.startsWith("**") && token.endsWith("**") && token.length > 4) return <strong key={key}>{token.slice(2, -2)}</strong>;
  if (token.startsWith("~~") && token.endsWith("~~") && token.length > 4) return <del key={key}>{token.slice(2, -2)}</del>;
  if (token.startsWith("`") && token.endsWith("`") && token.length > 2) return <code key={key} className="rounded bg-black/10 px-1 py-0.5 text-[0.9em] dark:bg-white/10">{token.slice(1, -1)}</code>;
  if (token.startsWith("*") && token.endsWith("*") && token.length > 2) return <em key={key}>{token.slice(1, -1)}</em>;
  return <React.Fragment key={key}>{token}</React.Fragment>;
}

/**
 * A deliberately small, React-only renderer for the text format produced by Catalyst Space.
 * It never accepts message HTML, which keeps a paste or API payload from becoming executable UI.
 */
export function RichMessageText({ value }: { value: string }) {
  const parts = value.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<]+|\*\*[^*\n]+\*\*|~~[^~\n]+~~|`[^`\n]+`|\*[^*\n]+\*)/g);
  return <>{parts.map((part, index) => renderToken(part, `${index}-${part.slice(0, 12)}`))}</>;
}
