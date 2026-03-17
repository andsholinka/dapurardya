"use client";

import { useEffect } from "react";

// Catches errors in the root layout itself
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL_ERROR_BOUNDARY]", error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ fontSize: "3rem" }}>💥</p>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Aplikasi mengalami error kritis</h2>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>Silakan muat ulang halaman.</p>
        <button
          onClick={reset}
          style={{ marginTop: "1.5rem", padding: "0.5rem 1.5rem", borderRadius: "0.75rem", background: "#FF94A8", color: "white", border: "none", cursor: "pointer" }}
        >
          Muat Ulang
        </button>
      </body>
    </html>
  );
}
