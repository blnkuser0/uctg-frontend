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
import { useCreateLeave } from "@/hooks/useLeaves";
import { Plus } from "lucide-react";

const requestLeaveSchema = z
  .object({
    startDate: z.string().min(1, "Required"),
    endDate: z.string().min(1, "Required"),
    reason: z.string().trim().min(1, "Tell us why you're requesting leave"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

type RequestLeaveValues = z.infer<typeof requestLeaveSchema>;

export function RequestLeaveDialog() {
  const [open, setOpen] = useState(false);
  const createLeave = useCreateLeave();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestLeaveValues>({ resolver: zodResolver(requestLeaveSchema) });

  function onSubmit(values: RequestLeaveValues) {
    createLeave.mutate(values, {
      onSuccess: () => {
        toast.success("Leave request submitted");
        reset();
        setOpen(false);
      },
      onError: () => toast.error("Could not submit your request. Please try again."),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button className="bg-amber-500 text-stone-900 hover:bg-amber-400">
            <Plus className="size-4" />
            Request Leave
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request leave</DialogTitle>
          <DialogDescription>Submit a leave request for HR and Admin approval.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} {...register("reason")} />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={createLeave.isPending}
              className="bg-amber-500 text-stone-900 hover:bg-amber-400"
            >
              {createLeave.isPending ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
