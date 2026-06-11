import type { PrismaClient } from "@prisma/client";
import type { OrderRepository } from "../application/ports.js";
import type { Order } from "../domain/entities.js";
import { toOrder } from "./mappers.js";

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(order: {
    customer: string;
    totalCents: number;
    promoCode: string;
    discountCents: number;
    userId?: string | null;
    lines: { menuItemId: string; quantity: number }[];
  }): Promise<string> {
    const created = await this.db.order.create({
      data: {
        customer: order.customer,
        totalCents: order.totalCents,
        promoCode: order.promoCode,
        discountCents: order.discountCents,
        userId: order.userId ?? null,
        items: {
          create: order.lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        },
      },
    });
    return created.id;
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } },
    });
    return row ? toOrder(row) : null;
  }

  async findByUser(userId: string): Promise<Order[]> {
    const rows = await this.db.order.findMany({
      where: { userId },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toOrder);
  }

  async claim(orderIds: string[], userId: string): Promise<void> {
    // Only claim orders that are currently unowned — never steal another user's order.
    await this.db.order.updateMany({
      where: { id: { in: orderIds }, userId: null },
      data: { userId },
    });
  }
}
