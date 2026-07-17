"use client";

/**
 * Registra a consulta iniciada pelo WhatsApp (fire-and-forget).
 * `keepalive` garante o envio mesmo com a navegação para o wa.me.
 * Nunca lança: falha de rede não pode atrapalhar o clique do cliente.
 */
export function trackLead(data: {
  productId?: string;
  productName?: string;
  productSku?: string;
  version?: string;
  size?: string;
  personalization?: string;
  shownPrice?: number;
  origin: "produto" | "sacola" | "favoritos" | "geral";
  page?: string;
}) {
  try {
    void fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        page: data.page ?? window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silencioso por design
  }
}
