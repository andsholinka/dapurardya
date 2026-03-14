"use client";

import { useRouter } from "next/navigation";
import type { MemberSession } from "@/lib/auth";
import type { RecipeRequest } from "@/types/recipe-request";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MemberDashboard({ session, requests }: { session: MemberSession; requests: RecipeRequest[] }) {
  const router = useRouter();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="truncate">Halo, {session.name}</span>
            <span className="shrink-0">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{session.email}</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <Link 
            href="/member/saved" 
            className="flex items-center justify-center gap-1.5 text-xs font-semibold h-9 w-full sm:w-40 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all shadow-sm"
          >
            🔖 Tersimpan
          </Link>
          <RequestModal 
            memberId={session.id} 
            memberName={session.name} 
            size="sm" 
            className="h-9 text-xs font-semibold w-full sm:w-40 shadow-sm" 
          />
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
