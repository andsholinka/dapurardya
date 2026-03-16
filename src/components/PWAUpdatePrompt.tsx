"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function PWAUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Cek kalau sudah ada waiting worker saat halaman dibuka
      if (reg.waiting) setWaitingWorker(reg.waiting);

      // Dengarkan update baru
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
          }
        });
      });
    });

    // Reload otomatis setelah SW baru aktif
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  function applyUpdate() {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setWaitingWorker(null);
  }

  if (!waitingWorker) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-4 flex items-center gap-3">
        <RefreshCw className="size-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Update tersedia</p>
          <p className="text-xs text-muted-foreground">Versi baru Dapur Ardya siap dipakai</p>
        </div>
        <button
          onClick={applyUpdate}
          className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-xl"
        >
          Update
        </button>
      </div>
    </div>
  );
}
