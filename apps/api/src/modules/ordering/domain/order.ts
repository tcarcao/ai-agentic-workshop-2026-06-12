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

export function assertOrderIsPlaceable(lines: OrderLine[]): void {
  if (lines.length === 0) throw new EmptyOrderError();
  for (const l of lines) {
    if (!Number.isInteger(l.quantity) || l.quantity < 1) {
      throw new InvalidQuantityError(l.menuItemId, l.quantity);
    }
  }
}
