"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { MemberSession } from "@/lib/auth";
import type { RecipeRequest } from "@/types/recipe-request";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";

export default function MemberDashboard({ session, requests }: { session: MemberSession; requests: RecipeRequest[] }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/member/logout", { method: "POST" });
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-lg font-semibold">Halo, {session.name} 👋</p>
          <p className="text-sm text-muted-foreground">{session.email}</p>
        </div>
        <div className="flex gap-2">
          <RequestModal memberId={session.id} memberName={session.name} />
          <Button variant="outline" size="sm" className="rounded-xl" onClick={logout}>Keluar</Button>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Request Resepmu</h2>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Belum ada request. Yuk request resep pertamamu!</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r._id} className="border-2 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.recipeName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "done" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {r.status === "done" ? "Selesai" : "Menunggu"}
                </span>
              </div>
              {r.message && <p className="text-sm text-muted-foreground italic">"{r.message}"</p>}
              <p className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
