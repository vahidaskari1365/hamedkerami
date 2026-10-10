"use client";

import { useEffect } from "react";

/**
 * Registers the service worker and activates waiting updates.
 * PWA support for mobile & tablet (installable, offline shell).
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.location.protocol.startsWith("http")) return; // file:// preview
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return; // keep local dev hot-reload clean
    }

    let reloaded = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        const activateWaiting = () => {
          registration.waiting?.postMessage("SKIP_WAITING");
        };

        activateWaiting();

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              activateWaiting();
            }
          });
        });
      })
      .catch(() => {
        /* SW unavailable — site works normally */
      });

    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
