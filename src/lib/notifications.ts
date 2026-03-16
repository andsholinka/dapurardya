export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getServiceWorkerReady(timeoutMs = 5000): Promise<ServiceWorkerRegistration> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("serviceWorker.ready timed out")), timeoutMs)
  );
  return Promise.race([navigator.serviceWorker.ready, timeout]);
}

export async function subscribeUser() {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID Public Key is not set");
  }

  const registration = await getServiceWorkerReady();
  const result = await Notification.requestPermission();

  if (result === "granted") {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await fetch("/api/notification/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    
    return true;
  }
  return false;
}

export async function unsubscribeUser() {
  const registration = await getServiceWorkerReady();
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    // Unsubscribe from browser (Instant)
    await subscription.unsubscribe();
    
    // Send to backend in the background (Non-blocking)
    console.log("[NOTIF] Memproses penghapusan subscription dari database...");
    fetch("/api/notification/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
      .then((res) => {
        if (res.ok) console.log("[NOTIF] Berhasil menghapus subscription dari database (Selesai).");
        else console.warn("[NOTIF] Gagal menghapus dari database (Status ok namun ada kendala).");
      })
      .catch((err) => console.error("[NOTIF] Error saat menghubungi database:", err));
    
    return true;
  }
  return false;
}

export async function getSubscription() {
  const registration = await getServiceWorkerReady();
  return registration.pushManager.getSubscription();
}
