"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string };

const EVENT = "xaviers-toast";

/** Dispara um toast de qualquer lugar do app (client-side). */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      const id = ++counter;
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, 3200);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-white/10"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
