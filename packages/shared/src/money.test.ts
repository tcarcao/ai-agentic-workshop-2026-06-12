import { describe, it, expect } from "vitest";
import { formatCents, sumLines } from "./money.js";

describe("formatCents", () => {
  it("formats cents as euros", () => {
    expect(formatCents(900)).toBe("€9.00");
    expect(formatCents(1050)).toBe("€10.50");
    expect(formatCents(0)).toBe("€0.00");
  });
});

describe("sumLines", () => {
  it("sums price × quantity across lines", () => {
    expect(
      sumLines([
        { priceCents: 900, quantity: 2 },
        { priceCents: 450, quantity: 1 },
      ]),
    ).toBe(2250);
  });
  it("returns 0 for no lines", () => {
    expect(sumLines([])).toBe(0);
  });
});
