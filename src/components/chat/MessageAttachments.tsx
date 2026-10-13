import { FileIcon } from "lucide-react";
import { TaskAttachment } from "@/types/task";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeOf(file: TaskAttachment): "image" | "video" | "audio" | "file" {
  if (file.mimeType.startsWith("image/")) return "image";
  if (file.mimeType.startsWith("video/")) return "video";
  if (file.mimeType.startsWith("audio/")) return "audio";
  return "file";
}

export function MessageAttachments({ attachments }: { attachments: TaskAttachment[] }) {
  return (
    <div className="grid max-w-[min(80vw,34rem)] gap-1.5">
      {attachments.map((file) => {
        const kind = typeOf(file);
        if (kind === "image") {
          return (
            <a key={file.fileKey} href={file.url} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {/* Native img keeps private/backend attachment URLs usable without a Next remote-host allowlist. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.url} alt={file.originalName} className="max-h-96 w-auto max-w-full object-contain" loading="lazy" />
            </a>
          );
        }
        if (kind === "video") {
          return <video key={file.fileKey} controls preload="metadata" className="max-h-96 max-w-full rounded-xl border border-border bg-black"><source src={file.url} type={file.mimeType} /></video>;
        }
        if (kind === "audio") {
          return <audio key={file.fileKey} controls preload="metadata" className="max-w-full"><source src={file.url} type={file.mimeType} /></audio>;
        }
        return (
          <a key={file.fileKey} href={file.url} target="_blank" rel="noopener noreferrer" className="flex max-w-xs items-center gap-2 rounded-xl border border-border bg-card p-2 text-sm shadow-sm hover:bg-muted">
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
          </a>
        );
      })}
    </div>
  );
}
