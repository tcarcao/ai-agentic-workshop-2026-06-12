import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import type { PlaceOrderRequest, PlaceOrderResponse } from "@workshop/shared";
import { server } from "../../../test/server";
import { CartProvider } from "../context/CartContext";
import { CartView } from "./CartView";

// CartProvider hydrates from localStorage on mount — seed the cart there.
const CART_KEY = "workshop-cart";

function renderCart() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <CartView />
      </CartProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  window.localStorage.clear();
});

it("posts checkout as exactly the PlaceOrderRequest contract shape", async () => {
  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify([{ menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 2 }]),
  );

  let captured: unknown;
  const response: PlaceOrderResponse = {
    id: "o1",
    totalCents: 1800,
    promoCode: "",
    discountCents: 0,
  };
  server.use(
    http.post("/api/orders", async ({ request }) => {
      captured = await request.json();
      return HttpResponse.json(response, { status: 201 });
    }),
  );

  const user = userEvent.setup();
  renderCart();

  await user.type(await screen.findByLabelText(/your name/i), "Ana");
  await user.click(screen.getByRole("button", { name: /checkout/i }));

  // The seam check: `expected` typechecks against the shared contract, and
  // toEqual is exact on keys — a renamed or extra field on the wire fails here.
  const expected: PlaceOrderRequest = {
    customer: "Ana",
    items: [{ menuItemId: "m1", quantity: 2 }],
  };
  await waitFor(() => expect(captured).toEqual(expected));

  // Post-conditions: the cart is cleared and the order id is kept for history.
  await screen.findByText(/your cart is empty/i);
  expect(JSON.parse(window.localStorage.getItem("ember_order_ids") ?? "[]")).toEqual(["o1"]);
});

it("keeps checkout disabled until a customer name is entered", async () => {
  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify([{ menuItemId: "m1", name: "Pizza", priceCents: 900, quantity: 1 }]),
  );
  renderCart();
  expect(await screen.findByRole("button", { name: /checkout/i })).toBeDisabled();
});
