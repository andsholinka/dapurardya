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
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl flex items-center gap-1.5")}
      >
        <User className="size-3.5" />
        <span className="max-w-[80px] truncate">{member.name}</span>
        <ChevronDown className="size-3" />
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
              <Link href="/member/saved" className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors border-t" onClick={() => setOpen(false)}>
                Resep Tersimpan
              </Link>
            </>
          )}
          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors border-t">
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
