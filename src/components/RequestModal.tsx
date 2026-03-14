"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RequestModalProps {
  memberId?: string;
  memberName?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  className?: string;
}

export function RequestModal({ memberId, memberName, size, className }: RequestModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: memberName || "", recipeName: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function openModal() { setOpen(true); setSuccess(false); setError(""); }
  function closeModal() { setOpen(false); setForm({ name: memberName || "", recipeName: "", message: "" }); setSuccess(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, memberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-background rounded-2xl w-full max-w-md shadow-xl text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <p className="font-semibold text-lg">Request Resep</p>
                <p className="text-muted-foreground text-sm">Ada resep yang ingin kamu lihat? Minta ke Ardya!</p>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5">
              {success ? (
                <div className="text-center space-y-3 py-4">
                  <p className="text-4xl">🎉</p>
                  <p className="font-semibold">Request terkirim!</p>
                  <p className="text-muted-foreground text-sm">Ardya akan segera memasak resep pilihanmu.</p>
                  <Button className="rounded-xl w-full" onClick={closeModal}>Tutup</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="req-name">Nama kamu</Label>
                    <Input id="req-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Contoh: Budi" className="mt-1 rounded-xl border-2" required />
                  </div>
                  <div>
                    <Label htmlFor="req-recipe">Resep yang diminta</Label>
                    <Input id="req-recipe" value={form.recipeName} onChange={(e) => setForm((f) => ({ ...f, recipeName: e.target.value }))} placeholder="Contoh: Rendang Padang" className="mt-1 rounded-xl border-2" required />
                  </div>
                  <div>
                    <Label htmlFor="req-message">Pesan tambahan (opsional)</Label>
                    <Textarea id="req-message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Misal: versi pedas ya kak!" className="mt-1 rounded-xl border-2 min-h-[70px]" />
                  </div>
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1 rounded-xl">
                      {loading ? "Mengirim..." : "Kirim Request"}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl">Batal</Button>
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
