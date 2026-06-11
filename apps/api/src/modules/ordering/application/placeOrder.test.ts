import { describe, it, expect } from "vitest";
import { makePlaceOrder } from "./placeOrder.js";
import { EmptyOrderError, UnknownMenuItemError, InvalidQuantityError } from "../domain/order.js";
import type { RestaurantRepository, OrderRepository } from "./ports.js";
import type { MenuItem } from "../domain/entities.js";

const menu: MenuItem[] = [
  {
    id: "m1",
    name: "Pizza",
    description: "",
    priceCents: 900,
    dietaryTags: [],
    imageUrl: "",
    category: "Mains",
    popular: false,
  },
  {
    id: "m2",
    name: "Soup",
    description: "",
    priceCents: 400,
    dietaryTags: [],
    imageUrl: "",
    category: "Starters",
    popular: false,
  },
];

const fakeRestaurants: RestaurantRepository = {
  findAll: async () => [],
  findById: async () => null,
  findMenuItems: async (ids) => menu.filter((m) => ids.includes(m.id)),
};

function fakeOrders() {
  const saved: {
    value?: { customer: string; totalCents: number; lines: unknown[]; userId: string | null };
  } = {};
  const repo: OrderRepository = {
    create: async (o) => {
      saved.value = { ...o, userId: o.userId ?? null };
      return "order-1";
    },
    findById: async () => null,
    findByUser: async () => [],
    claim: async () => {},
  };
  return { repo, saved };
}

describe("placeOrder", () => {
  it("computes total from server-side prices", async () => {
    const { repo, saved } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    const res = await placeOrder({
      customer: "Ana",
      items: [
        { menuItemId: "m1", quantity: 2 },
        { menuItemId: "m2", quantity: 1 },
      ],
    });
    expect(res.totalCents).toBe(2200);
    expect(saved.value?.totalCents).toBe(2200);
    expect(saved.value?.customer).toBe("Ana");
  });

  it("rejects an empty order", async () => {
    const { repo } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    await expect(placeOrder({ customer: "Ana", items: [] })).rejects.toBeInstanceOf(
      EmptyOrderError,
    );
  });

  it("rejects an order containing an unknown menu item", async () => {
    const { repo, saved } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    await expect(
      placeOrder({ customer: "Ana", items: [{ menuItemId: "nope", quantity: 1 }] }),
    ).rejects.toBeInstanceOf(UnknownMenuItemError);
    expect(saved.value).toBeUndefined();
  });

  it("rejects a non-positive or fractional quantity instead of mispricing the order", async () => {
    const { repo, saved } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    for (const quantity of [0, -2, 1.5]) {
      await expect(
        placeOrder({ customer: "Ana", items: [{ menuItemId: "m1", quantity }] }),
      ).rejects.toBeInstanceOf(InvalidQuantityError);
    }
    expect(saved.value).toBeUndefined();
  });

  it("defaults a blank customer to Guest", async () => {
    const { repo, saved } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    await placeOrder({ customer: "  ", items: [{ menuItemId: "m1", quantity: 1 }] });
    expect(saved.value?.customer).toBe("Guest");
  });

  it("stamps the userId when the order is placed by a logged-in user", async () => {
    const { repo, saved } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    await placeOrder({ customer: "Ana", userId: "u1", items: [{ menuItemId: "m1", quantity: 1 }] });
    expect(saved.value?.userId).toBe("u1");
  });

  it("leaves userId null for an anonymous order", async () => {
    const { repo, saved } = fakeOrders();
    const placeOrder = makePlaceOrder(fakeRestaurants, repo);
    await placeOrder({ customer: "Ana", items: [{ menuItemId: "m1", quantity: 1 }] });
    expect(saved.value?.userId).toBeNull();
  });
});
