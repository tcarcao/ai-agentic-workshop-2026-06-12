import type { RestaurantRepository, OrderRepository } from "./ports.js";
import {
  assertOrderIsPlaceable,
  calculateOrderTotal,
  UnknownMenuItemError,
} from "../domain/order.js";
import type { OrderLine } from "../domain/entities.js";

export interface PlaceOrderInput {
  customer: string;
  items: { menuItemId: string; quantity: number }[];
  userId?: string | null;
}

export function makePlaceOrder(restaurants: RestaurantRepository, orders: OrderRepository) {
  return async function placeOrder(
    input: PlaceOrderInput,
  ): Promise<{ id: string; totalCents: number }> {
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
    const totalCents = calculateOrderTotal(lines);
    const customer = input.customer.trim() || "Guest";

    const id = await orders.create({
      customer,
      totalCents,
      userId: input.userId ?? null,
      lines: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
    });
    return { id, totalCents };
  };
}
