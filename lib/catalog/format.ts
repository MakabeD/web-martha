export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function parsePrice(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "");
  const withDecimalPoint = normalized.replace(",", ".");
  const parsed = Number(withDecimalPoint);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
