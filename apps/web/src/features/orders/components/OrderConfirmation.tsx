import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { type Order, formatCents } from "@workshop/shared";

// Ember-spark confetti canvas — warm rising sparks
function useSparkCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let W = 0,
      H = 0;
    function size() {
      if (!c) return;
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
    }
    size();
    window.addEventListener("resize", size);

    const style = getComputedStyle(document.documentElement);
    const COLORS = [
      style.getPropertyValue("--color-ember").trim(),
      style.getPropertyValue("--color-gold").trim(),
      style.getPropertyValue("--color-text").trim(),
      style.getPropertyValue("--color-ember-deep").trim(),
    ];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      life: number;
      col: string;
      rot: number;
    };
    let parts: Particle[] = [];

    function burst() {
      const cx = W / 2,
        cy = H * 0.32;
      for (let i = 0; i < 90; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 7;
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 3,
          r: 2 + Math.random() * 3,
          life: 1,
          col: COLORS[i % COLORS.length],
          rot: Math.random() * 6,
        });
      }
    }

    let rafId: number;
    function tick() {
      ctx!.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.life -= 0.012;
        p.rot += 0.2;
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.col;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx!.restore();
      });
      parts = parts.filter((p) => p.life > 0 && p.y < H + 20);
      rafId = requestAnimationFrame(tick);
    }

    if (!reduce) {
      burst();
      setTimeout(burst, 260);
      tick();
    }

    return () => {
      window.removeEventListener("resize", size);
      cancelAnimationFrame(rafId);
    };
  }, [canvasRef]);
}

// Compute an ETA string based on order creation time
function etaTime(createdAt: string): string {
  try {
    const d = new Date(new Date(createdAt).getTime() + 30 * 60_000);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "~30 min";
  }
}

export function OrderConfirmation({ order }: { order: Order }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useSparkCanvas(canvasRef);
  const eta = etaTime(order.createdAt);

  return (
    <>
      {/* Celebratory confirmed screen */}
      <main className="confirm">
        <canvas
          id="spark"
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
        <div className="confirm__inner">
          {/* Pulse ring + check */}
          <div className="check-wrap">
            <span className="ring" />
            <span className="ring" />
            <span className="ring" />
            <div className="check-core">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="var(--color-on-ember)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={
                    {
                      strokeDasharray: 30,
                      strokeDashoffset: 30,
                      animation: "draw .45s cubic-bezier(.2,.7,.2,1) .6s forwards",
                    } as React.CSSProperties
                  }
                />
              </svg>
            </div>
          </div>

          <h1 className="confirm__title">Order placed!</h1>
          <p className="confirm__sub">
            Your food is on its way. We'll let you know when <b>{order.customer}</b>'s order is en
            route.
          </p>

          {/* ETA badge */}
          <div className="eta">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-ember)"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <div className="eta__label">
              <div className="eta__k">Arriving by</div>
              <div className="eta__time">{eta}</div>
            </div>
          </div>

          {/* Order lines summary */}
          <div style={{ marginTop: "var(--space-8)", textAlign: "left", width: "100%" }}>
            {order.lines.map((l) => (
              <div
                key={l.menuItemId}
                className="row"
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  paddingBottom: "var(--space-3)",
                  marginBottom: "var(--space-3)",
                }}
              >
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span className="price">{formatCents(l.priceCents * l.quantity)}</span>
              </div>
            ))}
            <div className="row row--total">
              <span>Total</span>
              <span className="price price--lg">{formatCents(order.totalCents)}</span>
            </div>
          </div>

          {/* Progress track */}
          <div className="track" style={{ marginTop: "var(--space-8)" }}>
            <div className="track__bar">
              <div className="track__fill" />
            </div>
            <div className="track__steps">
              <span className="on">Confirmed</span>
              <span>Cooking</span>
              <span>On the way</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <Link to="/" className="btn btn--secondary">
              Order something else
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
