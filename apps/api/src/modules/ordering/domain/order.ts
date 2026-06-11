import { sumLines } from "@workshop/shared";
import type { OrderLine } from "./entities.js";

export class EmptyOrderError extends Error {
  constructor() {
    super("Cannot place an order with no items");
    this.name = "EmptyOrderError";
  }
}

export class UnknownMenuItemError extends Error {
  constructor(id: string) {
    super(`Unknown menu item: ${id}`);
    this.name = "UnknownMenuItemError";
  }
}

export class InvalidQuantityError extends Error {
  constructor(menuItemId: string, quantity: number) {
    super(`Invalid quantity ${quantity} for menu item ${menuItemId}: must be a whole number ≥ 1`);
    this.name = "InvalidQuantityError";
  }
}

export function calculateOrderTotal(lines: OrderLine[]): number {
  return sumLines(lines);
}

/**
 * Pure discount rule. The discount is server-decided — never trust a client-sent amount.
 *  - SAVE10 → 10% off the subtotal (rounded down to whole cents)
 *  - SAVE5  → 500 cents off
 *  - unknown / empty code → 0 (no discount, and NO error)
 * The result is clamped to [0, subtotalCents] so the total can never go below 0.
 */
export function discountFor(code: string | undefined, subtotalCents: number): number {
  const normalized = (code ?? "").trim().toUpperCase();
  let discount = 0;
  if (normalized === "SAVE10") discount = Math.floor(subtotalCents * 0.1);
  else if (normalized === "SAVE5") discount = 500;
  return Math.max(0, Math.min(discount, subtotalCents));
}

export function assertOrderIsPlaceable(lines: OrderLine[]): void {
  if (lines.length === 0) throw new EmptyOrderError();
  for (const l of lines) {
    if (!Number.isInteger(l.quantity) || l.quantity < 1) {
      throw new InvalidQuantityError(l.menuItemId, l.quantity);
    }
  }
}
