"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateAccomplishment } from "@/hooks/useAccomplishments";
import { toPhDateKey } from "@/lib/utils";
import { Plus } from "lucide-react";

const logAccomplishmentSchema = z.object({
  date: z.string().min(1, "Required"),
  text: z.string().trim().min(1, "Tell us what you got done"),
});

type LogAccomplishmentValues = z.infer<typeof logAccomplishmentSchema>;

export function LogAccomplishmentDialog() {
  const [open, setOpen] = useState(false);
  const createAccomplishment = useCreateAccomplishment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogAccomplishmentValues>({
    resolver: zodResolver(logAccomplishmentSchema),
    defaultValues: { date: toPhDateKey(new Date()), text: "" },
  });

  function onSubmit(values: LogAccomplishmentValues) {
    createAccomplishment.mutate(values, {
      onSuccess: () => {
        toast.success("Accomplishment logged");
        reset({ date: toPhDateKey(new Date()), text: "" });
        setOpen(false);
      },
      onError: () => toast.error("Could not log this. Please try again."),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset({ date: toPhDateKey(new Date()), text: "" });
      }}
    >
      <DialogTrigger
        render={
          <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
            <Plus className="size-4" />
            Log accomplishment
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log an accomplishment</DialogTitle>
          <DialogDescription>What did you get done today?</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="accomplishmentDate">Date</Label>
            <Input id="accomplishmentDate" type="date" max={toPhDateKey(new Date())} {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="accomplishmentText">Task done</Label>
            <Textarea id="accomplishmentText" rows={4} placeholder="e.g. Finished the client onboarding flow" {...register("text")} />
            {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createAccomplishment.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {createAccomplishment.isPending ? "Logging..." : "Log it"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
