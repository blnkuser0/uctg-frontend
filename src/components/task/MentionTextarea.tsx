"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";

const MENTION_TOKEN = /@([a-zA-Z0-9._-]*)$/;

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  members: User[];
  onMentionsChange: (ids: string[]) => void;
  placeholder?: string;
  rows?: number;
}

/** A plain Textarea with live "@name" autocomplete — typing "@" opens a dropdown of project
 *  members filtered as you type; Enter/click inserts "@Name " and records that member's id. */
export function MentionTextarea({ value, onChange, members, onMentionsChange, placeholder, rows = 3 }: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null); // null = dropdown closed
  const [highlighted, setHighlighted] = useState(0);
  const [mentionIds, setMentionIds] = useState<string[]>([]);

  const matches = query === null ? [] : members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  function syncMentionsFromText(text: string) {
    // Drop any mention whose "@Name" substring no longer appears in the text — keeps the
    // submitted ids in sync with what's actually still visible.
    const stillPresent = mentionIds.filter((id) => {
      const member = members.find((m) => m.id === id);
      return member && text.includes(`@${member.name}`);
    });
    if (stillPresent.length !== mentionIds.length) {
      setMentionIds(stillPresent);
      onMentionsChange(stillPresent);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.target.value;
    onChange(text);
    syncMentionsFromText(text);

    const caret = event.target.selectionStart ?? text.length;
    const beforeCaret = text.slice(0, caret);
    const match = beforeCaret.match(MENTION_TOKEN);
    if (match) {
      setQuery(match[1]);
      setHighlighted(0);
    } else {
      setQuery(null);
    }
  }

  function insertMention(member: User) {
    const textarea = textareaRef.current;
    const caret = textarea?.selectionStart ?? value.length;
    const beforeCaret = value.slice(0, caret);
    const afterCaret = value.slice(caret);
    const matchStart = beforeCaret.search(MENTION_TOKEN);
    if (matchStart === -1) return;

    const next = `${beforeCaret.slice(0, matchStart)}@${member.name} ${afterCaret}`;
    onChange(next);
    const nextMentionIds = mentionIds.includes(member.id) ? mentionIds : [...mentionIds, member.id];
    setMentionIds(nextMentionIds);
    onMentionsChange(nextMentionIds);
    setQuery(null);

    requestAnimationFrame(() => {
      const newCaret = matchStart + member.name.length + 2;
      textarea?.focus();
      textarea?.setSelectionRange(newCaret, newCaret);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || matches.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => (i + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (i - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insertMention(matches[highlighted]);
    } else if (event.key === "Escape") {
      setQuery(null);
    }
  }

  return (
    <Popover open={query !== null && matches.length > 0}>
      <PopoverTrigger
        render={
          <Textarea
            ref={textareaRef}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setQuery(null), 120)}
          />
        }
      />
      <PopoverContent align="start" className="w-56 p-1" initialFocus={false}>
        <div className="grid gap-0.5">
          {matches.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertMention(member)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                index === highlighted && "bg-muted"
              )}
            >
              {member.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
