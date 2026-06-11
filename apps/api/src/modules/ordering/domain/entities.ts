export type DietaryTag = string; // "vegetarian" | "vegan" | "gluten-free" | ...

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  dietaryTags: DietaryTag[];
  imageUrl: string;
  category: string;
  popular: boolean;
}

export interface Restaurant {
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
  menuItems?: MenuItem[]; // present on detail, omitted on list
}

export interface OrderLine {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  createdAt: Date;
  totalCents: number;
  promoCode: string;
  discountCents: number;
  lines: OrderLine[];
  userId: string | null;
}
