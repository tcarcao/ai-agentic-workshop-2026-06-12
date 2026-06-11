import type { OrderRepository } from "./ports.js";
export function makeClaimOrders(orders: OrderRepository) {
  return async (orderIds: string[], userId: string): Promise<void> => {
    if (orderIds.length === 0) return;
    await orders.claim(orderIds, userId);
  };
}
