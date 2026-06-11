import { describe, it, expect } from "vitest";
import {
  calculateOrderTotal,
  assertOrderIsPlaceable,
  EmptyOrderError,
  InvalidQuantityError,
} from "./order.js";
import type { OrderLine } from "./entities.js";

const lines: OrderLine[] = [
  { menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 2 },
  { menuItemId: "m2", name: "Soup", priceCents: 400, quantity: 1 },
];

describe("calculateOrderTotal", () => {
  it("sums price × quantity", () => {
    expect(calculateOrderTotal(lines)).toBe(2200);
  });
});

describe("assertOrderIsPlaceable", () => {
  it("passes for a non-empty order", () => {
    expect(() => assertOrderIsPlaceable(lines)).not.toThrow();
  });
  it("throws EmptyOrderError for an empty order", () => {
    expect(() => assertOrderIsPlaceable([])).toThrow(EmptyOrderError);
  });

  it.each([0, -1, 1.5, NaN])("throws InvalidQuantityError for quantity %p", (quantity) => {
    const bad: OrderLine[] = [{ menuItemId: "m1", name: "Pizza", priceCents: 900, quantity }];
    expect(() => assertOrderIsPlaceable(bad)).toThrow(InvalidQuantityError);
  });
});
