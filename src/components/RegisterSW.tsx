"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then((reg) => {
          // Cek update Service Worker secara berkala
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // Update ditemukan! Service worker baru siap.
                    console.log("Update baru ditemukan. Melakukan reload...");
                    window.location.reload();
                  }
                }
              };
            }
          };
        }).catch(console.error);
      });

      // Listener untuk mendeteksi ketika Service Worker baru mengambil alih
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  return null;
}
