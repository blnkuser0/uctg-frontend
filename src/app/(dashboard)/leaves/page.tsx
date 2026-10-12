"use client";

import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveTable } from "@/components/leaves/LeaveTable";
import { LeaveCalendar } from "@/components/leaves/LeaveCalendar";
import { RequestLeaveDialog } from "@/components/leaves/RequestLeaveDialog";
import { useAllLeaves, useMyLeaves, useHrDecision, useAdminDecision, useCancelLeave } from "@/hooks/useLeaves";
import { PERMISSIONS } from "@/types/role";
import { OperationsHeader, OperationsStat, OperationsState } from "@/components/layout/OperationsUI";

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
      onSuccess: () => toast.success("Leave request removed"),
      onError: () => toast.error("Could not remove this request."),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
      <OperationsHeader title="Time away" description="Plan a well-earned pause. Keep track of requests, decisions, and upcoming time off." actions={<RequestLeaveDialog />} />
<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{([{ key: "all", label: "Total requests", accent: "bg-cyan-500" }, { key: "pending", label: "Awaiting decision", accent: "bg-amber-500" }, { key: "approved", label: "Approved", accent: "bg-emerald-500" }, { key: "rejected", label: "Rejected", accent: "bg-rose-500" }] as const).map(({ key, label, accent }) => { const query = canSeeAll ? allLeaves : myLeaves; return <OperationsStat key={key} label={label} value={query.isLoading || query.isError ? "—" : (query.data ?? []).filter((leave) => key === "all" || leave.status === key).length} hint={canSeeAll ? "Across team requests" : "Across your requests"} accent={accent} />; })}</div>

      <Tabs defaultValue={canSeeAll ? "all" : "mine"}>
        <TabsList style={{ height: "auto" }} className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1 sm:w-fit">
          {canSeeAll && <TabsTrigger className="min-h-11 flex-1 px-4 sm:flex-none" value="all">All requests</TabsTrigger>}
          <TabsTrigger className="min-h-11 flex-1 px-4 sm:flex-none" value="mine">My requests</TabsTrigger>
          <TabsTrigger className="min-h-11 flex-1 px-4 sm:flex-none" value="calendar">Calendar</TabsTrigger>
        </TabsList>
        {canSeeAll && (
          <TabsContent value="all" className="mt-4">
            <LeaveTable
              isLoading={allLeaves.isLoading}
              isError={allLeaves.isError}
              onRetry={() => void allLeaves.refetch()}
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
            isLoading={myLeaves.isLoading}
            isError={myLeaves.isError}
            onRetry={() => void myLeaves.refetch()}
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
          {(canSeeAll ? allLeaves : myLeaves).isLoading ? <OperationsState loading title="Loading time away..." /> : (canSeeAll ? allLeaves : myLeaves).isError ? <OperationsState title="The calendar could not be loaded" onRetry={() => void (canSeeAll ? allLeaves : myLeaves).refetch()} /> : <LeaveCalendar leaves={canSeeAll ? allLeaves.data ?? [] : myLeaves.data ?? []} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
