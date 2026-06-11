import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { sumLines, formatCents } from "@workshop/shared";
import { Input } from "../../../components/ui";
import { placeOrder } from "../../../lib/api";

// Deterministic photo hue from item id
function photoHue(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return `photo--h${(n % 5) + 1}`;
}

export function CartView() {
  const { lines, add, remove, clear } = useCart();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function checkout() {
    setSubmitting(true);
    try {
      const result = await placeOrder({
        customer,
        items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
      });
      // Persist order id for Orders history page
      try {
        const raw = localStorage.getItem("ember_order_ids");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        ids.push(result.id);
        localStorage.setItem("ember_order_ids", JSON.stringify(ids));
      } catch {
        // localStorage unavailable — silently skip
      }
      clear();
      navigate(`/orders/${result.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = sumLines(lines);
  const total = subtotal;

  if (lines.length === 0) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-6)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "var(--fs-44)",
            letterSpacing: "-0.03em",
          }}
        >
          Your cart is empty
        </h1>
        <p className="muted">Add some dishes to get started.</p>
        <Link to="/" className="btn btn--primary">
          Browse kitchens
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-grid">
      {/* Left — item lines */}
      <div>
        <div className="cart-head">
          <h1>Your cart</h1>
        </div>
        <p className="from">
          <b>
            {lines.length} {lines.length === 1 ? "item" : "items"}
          </b>{" "}
          · 25–35 min
        </p>

        <div id="lines">
          {lines.map((l) => {
            const hue = photoHue(l.menuItemId);
            return (
              <article key={l.menuItemId} className="line">
                <div className={`photo photo--1x1 photo--ph ${hue}`} />
                <div>
                  <div className="line__name">{l.name}</div>
                  <div className="line__note">
                    <button
                      onClick={() => remove(l.menuItemId)}
                      style={{
                        color: "var(--color-danger)",
                        fontSize: "var(--fs-12)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="line__right">
                  <button className="add is-active" aria-label={`Quantity for ${l.name}`}>
                    <span className="add__stepper" style={{ opacity: 1 }}>
                      <span
                        className="add__btn minus"
                        role="button"
                        tabIndex={0}
                        onClick={() => remove(l.menuItemId)}
                        onKeyDown={(e) => e.key === "Enter" && remove(l.menuItemId)}
                      >
                        −
                      </span>
                      <span className="add__qty">{l.quantity}</span>
                      <span
                        className="add__btn plus"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          add({ menuItemId: l.menuItemId, name: l.name, priceCents: l.priceCents })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          add({ menuItemId: l.menuItemId, name: l.name, priceCents: l.priceCents })
                        }
                      >
                        +
                      </span>
                    </span>
                  </button>
                  <span className="price price--lg line__amt">
                    {formatCents(l.priceCents * l.quantity)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Right — summary sidebar */}
      <aside className="summary">
        <h2>Summary</h2>

        <div className="row">
          <span>Subtotal</span>
          <span className="amt">{formatCents(subtotal)}</span>
        </div>
        <div className="row">
          <span>Delivery</span>
          <span className="amt" style={{ color: "var(--color-success)" }}>
            Free
          </span>
        </div>

        <div className="row row--total">
          <span>Total</span>
          <span className="amt">{formatCents(total)}</span>
        </div>

        {/* Customer name input */}
        <div style={{ marginTop: "var(--space-6)" }}>
          <Input label="Your name" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </div>

        <button
          className="btn btn--primary btn--block"
          style={{ marginTop: "var(--space-6)" }}
          onClick={checkout}
          disabled={submitting || !customer.trim()}
        >
          {submitting ? (
            "Placing order…"
          ) : (
            <>
              Checkout ·{" "}
              <span style={{ fontFamily: "var(--font-mono)", marginLeft: 6 }}>
                {formatCents(total)}
              </span>
            </>
          )}
        </button>

        <div className="eta-strip">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-ember)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className="muted">
            Estimated delivery{" "}
            <b style={{ color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>25–35 min</b>
          </span>
        </div>
      </aside>
    </div>
  );
}
