"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Loader2, X, Coins } from "lucide-react";
import type { MemberRecipeRequestStatus } from "@/lib/member-request";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGlobalLoading } from "./LoadingProvider";

interface RequestModalProps {
  memberId?: string;
  memberName?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  className?: string;
}

export function RequestModal({ memberId, memberName, size, className }: RequestModalProps) {
  const router = useRouter();
  const { setIsLoading } = useGlobalLoading();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: memberName || "", recipeName: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState<MemberRecipeRequestStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  async function loadRequestStatus() {
    if (!memberId) return;
    setStatusLoading(true);
    try {
      const res = await fetch("/api/member/request-status");
      const data = await res.json();
      if (res.ok) {
        setRequestStatus(data.requestStatus ?? null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  }

  async function openModal() {
    setOpen(true);
    setSuccess(false);
    setError("");
    await loadRequestStatus();
  }

  function closeModal() {
    setOpen(false);
    setForm({ name: memberName || "", recipeName: "", message: "" });
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (requestStatus && !requestStatus.canRequest) {
      setError("Kamu tidak memiliki Credit yang cukup untuk merequest resep. Silakan kumpulkan Credit atau Top Up paket Credits.");
      return;
    }

    setIsLoading(true, { title: "Mengirim request", subtitle: "Menyampaikan permintaan resepmu ke Ardya..." });

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requestStatus) {
          setRequestStatus(data.requestStatus);
        }
        throw new Error(data.error || "Gagal mengirim");
      }

      setRequestStatus(data.requestStatus ?? null);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }

  const limitReached = !!(requestStatus && !requestStatus.canRequest);

  return (
    <>
      <Button
        variant="outline"
        size={size || "sm"}
        onClick={openModal}
        className={cn("rounded-xl", size === "lg" && "px-4 sm:px-8", className)}
      >
        Request Resep
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div
            className="w-full max-w-md rounded-2xl bg-background text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-lg font-semibold">Request Resep</p>
                <p className="text-sm text-muted-foreground">Ada resep yang ingin kamu lihat? Minta ke Ardya!</p>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5">
              {success ? (
                <div className="space-y-3 py-4 text-center">
                  <p className="text-3xl">Request terkirim</p>
                  <p className="font-semibold">Ardya sudah menerima request-mu.</p>
                  <p className="text-sm text-muted-foreground">Tim akan meninjau resep pilihanmu secepatnya.</p>
                  {requestStatus && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Coins className="size-3" /> Sisa Credit-mu: {requestStatus.credits}
                    </p>
                  )}
                  <Button className="w-full rounded-xl" onClick={closeModal}>
                    Tutup
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                    {statusLoading ? (
                      <div className="flex items-center gap-2 text-primary">
                        <Loader2 className="size-4 animate-spin" />
                        Mengecek Credits...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          <Coins className="size-4 text-primary" />
                          Gunakan 1 Credit untuk Request
                        </p>
                        <p>
                          Sisa Credit milikmu: <span className="font-bold text-primary">{requestStatus?.credits ?? 0}</span>
                        </p>
                      </div>
                    )}
                  </div>

                   {limitReached && (
                    <div className="rounded-2xl border-2 border-primary/20 bg-background px-4 py-4">
                      <p className="font-bold text-foreground">Credit Kamu Habis</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Dapatkan lebih banyak Credit untuk terus me-request resep favoritmu.
                      </p>
                      <Link href="/member/upgrade" className="mt-4 block">
                        <Button type="button" className="w-full rounded-xl">
                          Isi Ulang Credits
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="req-name">Nama kamu</Label>
                    <Input
                      id="req-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Contoh: Budi"
                      className="mt-1 rounded-xl border-2"
                      required
                      disabled={statusLoading || limitReached}
                    />
                  </div>

                  <div>
                    <Label htmlFor="req-recipe">Resep yang diminta</Label>
                    <Input
                      id="req-recipe"
                      value={form.recipeName}
                      onChange={(e) => setForm((f) => ({ ...f, recipeName: e.target.value }))}
                      placeholder="Contoh: Rendang Padang"
                      className="mt-1 rounded-xl border-2"
                      required
                      disabled={statusLoading || limitReached}
                    />
                  </div>

                  <div>
                    <Label htmlFor="req-message">Pesan tambahan (opsional)</Label>
                    <Textarea
                      id="req-message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Misal: versi pedas ya kak!"
                      className="mt-1 min-h-[70px] rounded-xl border-2"
                      disabled={statusLoading || limitReached}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={loading || statusLoading || limitReached}
                      className="flex-1 rounded-xl"
                    >
                      {loading ? "Mengirim..." : "Kirim Request"}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl">
                      Batal
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
