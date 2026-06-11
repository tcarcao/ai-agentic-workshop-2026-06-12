import type { Restaurant, MenuItem, Order, OrderLine } from "../domain/entities.js";

function parseTags(csv: string): string[] {
  return csv ? csv.split(",") : [];
}

export function toMenuItem(row: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  dietaryTags: string;
  imageUrl: string;
  category: string;
  popular: boolean;
}): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    dietaryTags: parseTags(row.dietaryTags),
    imageUrl: row.imageUrl,
    category: row.category,
    popular: row.popular,
  };
}

export function toRestaurant(row: {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  ratingAvg: number;
  ratingCount: number;
  deliveryMinutes: number;
  deliveryFeeCents: number;
  priceLevel: number;
  description: string;
  menuItems?: {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    dietaryTags: string;
    imageUrl: string;
    category: string;
    popular: boolean;
  }[];
}): Restaurant {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    imageUrl: row.imageUrl,
    ratingAvg: row.ratingAvg,
    ratingCount: row.ratingCount,
    deliveryMinutes: row.deliveryMinutes,
    deliveryFeeCents: row.deliveryFeeCents,
    priceLevel: row.priceLevel,
    description: row.description,
    menuItems: row.menuItems ? row.menuItems.map(toMenuItem) : undefined,
  };
}

export function toOrder(row: {
  id: string;
  customer: string;
  createdAt: Date;
  totalCents: number;
  promoCode: string;
  discountCents: number;
  userId: string | null;
  items: { menuItemId: string; quantity: number; menuItem: { name: string; priceCents: number } }[];
}): Order {
  const lines: OrderLine[] = row.items.map((it) => ({
    menuItemId: it.menuItemId,
    name: it.menuItem.name,
    priceCents: it.menuItem.priceCents,
    quantity: it.quantity,
  }));
  return {
    id: row.id,
    customer: row.customer,
    createdAt: row.createdAt,
    totalCents: row.totalCents,
    promoCode: row.promoCode,
    discountCents: row.discountCents,
    userId: row.userId,
    lines,
  };
}
