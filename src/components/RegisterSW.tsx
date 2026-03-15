"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker.register("/sw.js").then((reg) => {
          // Cek update Service Worker secara berkala
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // Update ditemukan! Service worker baru siap.
                    console.log("[SW] Update baru ditemukan. Melakukan reload...");
                    window.location.reload();
                  }
                }
              };
            }
          };
        }).catch(console.error);
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
      }

      // Listener untuk mendeteksi ketika Service Worker baru mengambil alih
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
      
      return () => {
        window.removeEventListener("load", register);
      };
    }
  }, []);

  return null;
}
