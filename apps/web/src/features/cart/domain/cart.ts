import type { OrderLine } from "@workshop/shared";

export type CartLine = OrderLine;

export function addToCart(lines: CartLine[], item: Omit<CartLine, "quantity">): CartLine[] {
  const existing = lines.find((l) => l.menuItemId === item.menuItemId);
  if (existing) {
    return lines.map((l) =>
      l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + 1 } : l,
    );
  }
  return [...lines, { ...item, quantity: 1 }];
}

export function removeFromCart(lines: CartLine[], menuItemId: string): CartLine[] {
  return lines.filter((l) => l.menuItemId !== menuItemId);
}
