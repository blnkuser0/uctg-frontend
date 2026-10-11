"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateAccomplishment } from "@/hooks/useAccomplishments";
import { toPhDateKey } from "@/lib/utils";
import { Accomplishment, AccomplishmentSection } from "@/types/accomplishment";
import { AccomplishmentSectionAttachments } from "./AccomplishmentSectionAttachments";

const editAccomplishmentSchema = z.object({
  date: z.string().min(1, "Required"),
  accomplishment: z.string().trim().min(1, "Tell us what you got done"),
  blockers: z.string().trim(),
  inProgress: z.string().trim(),
});

type EditAccomplishmentValues = z.infer<typeof editAccomplishmentSchema>;

const SECTIONS: { key: AccomplishmentSection; label: string; required?: boolean }[] = [
  { key: "accomplishment", label: "Accomplishments", required: true },
  { key: "blockers", label: "Blockers" },
  { key: "inProgress", label: "In progress" },
];

export function EditAccomplishmentDialog({
  accomplishment,
  open,
  onOpenChange,
}: {
  accomplishment: Accomplishment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateAccomplishment = useUpdateAccomplishment();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditAccomplishmentValues>({
    resolver: zodResolver(editAccomplishmentSchema),
    values: {
      date: accomplishment.date,
      accomplishment: accomplishment.accomplishment,
      blockers: accomplishment.blockers,
      inProgress: accomplishment.inProgress,
    },
  });

  function onSubmit(values: EditAccomplishmentValues) {
    updateAccomplishment.mutate(
      { id: accomplishment._id, input: values },
      {
        onSuccess: () => {
          toast.success("Accomplishment updated");
          onOpenChange(false);
        },
        onError: () => toast.error("Could not save your changes."),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit accomplishment</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="editAccomplishmentDate">Date</Label>
            <Input id="editAccomplishmentDate" type="date" max={toPhDateKey(new Date())} {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {SECTIONS.map(({ key, label, required }) => (
            <div key={key} className="grid gap-1.5">
              <Label htmlFor={`editAccomplishment-${key}`}>
                {label}
                {!required && <span className="text-muted-foreground"> (optional)</span>}
              </Label>
              <Textarea id={`editAccomplishment-${key}`} rows={3} {...register(key)} />
              {errors[key] && <p className="text-xs text-destructive">{errors[key]?.message}</p>}
              <AccomplishmentSectionAttachments
                accomplishmentId={accomplishment._id}
                section={key}
                attachments={accomplishment.attachments.filter((a) => a.section === key)}
              />
            </div>
          ))}

          <DialogFooter>
            <Button type="submit" disabled={updateAccomplishment.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {updateAccomplishment.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
