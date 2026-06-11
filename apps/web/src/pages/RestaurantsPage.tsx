import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Restaurant } from "@workshop/shared";
import { getRestaurants } from "../lib/api";
import { RestaurantCard } from "../features/restaurants/components/RestaurantCard";
import { useCart } from "../features/cart/context/CartContext";
import { useReveal } from "../lib/useReveal";
import { Logo } from "../components/ui";
import { AccountNav } from "../features/auth/components/AccountNav";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const { lines } = useCart();
  const cartCount = lines.reduce((s, l) => s + l.quantity, 0);

  useEffect(() => {
    getRestaurants()
      .then(setRestaurants)
      .finally(() => setLoading(false));
  }, []);

  useReveal(restaurants);

  // Derive distinct cuisines from data
  const cuisines = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.cuisine));
    return ["All", ...Array.from(set).sort()];
  }, [restaurants]);

  // Live filter: search by name, cuisine, or dish name; and by selected cuisine chip
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesCuisine = selectedCuisine === "All" || r.cuisine === selectedCuisine;
      if (!matchesCuisine) return false;
      if (!q) return true;
      if (r.name.toLowerCase().includes(q)) return true;
      if (r.cuisine.toLowerCase().includes(q)) return true;
      if (r.menuItems?.some((m) => m.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [restaurants, search, selectedCuisine]);

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Sticky header */}
      <header className="site-header">
        <div className="wrap">
          <div className="site-header__row">
            <Logo />
            <button className="loc">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-ember)"
                strokeWidth="2"
              >
                <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span className="muted">Deliver to</span>{" "}
              <span className="loc__city">Your location</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <nav
              style={{
                display: "flex",
                gap: "var(--space-4)",
                marginLeft: "auto",
                alignItems: "center",
              }}
            >
              <AccountNav />
              <Link
                to="/orders"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "var(--fs-14)",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Orders
              </Link>
              <Link to="/cart" className="cart-badge" aria-label="Cart">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" />
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                </svg>
                {cartCount > 0 && <span className="cart-badge__count">{cartCount}</span>}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="wrap">
        {/* Hero */}
        <section className="hero">
          <p className="kicker reveal">Open now · {restaurants.length} places near you</p>
          <h1 className="hero__display reveal">
            Dinner,
            <br />
            <em>lit.</em>
          </h1>
          <p className="hero__sub reveal">
            The neighbourhood's best kitchens, brought to your door while the plates are still
            glowing.
          </p>
          <div className="hero__search reveal">
            <div className="field">
              <input
                id="search"
                type="text"
                placeholder=" "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label htmlFor="search">Search dishes, cuisines, places…</label>
            </div>
          </div>
        </section>

        {/* Section head */}
        <div className="section-head">
          <h2 className="reveal">Tonight near you</h2>
          <span className="badge-live reveal">All kitchens live</span>
        </div>

        {/* Cuisine filter chips — derived from real data */}
        <div className="filters reveal">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className="tag tag--cuisine"
              style={
                selectedCuisine === c
                  ? {
                      background: "var(--color-ember)",
                      color: "var(--color-on-ember)",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }
                  : { border: "none", cursor: "pointer" }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <p className="muted" style={{ padding: "var(--space-8) 0" }}>
            Loading…
          </p>
        )}

        {/* Empty search result */}
        {!loading && filtered.length === 0 && (
          <p className="muted" style={{ padding: "var(--space-8) 0" }}>
            No restaurants match "{search || selectedCuisine}". Try a different search.
          </p>
        )}

        {/* Restaurant grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid">
            {featured && (
              <RestaurantCard
                key={featured.id}
                id={featured.id}
                name={featured.name}
                cuisine={featured.cuisine}
                imageUrl={featured.imageUrl}
                ratingAvg={featured.ratingAvg}
                ratingCount={featured.ratingCount}
                deliveryMinutes={featured.deliveryMinutes}
                deliveryFeeCents={featured.deliveryFeeCents}
                priceLevel={featured.priceLevel}
                featured={true}
              />
            )}
            {rest.map((r) => (
              <RestaurantCard
                key={r.id}
                id={r.id}
                name={r.name}
                cuisine={r.cuisine}
                imageUrl={r.imageUrl}
                ratingAvg={r.ratingAvg}
                ratingCount={r.ratingCount}
                deliveryMinutes={r.deliveryMinutes}
                deliveryFeeCents={r.deliveryFeeCents}
                priceLevel={r.priceLevel}
              />
            ))}
          </div>
        )}

        <footer>
          <span>© 2026 Ember Technologies, Inc.</span>
          <span>Privacy · Terms · Contact</span>
        </footer>
      </div>
    </>
  );
}
