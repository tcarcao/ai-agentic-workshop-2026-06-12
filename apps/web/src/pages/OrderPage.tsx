import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Order } from "@workshop/shared";
import { getOrder } from "../lib/api";
import { OrderConfirmation } from "../features/orders/components/OrderConfirmation";
import { Logo } from "../components/ui";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrder(id)
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

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
        <p className="muted">Loading order…</p>
      </div>
    );
  }

  if (notFound || !order) {
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
        <p style={{ color: "var(--color-danger)" }}>Order not found.</p>
        <Link to="/" className="btn btn--secondary">
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Minimal header */}
      <header className="site-header">
        <div className="wrap">
          <div className="site-header__row">
            <Logo />
          </div>
        </div>
      </header>

      <OrderConfirmation order={order} />
    </>
  );
}
