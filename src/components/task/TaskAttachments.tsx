"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAddAttachments, useRemoveAttachment } from "@/hooks/useTask";
import { TaskAttachment } from "@/types/task";
import { Paperclip, Trash2, FileIcon } from "lucide-react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({
  taskId,
  projectId,
  attachments,
}: {
  taskId: string;
  projectId: string;
  attachments: TaskAttachment[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addAttachments = useAddAttachments(taskId, projectId);
  const removeAttachment = useRemoveAttachment(taskId, projectId);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    addAttachments.mutate(files, {
      onError: () => toast.error("Could not upload the file(s)."),
    });
    e.target.value = "";
  }

  return (
    <div className="grid gap-2">
      {attachments.map((file) => (
        <div key={file.fileKey} className="flex items-center gap-2 rounded-lg border border-border p-2">
          <FileIcon className="size-4 shrink-0 text-muted-foreground" />
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm hover:underline">
            {file.originalName}
          </a>
          <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
          <button
            onClick={() => removeAttachment.mutate(file.fileKey)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove attachment"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}

      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-start"
        disabled={addAttachments.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="size-4" />
        {addAttachments.isPending ? "Uploading..." : "Attach files"}
      </Button>
    </div>
  );
}
