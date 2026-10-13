"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { avatarGradient, cn } from "@/lib/utils";
import { ChannelMember } from "@/types/channel";
import { Message } from "@/types/message";
import { AtSign, Bold, CalendarClock, Code, Italic, Mic, Paperclip, Reply, Send, Smile, Square, X } from "lucide-react";

const EMOJI_GROUPS = [
  ["😀", "😄", "😂", "🥹", "😍", "🤝", "👏", "🎉", "✅", "🚀"],
  ["👍", "👎", "🙏", "💡", "🔥", "🎯", "💬", "📌", "❤️", "✨"],
];

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

interface MessageComposerProps {
  members: ChannelMember[];
  onSend: (text: string, mentions: string[], replyToId?: string, scheduledFor?: string) => void;
  onAttach: (files: File[]) => void;
  isSending: boolean;
  isUploading: boolean;
  replyTo: Message | null;
  onCancelReply: () => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export function MessageComposer({
  members,
  onSend,
  onAttach,
  isSending,
  isUploading,
  replyTo,
  onCancelReply,
  onTyping,
  onStopTyping,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);

  // Replying (from a message's own "Reply" button) should land focus in the composer, the same
  // way clicking into any reply box would.
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  // Whoever else has this thread open should stop seeing "typing…" once we navigate away,
  // even if the person never explicitly cleared the box (e.g. they just switched channels).
  useEffect(() => onStopTyping, [onStopTyping]);

  // Navigating away while recording releases the microphone and discards the partial clip.
  useEffect(() => () => {
    discardRecordingRef.current = true;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  function toggleMention(userId: string, checked: boolean) {
    setMentions(checked ? [...mentions, userId] : mentions.filter((id) => id !== userId));
  }

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const scheduledAt = scheduledFor ? new Date(scheduledFor) : null;
    if (scheduledAt && (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now())) return;
    onSend(trimmed, mentions, replyTo?._id, scheduledAt?.toISOString());
    setText("");
    setMentions([]);
    setScheduledFor("");
    onStopTyping();
    if (replyTo) onCancelReply();
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    if (e.target.value.trim()) onTyping();
    else onStopTyping();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && replyTo) onCancelReply();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onAttach(files);
    e.target.value = "";
  }

  function wrapText(marker: string) {
    const input = textareaRef.current;
    if (!input) return setText((current) => `${current}${marker}${marker}`);
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = text.slice(start, end);
    const next = `${text.slice(0, start)}${marker}${selected}${marker}${text.slice(end)}`;
    setText(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + marker.length + selected.length;
      input.setSelectionRange(caret, caret);
    });
  }

  function insertEmoji(emoji: string) {
    const input = textareaRef.current;
    if (!input) return setText((current) => current + emoji);
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setText(`${text.slice(0, start)}${emoji}${text.slice(end)}`);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function toggleVoiceRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
      discardRecordingRef.current = false;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || preferred || "audio/webm";
        const extension = mimeType.includes("mp4") ? "m4a" : "webm";
        const recording = new File([new Blob(chunksRef.current, { type: mimeType })], `voice-${Date.now()}.${extension}`, { type: mimeType });
        if (recording.size > 0 && !discardRecordingRef.current) onAttach([recording]);
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        setIsRecording(false);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }

  return (
    <div className="border-t border-border p-3">
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-l-[3px] border-primary/25 border-l-primary bg-primary/8 p-2 text-xs">
          <Reply className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{replyTo.authorName}</p>
            <p className="truncate text-muted-foreground">{replyTo.message || (replyTo.attachments.length > 0 ? "Sent an attachment" : "")}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <div className="rounded-2xl border border-input bg-transparent p-1.5 transition-colors focus-within:border-primary/50 dark:bg-input/30">
        <Textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onBlur={onStopTyping}
          onKeyDown={handleKeyDown}
          placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a message..."}
          className="max-h-32 min-h-9 resize-none border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
        />
        <div className="mt-1 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1">
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              aria-label="Attach files"
              className="rounded-full"
            >
              <Paperclip className="size-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon-sm" onClick={() => wrapText("**")} aria-label="Bold" className="rounded-full">
              <Bold className="size-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => wrapText("*")} aria-label="Italic" className="rounded-full">
              <Italic className="size-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => wrapText("`")} aria-label="Code" className="rounded-full">
              <Code className="size-3.5" />
            </Button>
            <Popover>
              <PopoverTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Choose emoji" className="rounded-full"><Smile className="size-4" /></Button>} />
              <PopoverContent className="w-64 p-2" align="start">
                <div className="grid gap-1">
                  {EMOJI_GROUPS.map((group, index) => <div key={index} className="flex flex-wrap gap-1">{group.map((emoji) => <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="rounded p-1 text-lg hover:bg-muted" aria-label={`Add ${emoji}`}>{emoji}</button>)}</div>)}
                </div>
              </PopoverContent>
            </Popover>
            <Button type="button" variant="ghost" size="icon-sm" onClick={toggleVoiceRecording} aria-label={isRecording ? "Stop voice recording" : "Record voice message"} className={cn("rounded-full", isRecording && "bg-destructive/15 text-destructive animate-pulse")}>
              {isRecording ? <Square className="size-3.5 fill-current" /> : <Mic className="size-4" />}
            </Button>
            <Popover>
              <PopoverTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Schedule message" className={cn("rounded-full", scheduledFor && "text-primary")}><CalendarClock className="size-4" /></Button>} />
              <PopoverContent className="w-64 space-y-2 p-3" align="start">
                <p className="text-sm font-medium">Schedule this message</p>
                <input aria-label="Scheduled date and time" type="datetime-local" min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm" />
                {scheduledFor && <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setScheduledFor("")}>Send now instead</button>}
              </PopoverContent>
            </Popover>

            {members.length > 0 && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button type="button" variant="ghost" size="sm" className="gap-1 rounded-full">
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
                          <AvatarFallback className={cn("text-[9px] font-medium text-white", avatarGradient(m._id))}>
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
            className="shrink-0 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:translate-y-0 disabled:shadow-none"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
