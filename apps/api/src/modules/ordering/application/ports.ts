import type { Restaurant, MenuItem, Order } from "../domain/entities.js";

export interface RestaurantRepository {
  findAll(): Promise<Restaurant[]>;
  findById(id: string): Promise<Restaurant | null>; // includes menuItems
  findMenuItems(ids: string[]): Promise<MenuItem[]>; // for server-side pricing
}

export interface OrderRepository {
  create(order: {
    customer: string;
    totalCents: number;
    lines: { menuItemId: string; quantity: number }[];
    userId?: string | null;
  }): Promise<string>;
  findById(id: string): Promise<Order | null>;
  findByUser(userId: string): Promise<Order[]>;
  claim(orderIds: string[], userId: string): Promise<void>;
}
