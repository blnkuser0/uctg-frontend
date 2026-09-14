"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ChannelMember } from "@/types/channel";
import { AtSign, Paperclip, Send } from "lucide-react";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

interface MessageComposerProps {
  members: ChannelMember[];
  onSend: (text: string, mentions: string[]) => void;
  onAttach: (files: File[]) => void;
  isSending: boolean;
  isUploading: boolean;
}

export function MessageComposer({ members, onSend, onAttach, isSending, isUploading }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleMention(userId: string, checked: boolean) {
    setMentions(checked ? [...mentions, userId] : mentions.filter((id) => id !== userId));
  }

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, mentions);
    setText("");
    setMentions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onAttach(files);
    e.target.value = "";
  }

  return (
    <div className="border-t border-border p-3">
      <Textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        className="max-h-32 min-h-9 resize-none"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            aria-label="Attach files"
          >
            <Paperclip className="size-4" />
          </Button>

          {members.length > 0 && (
            <Popover>
              <PopoverTrigger
                render={
                  <Button type="button" variant="ghost" size="sm" className="gap-1">
                    <AtSign className="size-4" />
                    {mentions.length > 0 ? mentions.length : ""}
                  </Button>
                }
              />
              <PopoverContent className="w-56 p-2" align="start">
                <div className="grid gap-1.5">
                  {members.map((m) => (
                    <label key={m._id} className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                      <Checkbox checked={mentions.includes(m._id)} onCheckedChange={(c) => toggleMention(m._id, c === true)} />
                      <Avatar className="size-5">
                        <AvatarFallback className="bg-cyan-500/20 text-[9px] text-cyan-700">
                          {initials(m.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Label className="cursor-pointer font-normal">{m.name}</Label>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!text.trim() || isSending}
          className="shrink-0 bg-cyan-600 text-white hover:bg-cyan-500"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
