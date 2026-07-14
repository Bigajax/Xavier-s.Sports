"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { waDefault } from "@/lib/whatsapp";

/**
 * Botão flutuante de WhatsApp. Entra após o carregamento com o rótulo
 * aberto por alguns segundos (depois recolhe para o ícone), e emite um
 * anel de "ping" periódico. Oculto no /admin e mais alto na página de
 * produto (que tem o próprio CTA fixo no mobile).
 */
export default function WhatsAppButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const show = setTimeout(() => setMounted(true), 400);
    const collapse = setTimeout(() => setExpanded(false), 5000);
    return () => {
      clearTimeout(show);
      clearTimeout(collapse);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;
  const compact = pathname.startsWith("/produto/");

  return (
    <a
      href={waDefault()}
      target="_blank"
      rel="noopener noreferrer"
      title="Fale com a Xavier's Sports"
      className={`group fixed right-4 z-40 flex items-center gap-0 rounded-full bg-whats px-3.5 py-3.5 text-white shadow-xl shadow-ink/25 transition-all duration-500 hover:scale-105 motion-reduce:transition-none ${
        compact ? "bottom-20 md:bottom-5" : "bottom-5"
      } ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
    >
      {/* anel de ping periódico */}
      <span aria-hidden="true" className="wa-ping absolute inset-0 rounded-full bg-whats" />
      <MessageCircle className="relative h-6 w-6" aria-hidden="true" />
      <span
        className={`relative overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-56 group-hover:pl-2 group-focus-visible:max-w-56 group-focus-visible:pl-2 ${
          expanded ? "max-w-56 pl-2" : "max-w-0 pl-0"
        }`}
      >
        Fale com a Xavier&apos;s Sports
      </span>
      <span className="sr-only">Fale com a Xavier&apos;s Sports no WhatsApp</span>
    </a>
  );
}
