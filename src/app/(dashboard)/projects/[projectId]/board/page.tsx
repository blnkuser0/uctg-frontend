"use client";

import { use } from "react";
import { useProject } from "@/hooks/useProject";
import { useProjectSocket } from "@/hooks/useProjectSocket";
import { useIsMobile } from "@/hooks/useIsMobile";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { KanbanBoardMobile } from "@/components/board/KanbanBoardMobile";

export default function BoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const isMobile = useIsMobile();

  useProjectSocket(projectId);

  if (isLoading || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      {isMobile ? <KanbanBoardMobile project={project} /> : <KanbanBoard project={project} />}
    </div>
  );
}
