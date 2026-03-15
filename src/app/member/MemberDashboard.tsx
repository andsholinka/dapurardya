"use client";

import Link from "next/link";
import type { MemberSession } from "@/lib/auth";
import type { MemberRecipeRequestStatus } from "@/lib/member-request";
import type { RecipeRequest } from "@/types/recipe-request";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";

export default function MemberDashboard({
  session,
  requests,
  requestStatus,
}: {
  session: MemberSession;
  requests: RecipeRequest[];
  requestStatus: MemberRecipeRequestStatus;
}) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-4 sm:py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
            <span className="truncate">Halo, {session.name}</span>
            <span className="shrink-0" aria-hidden="true">
              👋
            </span>
          </h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{session.email}</p>
          <p className="mt-1 text-xs font-medium text-primary">
            Paket Chef AI: {session.aiPlan === "premium" ? "Premium" : "Free"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Link
            href="/member/saved"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-border bg-card text-xs font-semibold shadow-sm transition-all hover:border-primary/50 sm:w-40"
          >
            Tersimpan
          </Link>
          <RequestModal
            memberId={session.id}
            memberName={session.name}
            size="sm"
            className="h-9 w-full text-xs font-semibold shadow-sm sm:w-40"
          />
        </div>
      </div>

      <div className="mb-8 rounded-2xl border-2 border-primary/20 bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Chef AI Member</h2>
            <p className="text-sm text-muted-foreground">
              {session.aiPlan === "premium"
                ? "Kamu sudah berada di paket premium dengan akses Chef AI lebih leluasa."
                : "Member free mendapat 2 kali penggunaan Chef AI setiap 7 hari. Upgrade untuk akses lebih banyak."}
            </p>
          </div>
          {session.aiPlan !== "premium" && (
            <Link href="/member/upgrade" className="shrink-0">
              <Button variant="outline" className="rounded-xl">
                Upgrade Paket
              </Button>
            </Link>
          )}
        </div>
      </div>

      <h2 className="mb-3 font-semibold">Request Resepmu</h2>
      <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        {requestStatus.plan === "premium" ? (
          <p>Kamu sudah di paket premium. Request resep sekarang bebas tanpa batas bulanan.</p>
        ) : (
          <p>
            Paket free mendapat 1 request resep per bulan. Sisa bulan ini:{" "}
            <span className="font-semibold text-foreground">
              {requestStatus.remainingThisMonth ?? 0} dari {requestStatus.monthlyLimit ?? 1}
            </span>
            .
          </p>
        )}
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
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
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
