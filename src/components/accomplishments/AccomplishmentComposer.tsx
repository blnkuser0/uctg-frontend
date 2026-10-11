"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddAccomplishmentAttachments, useCreateAccomplishment } from "@/hooks/useAccomplishments";
import { toPhDateKey } from "@/lib/utils";
import { AccomplishmentSection } from "@/types/accomplishment";
import { Sparkles, X, Paperclip } from "lucide-react";

const logAccomplishmentSchema = z.object({
  date: z.string().min(1, "Required"),
  accomplishment: z.string().trim().min(1, "Tell us what you got done"),
  blockers: z.string().trim(),
  inProgress: z.string().trim(),
});

type LogAccomplishmentValues = z.infer<typeof logAccomplishmentSchema>;

const SECTIONS: { key: AccomplishmentSection; label: string; placeholder: string; required?: boolean }[] = [
  { key: "accomplishment", label: "Accomplishments", placeholder: "e.g. Finished the client onboarding flow", required: true },
  { key: "blockers", label: "Blockers", placeholder: "Anything holding you up? Leave blank if none." },
  { key: "inProgress", label: "In progress", placeholder: "What's still ongoing?" },
];

const EMPTY_STAGED: Record<AccomplishmentSection, File[]> = { accomplishment: [], blockers: [], inProgress: [] };

function StagedFilesPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > 0) onChange([...files, ...picked]);
    e.target.value = "";
  }

  return (
    <div className="grid gap-1.5">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <span className="max-w-[10rem] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handlePick} />
      <Button type="button" variant="outline" size="sm" className="w-fit justify-start" onClick={() => inputRef.current?.click()}>
        <Paperclip className="size-3.5" />
        Attach files
      </Button>
    </div>
  );
}

/**
 * Inline, collapsible report composer — mirrors Suprah Daypulse's "not a modal" pattern: a
 * clickable trigger card that expands in place above the feed, rather than a Dialog overlay.
 */
export function AccomplishmentComposer() {
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<Record<AccomplishmentSection, File[]>>(EMPTY_STAGED);
  const createAccomplishment = useCreateAccomplishment();
  const addAttachments = useAddAccomplishmentAttachments();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogAccomplishmentValues>({
    resolver: zodResolver(logAccomplishmentSchema),
    defaultValues: { date: toPhDateKey(new Date()), accomplishment: "", blockers: "", inProgress: "" },
  });

  function resetAll() {
    reset({ date: toPhDateKey(new Date()), accomplishment: "", blockers: "", inProgress: "" });
    setStaged(EMPTY_STAGED);
  }

  async function onSubmit(values: LogAccomplishmentValues) {
    try {
      const entry = await createAccomplishment.mutateAsync(values);

      for (const section of SECTIONS.map((s) => s.key)) {
        const files = staged[section];
        if (files.length === 0) continue;
        await addAttachments.mutateAsync({ id: entry._id, section, files });
      }

      toast.success("Daily progress logged");
      resetAll();
      setOpen(false);
    } catch {
      toast.error("Could not log this. Please try again.");
    }
  }

  const isPending = createAccomplishment.isPending || addAttachments.isPending;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="catalyst-panel flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-600">
          <Sparkles className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">Log today&apos;s Daily Progress</span>
          <span className="block text-xs text-muted-foreground">
            What did you get done, what&apos;s blocking you, and what&apos;s still in progress?
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white">Start report</span>
      </button>
    );
  }

  return (
    <div className="catalyst-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-cyan-500/6 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-cyan-600" />
          New Daily Progress report
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            resetAll();
          }}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <form className="grid gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-1.5 sm:w-48">
          <Label htmlFor="accomplishmentDate">Date</Label>
          <Input id="accomplishmentDate" type="date" max={toPhDateKey(new Date())} {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        {SECTIONS.map(({ key, label, placeholder, required }) => (
          <div key={key} className="grid gap-1.5">
            <Label htmlFor={`accomplishment-${key}`}>
              {label}
              {!required && <span className="text-muted-foreground"> (optional)</span>}
            </Label>
            <Textarea id={`accomplishment-${key}`} rows={3} placeholder={placeholder} {...register(key)} />
            {errors[key] && <p className="text-xs text-destructive">{errors[key]?.message}</p>}
            <StagedFilesPicker files={staged[key]} onChange={(files) => setStaged((prev) => ({ ...prev, [key]: files }))} />
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
            {isPending ? "Posting..." : "Post report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
