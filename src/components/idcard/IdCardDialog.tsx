"use client";

import { IdCard as IdCardIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserIdCard } from "@/hooks/useIdCard";
import { IdCard } from "./IdCard";

// Lets a Super Admin / user manager view and print a teammate's company ID.
export function IdCardDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useUserIdCard(userId, open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="icon-sm" variant="outline" aria-label={`View ID card for ${userName}`} title="View ID card">
            <IdCardIcon className="size-3.5" />
          </Button>
        }
      />
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
