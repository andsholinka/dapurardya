"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  async function subscribeUser() {
    if (!VAPID_PUBLIC_KEY) {
      console.error("VAPID Public Key is not set");
      return;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Save to backend
        await fetch("/api/notification/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {permission !== "granted" ? (
        <Button
          onClick={subscribeUser}
          disabled={loading}
          variant="outline"
          className="rounded-full shadow-lg bg-background group"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Bell className="size-4 mr-2 group-hover:animate-bounce" />
          )}
          Aktifkan Notifikasi Update
        </Button>
      ) : (
        <div className="bg-background/80 backdrop-blur-sm border rounded-full p-2 text-muted-foreground flex items-center gap-2 px-4 text-xs font-medium shadow-sm">
          <Bell className="size-3 text-primary" />
          Notifikasi Aktif
        </div>
      )}
    </div>
  );
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
