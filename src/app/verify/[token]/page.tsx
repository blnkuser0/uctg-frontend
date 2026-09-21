import type { Metadata } from "next";
import { VerifyResult } from "@/components/idcard/VerifyResult";

export const metadata: Metadata = {
  title: "Verify ID",
  robots: { index: false, follow: false },
};

export default async function VerifyIdPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <VerifyResult token={token} />;
}
