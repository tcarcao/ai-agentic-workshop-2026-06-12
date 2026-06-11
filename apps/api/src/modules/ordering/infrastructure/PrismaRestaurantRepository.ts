import type { PrismaClient } from "@prisma/client";
import type { RestaurantRepository } from "../application/ports.js";
import type { Restaurant, MenuItem } from "../domain/entities.js";
import { toRestaurant, toMenuItem } from "./mappers.js";

export class PrismaRestaurantRepository implements RestaurantRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<Restaurant[]> {
    const rows = await this.db.restaurant.findMany({ orderBy: { name: "asc" } });
    return rows.map(toRestaurant);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const row = await this.db.restaurant.findUnique({
      where: { id },
      include: { menuItems: { orderBy: { name: "asc" } } },
    });
    return row ? toRestaurant(row) : null;
  }

  async findMenuItems(ids: string[]): Promise<MenuItem[]> {
    const rows = await this.db.menuItem.findMany({ where: { id: { in: ids } } });
    return rows.map(toMenuItem);
  }
}
