export function brl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function installmentText(
  price: number,
  installments?: number
): string | null {
  if (!installments || installments < 2) return null;
  return `ou ${installments}x de ${brl(price / installments)}`;
}

export function discountPct(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
