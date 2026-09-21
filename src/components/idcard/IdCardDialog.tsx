"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserIdCard } from "@/hooks/useIdCard";
import { IdCard } from "./IdCard";

interface IdCardDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lets a Super Admin / user manager view and print a teammate's company ID.
export function IdCardDialog({ userId, userName, open, onOpenChange }: IdCardDialogProps) {
  const { data, isLoading, isError } = useUserIdCard(userId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Company ID</DialogTitle>
          <DialogDescription>{userName}</DialogDescription>
        </DialogHeader>
        {isLoading && <p className="py-10 text-center text-sm text-muted-foreground">Loading ID…</p>}
        {isError && <p className="py-10 text-center text-sm text-destructive">Could not load this ID card.</p>}
        {data && <IdCard card={data} />}
      </DialogContent>
    </Dialog>
  );
}
