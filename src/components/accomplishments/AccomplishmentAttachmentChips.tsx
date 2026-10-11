import { AccomplishmentAttachment } from "@/types/accomplishment";
import { FileIcon } from "lucide-react";

/** Read-only chip list for the card view — managing (add/remove) happens in the edit dialog. */
export function AccomplishmentAttachmentChips({ attachments }: { attachments: AccomplishmentAttachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {attachments.map((file) => (
        <a
          key={file.fileKey}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
        >
          <FileIcon className="size-3" />
          <span className="max-w-[10rem] truncate">{file.originalName}</span>
        </a>
      ))}
    </div>
  );
}
