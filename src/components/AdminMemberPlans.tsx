"use client";

import { useState } from "react";
import { Crown, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdminMemberSummary {
  id: string;
  name: string;
  email: string;
  aiPlan: "free" | "premium";
  createdAt: string | null;
}

export function AdminMemberPlans({ initialMembers }: { initialMembers: AdminMemberSummary[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  async function updatePlan(memberId: string, nextPlan: "free" | "premium") {
    setSavingId(memberId);
    setFeedback("");

    try {
      const res = await fetch(`/api/admin/members/${memberId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiPlan: nextPlan }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui paket member");
      }

      setMembers((current) =>
        current.map((member) => (member.id === memberId ? { ...member, aiPlan: data.member.aiPlan } : member))
      );
      setFeedback(
        nextPlan === "premium"
          ? "Paket member berhasil diubah ke premium."
          : "Paket member berhasil dikembalikan ke free."
      );
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mb-10 rounded-3xl border-2 border-primary/15 bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" />
            Kelola Member Premium
          </div>
          <h2 className="mt-3 text-xl font-bold text-foreground">Aktivasi premium setelah pembayaran diverifikasi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Setelah user membayar upgrade, admin bisa langsung mengubah paketnya ke premium dari sini.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <p>
            Total member dipantau: <span className="font-semibold text-foreground">{members.length}</span>
          </p>
        </div>
      </div>

      {feedback && <p className="mb-4 text-sm text-primary">{feedback}</p>}

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada member yang terdaftar.
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const isPremium = member.aiPlan === "premium";
            const isSaving = savingId === member.id;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-background px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <UserRound className="size-4 text-primary" />
                      <span className="truncate">{member.name}</span>
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isPremium
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isPremium && <Crown className="size-3.5" />}
                      {isPremium ? "Premium" : "Free"}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                  {member.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Bergabung {new Date(member.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:w-56">
                  <Button
                    onClick={() => updatePlan(member.id, "premium")}
                    disabled={isSaving || isPremium}
                    className="rounded-xl"
                  >
                    {isSaving && !isPremium ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Crown className="mr-2 size-4" />}
                    Jadikan Premium
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updatePlan(member.id, "free")}
                    disabled={isSaving || !isPremium}
                    className="rounded-xl"
                  >
                    {isSaving && isPremium ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Kembalikan ke Free
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
