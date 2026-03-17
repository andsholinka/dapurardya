"use client";

import Link from "next/link";
import type { AuthSession } from "@/lib/auth-v2";
import type { MemberRecipeRequestStatus } from "@/lib/member-request";
import type { RecipeRequest } from "@/types/recipe-request";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export default function MemberDashboard({
  session,
  requests,
  requestStatus,
}: {
  session: AuthSession;
  requests: RecipeRequest[];
  requestStatus: MemberRecipeRequestStatus;
}) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-4 sm:py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Link
            href="/member/saved"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-border bg-card text-xs font-semibold shadow-sm transition-all hover:border-primary/50 sm:w-32"
          >
            Tersimpan
          </Link>
          <RequestModal
            memberId={session.id}
            memberName={session.name}
            size="sm"
            className="h-9 w-full text-xs font-semibold shadow-sm sm:w-32"
          />
          <Link
            href="/member/upgrade"
            className="col-span-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 sm:col-auto sm:w-32"
          >
            <Coins className="size-3.5" />
            + Top Up
          </Link>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold">Riwayat Request Resep</h2>
      </div>
      {requests.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Belum ada request. Yuk request resep pertamamu!
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request._id} className="space-y-1 rounded-xl border-2 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{request.recipeName}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    request.status === "done"
                      ? "bg-secondary text-foreground"
                      : "bg-accent/40 text-foreground"
                  }`}
                >
                  {request.status === "done" ? "Selesai" : "Menunggu"}
                </span>
              </div>
              {request.message && (
                <p className="text-sm italic text-muted-foreground">&quot;{request.message}&quot;</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
