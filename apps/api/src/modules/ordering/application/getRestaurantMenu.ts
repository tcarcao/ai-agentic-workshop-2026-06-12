import type { RestaurantRepository } from "./ports.js";
export function makeGetRestaurantMenu(restaurants: RestaurantRepository) {
  return (id: string) => restaurants.findById(id);
}
