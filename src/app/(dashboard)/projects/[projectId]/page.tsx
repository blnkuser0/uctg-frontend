"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectIndexPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${projectId}/board`);
  }, [projectId, router]);

  return null;
}
