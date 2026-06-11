import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "@workshop/shared";
import { getOrder, listMyOrders, claimOrders } from "../lib/api";
import { Logo } from "../components/ui";
import { AccountNav } from "../features/auth/components/AccountNav";
import { formatCents } from "@workshop/shared";
import { useAuth } from "../features/auth/context/AuthContext";

function getStoredOrderIds(): string[] {
  try {
    const raw = localStorage.getItem("ember_order_ids");
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

interface OrderSummary {
  id: string;
  order: Order | null;
  error: boolean;
}

export default function OrdersPage() {
  const [summaries, setSummaries] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function load() {
      if (user) {
        // Claim guest orders made on this device, then read the account's orders.
        const localIds = getStoredOrderIds();
        const orders = localIds.length ? await claimOrders(localIds) : await listMyOrders();
        if (cancelled) return;
        localStorage.removeItem("ember_order_ids"); // server now owns them
        setSummaries(orders.map((order) => ({ id: order.id, order, error: false })));
        setLoading(false);
        return;
      }

      // Guest: load by the device-local ids (existing behavior).
      const ids = getStoredOrderIds();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      const results = await Promise.all(
        ids.map(async (id): Promise<OrderSummary> => {
          try {
            return { id, order: await getOrder(id), error: false };
          } catch {
            return { id, order: null, error: true };
          }
        }),
      );
      if (cancelled) return;
      setSummaries([...results].reverse());
      setLoading(false);
    }

    setLoading(true);
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="site-header__row">
            <Logo />
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
                to="/"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "var(--fs-14)",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Browse
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
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div
        className="wrap"
        style={{ paddingTop: "var(--space-10)", paddingBottom: "var(--space-16)", maxWidth: 760 }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "var(--fs-44)",
            letterSpacing: "-0.03em",
            marginBottom: "var(--space-8)",
          }}
        >
          Your orders
        </h1>

        {loading && <p className="muted">Loading…</p>}

        {!loading && summaries.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "var(--space-4)",
              paddingTop: "var(--space-8)",
            }}
          >
            <p className="muted" style={{ fontSize: "var(--fs-18)" }}>
              You haven't placed any orders yet.
            </p>
            <Link to="/" className="btn btn--primary">
              Browse kitchens
            </Link>
          </div>
        )}

        {!loading && summaries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {summaries.map(({ id, order, error }) => {
              if (error || !order) {
                return (
                  <div
                    key={id}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-card)",
                      padding: "var(--space-5)",
                    }}
                  >
                    <p className="muted" style={{ fontSize: "var(--fs-14)" }}>
                      Order #{id.slice(-8)} — could not load
                    </p>
                  </div>
                );
              }

              const itemCount = order.lines.reduce((s, l) => s + l.quantity, 0);

              return (
                <Link key={id} to={`/orders/${id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-card)",
                      padding: "var(--space-5) var(--space-6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--space-4)",
                      transition:
                        "transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glow-ember)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(94,224,192,.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "";
                    }}
                  >
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "var(--fs-18)",
                          color: "var(--color-text)",
                        }}
                      >
                        {order.customer}
                      </span>
                      <span className="muted" style={{ fontSize: "var(--fs-14)" }}>
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                        <span style={{ margin: "0 var(--space-2)", color: "var(--color-border)" }}>
                          ·
                        </span>
                        Order #{id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--fs-18)",
                          color: "var(--color-gold)",
                          fontWeight: 700,
                        }}
                      >
                        {formatCents(order.totalCents)}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-text-muted)"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
