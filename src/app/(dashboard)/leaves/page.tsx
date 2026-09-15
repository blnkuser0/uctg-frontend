"use client";

import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveTable } from "@/components/leaves/LeaveTable";
import { LeaveCalendar } from "@/components/leaves/LeaveCalendar";
import { RequestLeaveDialog } from "@/components/leaves/RequestLeaveDialog";
import { useAllLeaves, useMyLeaves, useHrDecision, useAdminDecision, useCancelLeave } from "@/hooks/useLeaves";
import { PERMISSIONS } from "@/types/role";

export default function LeavesPage() {
  const { user } = useAuth();
  const permissions = user?.role.permissions ?? [];
  const canApproveHr = permissions.includes(PERMISSIONS.LEAVES_APPROVE_HR);
  const canApproveAdmin = permissions.includes(PERMISSIONS.LEAVES_APPROVE_ADMIN);
  const canSeeAll = permissions.includes(PERMISSIONS.LEAVES_VIEW_ALL);

  const allLeaves = useAllLeaves(canSeeAll);
  const myLeaves = useMyLeaves();
  const hrDecision = useHrDecision();
  const adminDecision = useAdminDecision();
  const cancelLeave = useCancelLeave();

  const isMutating = hrDecision.isPending || adminDecision.isPending || cancelLeave.isPending;

  function handleHrDecision(leaveId: string, status: "approved" | "rejected") {
    hrDecision.mutate(
      { leaveId, input: { status } },
      { onError: () => toast.error("Could not record the HR decision.") }
    );
  }

  function handleAdminDecision(leaveId: string, status: "approved" | "rejected") {
    adminDecision.mutate(
      { leaveId, input: { status } },
      { onError: () => toast.error("Could not record the Admin decision.") }
    );
  }

  function handleCancel(leaveId: string) {
    cancelLeave.mutate(leaveId, {
      onSuccess: () => toast.success("Leave request cancelled"),
      onError: () => toast.error("Could not cancel this request."),
    });
  }

  return (
    <div className="catalyst-page max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="catalyst-eyebrow">People operations</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Leaves</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every request needs both HR and Admin approval — Admin has the final say.
          </p>
        </div>
        <RequestLeaveDialog />
      </div>

      <Tabs defaultValue={canSeeAll ? "all" : "mine"}>
        <TabsList>
          {canSeeAll && <TabsTrigger value="all">All requests</TabsTrigger>}
          <TabsTrigger value="mine">My requests</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        {canSeeAll && (
          <TabsContent value="all" className="mt-4">
            <LeaveTable
              leaves={allLeaves.data ?? []}
              showEmployeeColumn
              currentUserId={user?.id ?? ""}
              canApproveHr={canApproveHr}
              canApproveAdmin={canApproveAdmin}
              isMutating={isMutating}
              onHrDecision={handleHrDecision}
              onAdminDecision={handleAdminDecision}
              onCancel={handleCancel}
            />
          </TabsContent>
        )}
        <TabsContent value="mine" className="mt-4">
          <LeaveTable
            leaves={myLeaves.data ?? []}
            showEmployeeColumn={false}
            currentUserId={user?.id ?? ""}
            canApproveHr={canApproveHr}
            canApproveAdmin={canApproveAdmin}
            isMutating={isMutating}
            onHrDecision={handleHrDecision}
            onAdminDecision={handleAdminDecision}
            onCancel={handleCancel}
          />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <LeaveCalendar leaves={canSeeAll ? allLeaves.data ?? [] : myLeaves.data ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
