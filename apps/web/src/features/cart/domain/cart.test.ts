import { describe, it, expect } from "vitest";
import { addToCart, removeFromCart } from "./cart";

describe("cart", () => {
  it("adds a new line with quantity 1", () => {
    expect(addToCart([], { menuItemId: "m1", name: "Pizza", priceCents: 900 })).toEqual([
      { menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 1 },
    ]);
  });
  it("increments an existing line", () => {
    const start = [{ menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 1 }];
    expect(addToCart(start, { menuItemId: "m1", name: "Pizza", priceCents: 900 })[0].quantity).toBe(
      2,
    );
  });
  it("removes a line", () => {
    const start = [{ menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 1 }];
    expect(removeFromCart(start, "m1")).toEqual([]);
  });
});
