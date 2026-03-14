"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { MemberSession } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ChevronDown, User } from "lucide-react";

export function HeaderMenu({ member, isAdmin = false }: { member: MemberSession | null; isAdmin?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function logout() {
    if (isAdmin) {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.push("/");
      router.refresh();
    } else {
      // Hapus cookie session (email/password) dan NextAuth session (Google)
      await fetch("/api/member/logout", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    }
  }

  // Edit Nama State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newName, setNewName] = useState(member?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [editError, setEditError] = useState("");

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setEditError("");
    try {
      const res = await fetch("/api/member/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui nama");
      
      setIsEditModalOpen(false);
      router.refresh();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setSavingName(false);
    }
  }

  if (!member) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl flex items-center gap-1")}
        >
          Akun <ChevronDown className="size-3" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-background border-2 rounded-xl shadow-lg overflow-hidden z-50">
            <Link href="/member/auth?tab=login" className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
              Masuk
            </Link>
            <Link href="/member/auth?tab=register" className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors border-t" onClick={() => setOpen(false)}>
              Daftar
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5")}
      >
        <User className="size-3.5" />
        <span className="max-w-[50px] sm:max-w-[80px] truncate">{member.name}</span>
        <ChevronDown className="size-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-background border-2 rounded-xl shadow-lg overflow-hidden z-50">
          {isAdmin ? (
            <Link href="/admin" className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
              Dashboard Admin
            </Link>
          ) : (
            <>
              <Link href="/member" className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-t"
              >
                Edit Profil
              </button>
            </>
          )}
          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors border-t">
            Keluar
          </button>
        </div>
      )}

      {/* Modal Edit Nama */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-background rounded-2xl w-full max-w-sm shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Edit Profil</h2>
            <p className="text-sm text-muted-foreground mb-4">Ganti nama tampilan kamu di Dapur Ardya.</p>
            
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Nama Baru</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Masukkan nama baru..."
                  required
                  autoFocus
                />
              </div>
              
              {editError && <p className="text-xs text-destructive">{editError}</p>}
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingName}
                  className={cn(buttonVariants({ size: "default" }), "flex-1 rounded-xl")}
                >
                  {savingName ? "Menyimpan..." : "Simpan Nama"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
