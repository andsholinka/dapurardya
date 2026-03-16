import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth-v2";
import MemberAuthForm from "./MemberAuthForm";

export const metadata: Metadata = {
  title: "Masuk / Daftar – Dapur Ardya",
  description: "Masuk atau daftar sebagai member Dapur Ardya untuk akses resep eksklusif dan fitur Chef AI.",
  robots: { index: false }, // halaman auth tidak perlu diindex
};

export default async function MemberAuthPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  if (session) redirect("/member");
  const { tab } = await searchParams;
  return (
    <Suspense>
      <MemberAuthForm defaultTab={tab === "register" ? "register" : "login"} />
    </Suspense>
  );
}
