import type { OrderRepository } from "./ports.js";
export function makeListUserOrders(orders: OrderRepository) {
  return (userId: string) => orders.findByUser(userId);
}
