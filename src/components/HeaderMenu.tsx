"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { MemberSession } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ChevronDown, User, Bell, BellOff, Loader2, Coins } from "lucide-react";
import { subscribeUser, unsubscribeUser, getSubscription } from "@/lib/notifications";

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

  // Notification State
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isNotifSupported, setIsNotifSupported] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      if (typeof window !== "undefined") {
        const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
        setIsNotifSupported(supported);
        if (supported) {
          setNotifPermission(Notification.permission);
          const sub = await getSubscription();
          setIsSubscribed(!!sub);
        }
      }
    }
    checkStatus();
  }, []);

  async function toggleNotification() {
    setNotifLoading(true);
    try {
      if (isSubscribed) {
        setIsSubscribed(false); // Optimistic update
        await unsubscribeUser();
      } else {
        const granted = await subscribeUser();
        if (granted) {
          setNotifPermission("granted");
          setIsSubscribed(true);
        }
      }
    } catch (err) {
      console.error(err);
      // Sync back with actual status on error
      const sub = await getSubscription();
      setIsSubscribed(!!sub);
    } finally {
      setNotifLoading(false);
    }
  }

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
            {isNotifSupported && (
              <button
                onClick={toggleNotification}
                disabled={notifLoading}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-t flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  {isSubscribed ? (
                    <Bell className="size-3.5 text-primary" />
                  ) : (
                    <BellOff className="size-3.5 text-muted-foreground" />
                  )}
                  Notifikasi
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                  isSubscribed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {notifLoading ? <Loader2 className="size-3 animate-spin" /> : (isSubscribed ? "AKTIF" : "MATI")}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* Credit Display */}
      {!isAdmin && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-muted/50 transition-colors">
          <div className="rounded-full bg-orange-100 p-1 text-orange-600 shrink-0">
            <Coins className="size-3 sm:size-3.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-foreground leading-none">{member.credits}</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight hidden sm:inline">Credits</span>
          </div>
        </div>
      )}

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

            {isNotifSupported && (
              <button
                onClick={toggleNotification}
                disabled={notifLoading}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-t flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  {isSubscribed ? (
                    <Bell className="size-3.5 text-primary" />
                  ) : (
                    <BellOff className="size-3.5 text-muted-foreground" />
                  )}
                  Notifikasi
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                  isSubscribed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {notifLoading ? <Loader2 className="size-3 animate-spin" /> : (isSubscribed ? "AKTIF" : "MATI")}
                </span>
              </button>
            )}

            <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors border-t">
              Keluar
            </button>
          </div>
        )}
      </div>

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
