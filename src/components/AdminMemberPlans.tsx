"use client";

import { useState } from "react";
import { Crown, Loader2, ShieldCheck, UserRound, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalLoading } from "./LoadingProvider";

export interface AdminMemberSummary {
  id: string;
  name: string;
  email: string;
  credits: number;
  createdAt: string | null;
}

export function AdminMemberPlans({ initialMembers, total }: { initialMembers: AdminMemberSummary[]; total?: number }) {
  const { setIsLoading } = useGlobalLoading();
  const [members, setMembers] = useState<AdminMemberSummary[]>(initialMembers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});

  async function updateCredits(memberId: string) {
    const nextCredits = parseInt(creditInputs[memberId] || "0");
    if (isNaN(nextCredits)) return;

    setIsLoading(true, { title: "Memperbarui credits", subtitle: "Menyimpan perubahan kredit member..." });
    setSavingId(memberId);
    setFeedback("");

    try {
      const res = await fetch(`/api/admin/members/${memberId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: nextCredits }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui credit");
      }

      setMembers((current) =>
        current.map((member) => (member.id === memberId ? { ...member, credits: data.member.credits } : member))
      );
      setCreditInputs((prev) => ({ ...prev, [memberId]: "0" }));
      alert("Credits berhasil diperbarui!");
      setFeedback("Credit member berhasil diperbarui.");
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setSavingId(null);
      setIsLoading(false);
    }
  }

  return (
    <section className="mb-10 rounded-3xl border-2 border-primary/15 bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" />
            Kelola Kredit Member
          </div>
          <h2 className="mt-3 text-xl font-bold text-foreground">Top Up Kredit Member</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Setelah pembayaran member diverifikasi, Anda dapat menambah atau mengubah jumlah kredit mereka di sini.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <p>
            Total member dipantau: <span className="font-semibold text-foreground">{total ?? members.length}</span>
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
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Coins className="size-3.5" />
                      {member.credits} Credits
                    </p>
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
                </div>

                <div className="flex flex-col gap-3 sm:w-64">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={creditInputs[member.id] ?? member.credits}
                      onChange={(e) => setCreditInputs({ ...creditInputs, [member.id]: e.target.value })}
                      className="w-20 rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button
                      size="sm"
                      onClick={() => updateCredits(member.id)}
                      disabled={isSaving}
                      className="flex-1 rounded-xl whitespace-nowrap"
                    >
                      {isSaving ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Coins className="mr-2 size-3" />}
                      Update Credits
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
