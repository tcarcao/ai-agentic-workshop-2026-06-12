import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { CartProvider } from "../features/cart/context/CartContext";
import RestaurantsPage from "./RestaurantsPage";

// JSDOM does not implement IntersectionObserver — stub it so useReveal doesn't throw
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

const restaurants = [
  {
    id: "r1",
    name: "Bella Napoli",
    cuisine: "Italian",
    imageUrl: "",
    ratingAvg: 4.7,
    ratingCount: 10,
    deliveryMinutes: 30,
    deliveryFeeCents: 199,
    priceLevel: 2,
    description: "",
  },
  {
    id: "r2",
    name: "Sushi Zen",
    cuisine: "Japanese",
    imageUrl: "",
    ratingAvg: 4.8,
    ratingCount: 20,
    deliveryMinutes: 35,
    deliveryFeeCents: 299,
    priceLevel: 3,
    description: "",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <RestaurantsPage />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

it("filters restaurants by the search box", async () => {
  server.use(http.get("/api/restaurants", () => HttpResponse.json(restaurants)));
  const user = userEvent.setup();
  renderPage();

  // Wait for both restaurants to be loaded and displayed
  await waitFor(() => expect(screen.getByText("Bella Napoli")).toBeInTheDocument());
  expect(screen.getByText("Sushi Zen")).toBeInTheDocument();

  // The search input has id="search" and <label htmlFor="search">Search dishes, cuisines, places…</label>
  await user.type(screen.getByLabelText(/search/i), "sushi");

  await waitFor(() => expect(screen.queryByText("Bella Napoli")).not.toBeInTheDocument());
  expect(screen.getByText("Sushi Zen")).toBeInTheDocument();
});
