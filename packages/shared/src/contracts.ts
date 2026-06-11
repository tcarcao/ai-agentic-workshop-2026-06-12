export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  dietaryTags: string[];
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
  menuItems?: MenuItem[];
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
  createdAt: string;
  totalCents: number;
  lines: OrderLine[];
  userId: string | null;
}

export interface User {
  id: string;
  email: string;
  confirmed: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  email: string;
  confirmed: boolean;
}

export interface ConfirmRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface MergeFavoritesRequest {
  restaurantIds: string[];
}

export interface ClaimOrdersRequest {
  orderIds: string[];
}

export interface PlaceOrderRequest {
  customer: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface PlaceOrderResponse {
  id: string;
  totalCents: number;
}
