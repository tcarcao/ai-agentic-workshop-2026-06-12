import { describe, it, expect } from "vitest";
import {
  calculateOrderTotal,
  assertOrderIsPlaceable,
  discountFor,
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

describe("discountFor", () => {
  it("SAVE10 takes 10% off the subtotal (rounded down)", () => {
    expect(discountFor("SAVE10", 2200)).toBe(220);
    expect(discountFor("SAVE10", 999)).toBe(99); // floor(99.9)
  });
  it("SAVE5 takes a flat 500 cents off", () => {
    expect(discountFor("SAVE5", 2200)).toBe(500);
  });
  it("is case- and whitespace-insensitive", () => {
    expect(discountFor("  save10 ", 2200)).toBe(220);
  });
  it("gives no discount (and no error) for an unknown or empty code", () => {
    expect(discountFor("NOPE", 2200)).toBe(0);
    expect(discountFor("", 2200)).toBe(0);
    expect(discountFor(undefined, 2200)).toBe(0);
  });
  it("clamps the discount so the total never goes below 0", () => {
    expect(discountFor("SAVE5", 300)).toBe(300); // 500 off 300 → clamp to 300
  });
});
