"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from "@/types/leave";
import { Plus } from "lucide-react";

const requestLeaveSchema = z
  .object({
    leaveType: z.enum(LEAVE_TYPES, { message: "Choose a leave type" }),
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
    control,
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
          <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
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
          <div className="grid gap-1.5">
            <Label>Leave type</Label>
            <Controller
              control={control}
              name="leaveType"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  items={LEAVE_TYPES.map((type) => ({ value: type, label: LEAVE_TYPE_LABELS[type] }))}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger aria-label="Leave type">
                    <SelectValue placeholder="Select a leave type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {LEAVE_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leaveType && <p className="text-xs text-destructive">{errors.leaveType.message}</p>}
          </div>
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
              className="bg-cyan-600 text-white hover:bg-cyan-500"
            >
              {createLeave.isPending ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
