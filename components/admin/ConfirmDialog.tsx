"use client";

/** Modal de confirmação do painel — substitui o window.confirm. */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="my-auto max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="display text-xl text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-steel">{message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:bg-cloud"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${
              danger ? "bg-promo hover:bg-promo/85" : "bg-roxo hover:bg-roxo-escuro"
            }`}
          >
            {busy ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
