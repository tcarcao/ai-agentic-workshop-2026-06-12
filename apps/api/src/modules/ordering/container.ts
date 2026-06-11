import { prisma } from "../../shared/prismaClient.js";
import { PrismaRestaurantRepository } from "./infrastructure/PrismaRestaurantRepository.js";
import { PrismaOrderRepository } from "./infrastructure/PrismaOrderRepository.js";
import { makeListRestaurants } from "./application/listRestaurants.js";
import { makeGetRestaurantMenu } from "./application/getRestaurantMenu.js";
import { makePlaceOrder } from "./application/placeOrder.js";
import { makeGetOrder } from "./application/getOrder.js";
import { makeListUserOrders } from "./application/listUserOrders.js";
import { makeClaimOrders } from "./application/claimOrders.js";

const restaurantRepo = new PrismaRestaurantRepository(prisma);
const orderRepo = new PrismaOrderRepository(prisma);

export const ordering = {
  listRestaurants: makeListRestaurants(restaurantRepo),
  getRestaurantMenu: makeGetRestaurantMenu(restaurantRepo),
  placeOrder: makePlaceOrder(restaurantRepo, orderRepo),
  getOrder: makeGetOrder(orderRepo),
  listUserOrders: makeListUserOrders(orderRepo),
  claimOrders: makeClaimOrders(orderRepo),
};
