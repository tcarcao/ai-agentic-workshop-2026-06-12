import type { OrderRepository } from "./ports.js";
export function makeGetOrder(orders: OrderRepository) {
  return (id: string) => orders.findById(id);
}
