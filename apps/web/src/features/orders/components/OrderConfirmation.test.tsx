import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Order } from "@workshop/shared";
import { OrderConfirmation } from "./OrderConfirmation";

// JSDOM has no matchMedia; answering "reduced motion" also skips the canvas animation.
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: true,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
}));

const order: Order = {
  id: "o1",
  customer: "Ana",
  createdAt: new Date("2026-06-10T12:00:00Z").toISOString(),
  totalCents: 2200,
  userId: null,
  lines: [
    { menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 2 },
    { menuItemId: "m2", name: "Soup", priceCents: 400, quantity: 1 },
  ],
};

it("renders the receipt: customer, every line, and the server total", () => {
  render(
    <MemoryRouter>
      <OrderConfirmation order={order} />
    </MemoryRouter>,
  );

  expect(screen.getByText("Order placed!")).toBeInTheDocument();
  expect(screen.getByText("Ana")).toBeInTheDocument();
  expect(screen.getByText(/Pizza × 2/)).toBeInTheDocument();
  expect(screen.getByText(/Soup × 1/)).toBeInTheDocument();
  // The total comes from the server's Order, not a client-side sum.
  expect(screen.getByText("€22.00")).toBeInTheDocument();
});
