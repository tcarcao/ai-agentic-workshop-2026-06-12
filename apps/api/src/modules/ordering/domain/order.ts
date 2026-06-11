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

export function calculateOrderTotal(lines: OrderLine[]): number {
  return sumLines(lines);
}

export function assertOrderIsPlaceable(lines: OrderLine[]): void {
  if (lines.length === 0) throw new EmptyOrderError();
}
