import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/auth";
import MemberAuthForm from "./MemberAuthForm";

export default async function MemberAuthPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getMemberSession();
  if (session) redirect("/member");
  const { tab } = await searchParams;
  return (
    <Suspense>
      <MemberAuthForm defaultTab={tab === "register" ? "register" : "login"} />
    </Suspense>
  );
}
