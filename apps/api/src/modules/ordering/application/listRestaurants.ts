import type { RestaurantRepository } from "./ports.js";
export function makeListRestaurants(restaurants: RestaurantRepository) {
  return () => restaurants.findAll();
}
