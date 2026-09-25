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
import { Accomplishment } from "@/types/accomplishment";

const editAccomplishmentSchema = z.object({
  date: z.string().min(1, "Required"),
  text: z.string().trim().min(1, "Tell us what you got done"),
});

type EditAccomplishmentValues = z.infer<typeof editAccomplishmentSchema>;

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
    values: { date: accomplishment.date, text: accomplishment.text },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit accomplishment</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="editAccomplishmentDate">Date</Label>
            <Input id="editAccomplishmentDate" type="date" max={toPhDateKey(new Date())} {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="editAccomplishmentText">Task done</Label>
            <Textarea id="editAccomplishmentText" rows={4} {...register("text")} />
            {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
          </div>
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
