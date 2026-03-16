"use client";

import Link from "next/link";
import type { AuthSession } from "@/lib/auth-v2";
import type { MemberRecipeRequestStatus } from "@/lib/member-request";
import type { RecipeRequest } from "@/types/recipe-request";
import { RequestModal } from "@/components/RequestModal";
import { Button } from "@/components/ui/button";
import { Sparkles, Coins, Wand2, Images } from "lucide-react";

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
          <Link
            href="/member/icon-studio"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-border bg-card text-xs font-semibold shadow-sm transition-all hover:border-primary/50 sm:w-32"
          >
            <Wand2 className="size-3.5" />
            Icon Studio
          </Link>
          <Link
            href="/member/icon-studio/gallery"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-border bg-card text-xs font-semibold shadow-sm transition-all hover:border-primary/50 sm:w-32"
          >
            <Images className="size-3.5" />
            Galeri Icon
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

      <div className="mb-8 rounded-2xl border-2 border-primary/10 bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="font-bold">Chef AI & Request Resep</h2>
              <p className="text-sm text-muted-foreground">
                Setiap penggunaan fitur AI atau request resep akan mengurangi <span className="font-bold text-foreground">1 Credit</span>.
              </p>
            </div>
          </div>
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
