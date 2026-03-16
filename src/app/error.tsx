"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console — di production bisa dikirim ke error tracking service
    console.error("[ERROR_BOUNDARY]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl">😵</p>
      <h2 className="text-xl font-bold text-foreground">Ups, ada yang error</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Terjadi kesalahan yang tidak terduga. Coba muat ulang halaman atau kembali ke beranda.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 font-mono">ID: {error.digest}</p>
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={reset}
          className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl")}
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
