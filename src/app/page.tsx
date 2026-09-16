"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/overview" : "/login");
  }, [isLoading, user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
    </div>
  );
}
