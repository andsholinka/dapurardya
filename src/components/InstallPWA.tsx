"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

type Platform = "android" | "ios" | null;

export function InstallPWA() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Jangan tampil kalau sudah standalone (sudah install)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem("pwa-dismissed", "1");
    setDismissed(true);
  }

  async function installAndroid() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDismissed(true);
    } else {
      setShowGuide(true);
    }
  }

  if (dismissed || !platform) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="Dapur Ardya" className="w-12 h-12 rounded-xl" />
              <div>
                <p className="font-semibold text-sm">Install Dapur Ardya</p>
                <p className="text-xs text-muted-foreground">Akses lebih cepat dari home screen</p>
              </div>
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={platform === "android" ? installAndroid : () => setShowGuide(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-xl"
            >
              {platform === "ios" ? <Share className="size-4" /> : <Download className="size-4" />}
              Install
            </button>
            <button onClick={dismiss} className="px-4 text-sm text-muted-foreground border-2 rounded-xl">
              Nanti
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Cara Install</p>
              <button onClick={() => setShowGuide(false)}><X className="size-5" /></button>
            </div>

            {platform === "ios" ? (
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap ikon <strong>Share</strong> <Share className="inline size-4" /> di toolbar Safari (bawah layar)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scroll ke bawah, pilih <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong>"Add"</strong> di pojok kanan atas</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap menu <strong>⋮</strong> di pojok kanan atas Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Pilih <strong>"Add to Home screen"</strong> atau <strong>"Install app"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong>"Install"</strong> untuk konfirmasi</span>
                </li>
              </ol>
            )}

            <button
              onClick={() => { setShowGuide(false); dismiss(); }}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
