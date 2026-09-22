function summarize(names: string[]): string {
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names.length} people are typing`;
}

export function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 pb-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-0.5" aria-hidden>
        <span className="catalyst-typing-dot size-1.5 rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="catalyst-typing-dot size-1.5 rounded-full bg-muted-foreground [animation-delay:150ms]" />
        <span className="catalyst-typing-dot size-1.5 rounded-full bg-muted-foreground [animation-delay:300ms]" />
      </span>
      <span>{summarize(names)}…</span>
    </div>
  );
}
