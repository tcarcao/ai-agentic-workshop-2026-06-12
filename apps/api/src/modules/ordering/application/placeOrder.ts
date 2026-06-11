import type { RestaurantRepository, OrderRepository } from "./ports.js";
import {
  assertOrderIsPlaceable,
  calculateOrderTotal,
  discountFor,
  UnknownMenuItemError,
} from "../domain/order.js";
import type { OrderLine } from "../domain/entities.js";

export interface PlaceOrderInput {
  customer: string;
  items: { menuItemId: string; quantity: number }[];
  promoCode?: string;
  userId?: string | null;
}

export function makePlaceOrder(restaurants: RestaurantRepository, orders: OrderRepository) {
  return async function placeOrder(
    input: PlaceOrderInput,
  ): Promise<{ id: string; totalCents: number; promoCode: string; discountCents: number }> {
    const menuItems = await restaurants.findMenuItems(input.items.map((i) => i.menuItemId));
    const byId = new Map(menuItems.map((m) => [m.id, m]));

    const lines: OrderLine[] = input.items.map((i) => {
      const item = byId.get(i.menuItemId);
      if (!item) throw new UnknownMenuItemError(i.menuItemId);
      return {
        menuItemId: item.id,
        name: item.name,
        priceCents: item.priceCents,
        quantity: i.quantity,
      };
    });

    assertOrderIsPlaceable(lines);
    const subtotalCents = calculateOrderTotal(lines);

    // Discount is decided server-side — never trust a client-sent amount.
    const discountCents = discountFor(input.promoCode, subtotalCents);
    const promoCode = discountCents > 0 ? (input.promoCode ?? "").trim().toUpperCase() : "";
    const totalCents = Math.max(0, subtotalCents - discountCents);

    const customer = input.customer.trim() || "Guest";

    const id = await orders.create({
      customer,
      totalCents,
      promoCode,
      discountCents,
      userId: input.userId ?? null,
      lines: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
    });
    return { id, totalCents, promoCode, discountCents };
  };
}
