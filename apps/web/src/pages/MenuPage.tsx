import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import type { Restaurant } from "@workshop/shared";
import { getRestaurant } from "../lib/api";
import { MenuItemRow } from "../features/menu/components/MenuItemRow";
import { useCart } from "../features/cart/context/CartContext";
import { useReveal } from "../lib/useReveal";
import { Logo, Stars } from "../components/ui";
import { sumLines, formatCents } from "@workshop/shared";

// Deterministic photo hue from restaurant id
function photoHue(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return `photo--h${(n % 5) + 1}`;
}

const CATEGORY_ORDER = ["Starters", "Mains", "Desserts", "Drinks"];

export default function MenuPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { lines, add, remove } = useCart();
  const cartCount = lines.reduce((s, l) => s + l.quantity, 0);
  const cartTotal = sumLines(lines);
  const hue = photoHue(id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!id) return;
    getRestaurant(id)
      .then(setRestaurant)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useReveal(restaurant);

  // Derive categories present in this restaurant's menu, in display order
  const items = restaurant?.menuItems ?? [];
  const categories = useMemo(
    () =>
      CATEGORY_ORDER.filter((cat) => (restaurant?.menuItems ?? []).some((m) => m.category === cat)),
    [restaurant],
  );

  // Track which section is visible for the sticky nav highlight
  useEffect(() => {
    if (!categories.length) return;
    setActiveSection(categories[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (notFound || !restaurant) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-4)",
        }}
      >
        <p style={{ color: "var(--color-danger)" }}>Restaurant not found.</p>
        <Link to="/" className="btn btn--secondary">
          ← Back
        </Link>
      </div>
    );
  }

  const deliveryFeeLabel =
    restaurant.deliveryFeeCents === 0
      ? "Free delivery"
      : `${formatCents(restaurant.deliveryFeeCents)} delivery`;

  return (
    <>
      {/* Sticky site header */}
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
            </button>
            <nav
              style={{
                display: "flex",
                gap: "var(--space-4)",
                marginLeft: "auto",
                alignItems: "center",
              }}
            >
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

      {/* Restaurant hero */}
      <section className="r-hero">
        <Link to="/" className="r-hero__back" aria-label="Back">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        {restaurant.imageUrl ? (
          <div className="photo photo--scrim" style={{ aspectRatio: "21/9", borderRadius: 0 }}>
            <img src={restaurant.imageUrl} alt={restaurant.name} />
          </div>
        ) : (
          <div
            className={`photo photo--ph ${hue} photo--scrim`}
            style={{ aspectRatio: "21/9", borderRadius: 0 }}
          />
        )}
        <div className="r-hero__info">
          <div
            className="wrap"
            style={{ paddingBottom: "var(--space-8)", paddingTop: "var(--space-8)" }}
          >
            <h1 className="r-hero__name">{restaurant.name}</h1>
            {restaurant.description && (
              <p
                className="muted"
                style={{ marginTop: "var(--space-2)", fontSize: "var(--fs-14)", maxWidth: "60ch" }}
              >
                {restaurant.description}
              </p>
            )}
            <div className="r-hero__meta" style={{ marginTop: "var(--space-3)" }}>
              <span className="muted">{restaurant.cuisine}</span>
              <span className="r-card__dot" />
              <Stars value={restaurant.ratingAvg} count={restaurant.ratingCount} />
              <span className="r-card__dot" />
              <span style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}>
                {restaurant.deliveryMinutes} min
              </span>
              <span className="r-card__dot" />
              <span
                style={{
                  color:
                    restaurant.deliveryFeeCents === 0
                      ? "var(--color-success)"
                      : "var(--color-text-muted)",
                }}
              >
                {deliveryFeeLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky section nav — dynamic categories */}
      <div className="menu-nav">
        <div className="wrap">
          <nav className="sec-nav">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat}`}
                className={activeSection === `cat-${cat}` ? "is-active" : ""}
              >
                {cat}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 120 }}>
        {categories.map((cat) => {
          const catItems = items.filter((m) => m.category === cat);
          return (
            <section
              key={cat}
              id={`cat-${cat}`}
              className="menu-sec"
              ref={(el) => {
                sectionRefs.current[cat] = el;
              }}
            >
              <h2>{cat}</h2>
              <div className="menu-list">
                {catItems.map((m) => (
                  <MenuItemRow
                    key={m.id}
                    id={m.id}
                    name={m.name}
                    description={m.description}
                    priceCents={m.priceCents}
                    dietaryTags={m.dietaryTags}
                    imageUrl={m.imageUrl}
                    popular={m.popular}
                    quantity={lines.find((l) => l.menuItemId === m.id)?.quantity ?? 0}
                    onAdd={() => add({ menuItemId: m.id, name: m.name, priceCents: m.priceCents })}
                    onRemove={() => remove(m.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="cart-bar">
          <div className="cart-bar__meta">
            <span className="cart-bar__count">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
            <span className="cart-bar__total">{formatCents(cartTotal)}</span>
          </div>
          <Link to="/cart" className="btn btn--primary">
            View cart{" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}
