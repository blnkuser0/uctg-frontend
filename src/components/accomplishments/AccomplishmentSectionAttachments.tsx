"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAddAccomplishmentAttachments, useRemoveAccomplishmentAttachment } from "@/hooks/useAccomplishments";
import { AccomplishmentAttachment, AccomplishmentSection } from "@/types/accomplishment";
import { Paperclip, Trash2, FileIcon } from "lucide-react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Add/remove files for one section (accomplishment/blockers/inProgress) of an existing entry. */
export function AccomplishmentSectionAttachments({
  accomplishmentId,
  section,
  attachments,
}: {
  accomplishmentId: string;
  section: AccomplishmentSection;
  attachments: AccomplishmentAttachment[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addAttachments = useAddAccomplishmentAttachments();
  const removeAttachment = useRemoveAccomplishmentAttachment();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    addAttachments.mutate(
      { id: accomplishmentId, section, files },
      { onError: () => toast.error("Could not upload the file(s).") }
    );
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
            onClick={() => removeAttachment.mutate({ id: accomplishmentId, fileKey: file.fileKey })}
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
