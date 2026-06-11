export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function sumLines(lines: { priceCents: number; quantity: number }[]): number {
  return lines.reduce((acc, l) => acc + l.priceCents * l.quantity, 0);
}
