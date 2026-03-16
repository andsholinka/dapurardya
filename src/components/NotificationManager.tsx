"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeUser, getSubscription } from "@/lib/notifications";

export function NotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (typeof window === "undefined") { setChecking(false); return; }

      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      setIsSupported(supported);

      if (supported) {
        // Kalau permission sudah denied atau default (belum pernah diminta), cek dulu
        // Kalau denied, sembunyikan tombol — tidak ada gunanya
        if (Notification.permission === "denied") {
          setChecking(false);
          return;
        }

        try {
          const subPromise = getSubscription();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
          const sub = await Promise.race([subPromise, timeoutPromise]) as any;
          setIsSubscribed(!!sub);
        } catch (e) {
          console.warn("[NOTIF] Gagal mengecek status subscription:", e);
          setIsSubscribed(false);
        }
      }
      setChecking(false);
    }
    checkStatus();
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10_000)
      );
      const granted = await Promise.race([subscribeUser(), timeoutPromise]);
      if (granted) setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setLoading(false);
    }
  }

  // Sembunyikan jika tidak didukung, sedang mengecek, sudah subscribe, atau permission denied
  if (!isSupported || checking || isSubscribed || (typeof window !== "undefined" && typeof Notification !== "undefined" && Notification.permission === "denied")) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={handleSubscribe}
        disabled={loading}
        variant="outline"
        className="rounded-full shadow-lg bg-background group border-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin mr-2" />
        ) : (
          <Bell className="size-4 mr-2 group-hover:animate-bounce" />
        )}
        Aktifkan Notifikasi Update
      </Button>
    </div>
  );
}
