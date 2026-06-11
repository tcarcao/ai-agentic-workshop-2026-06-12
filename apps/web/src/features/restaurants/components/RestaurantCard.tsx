import { Link } from "react-router-dom";
import { Stars } from "../../../components/ui";
import { formatCents } from "@workshop/shared";

type Props = {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  ratingAvg?: number;
  ratingCount?: number;
  deliveryMinutes?: number;
  deliveryFeeCents?: number;
  priceLevel?: number;
  featured?: boolean;
};

// Hash the id to get a stable photo placeholder hue class (h1–h5)
function photoHue(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return `photo--h${(n % 5) + 1}`;
}

function priceLevelLabel(level: number): string {
  return "$".repeat(Math.min(3, Math.max(1, level)));
}

function DeliveryFee({ feeCents }: { feeCents: number }) {
  if (feeCents === 0) {
    return <span style={{ color: "var(--color-success)" }}>Free delivery</span>;
  }
  return <span className="muted">{formatCents(feeCents)} delivery</span>;
}

export function RestaurantCard({
  id,
  name,
  cuisine,
  imageUrl,
  ratingAvg = 0,
  ratingCount = 0,
  deliveryMinutes = 30,
  deliveryFeeCents = 0,
  priceLevel = 2,
  featured = false,
}: Props) {
  const hue = photoHue(id);
  const isPopular = ratingAvg >= 4.7;

  if (featured) {
    return (
      <Link to={`/restaurants/${id}`} className="r-card r-card--featured">
        {imageUrl ? (
          <div className="photo photo--16x9 photo--scrim" style={{ aspectRatio: "16/10" }}>
            <img src={imageUrl} alt={name} />
          </div>
        ) : (
          <div className={`photo photo--16x9 photo--ph ${hue}`} style={{ aspectRatio: "16/10" }} />
        )}
        <div className="r-card__overlay">
          {isPopular && (
            <span
              className="tag tag--cuisine"
              style={{
                background: "var(--color-ember)",
                color: "var(--color-on-ember)",
                fontWeight: 700,
                marginBottom: "var(--space-2)",
                display: "inline-flex",
              }}
            >
              Popular
            </span>
          )}
          <h3 className="r-card__name">{name}</h3>
          <div className="r-card__meta" style={{ marginTop: 12 }}>
            <span className="muted">{cuisine}</span>
            <span className="r-card__dot" />
            <Stars value={ratingAvg} count={ratingCount} />
            <span className="r-card__dot" />
            <span style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}>
              {deliveryMinutes} min
            </span>
            <span className="r-card__dot" />
            <DeliveryFee feeCents={deliveryFeeCents} />
            <span className="r-card__dot" />
            <span className="muted" style={{ fontFamily: "var(--font-mono)" }}>
              {priceLevelLabel(priceLevel)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/restaurants/${id}`} className="r-card">
      <div style={{ position: "relative" }}>
        {imageUrl ? (
          <div className="photo photo--16x9">
            <img src={imageUrl} alt={name} />
          </div>
        ) : (
          <div className={`photo photo--16x9 photo--ph ${hue}`} />
        )}
        {isPopular && (
          <span
            className="tag tag--cuisine"
            style={{
              position: "absolute",
              top: "var(--space-3)",
              left: "var(--space-3)",
              background: "var(--color-ember)",
              color: "var(--color-on-ember)",
              fontWeight: 700,
              zIndex: 1,
            }}
          >
            Popular
          </span>
        )}
      </div>
      <div className="r-card__body">
        <h3 className="r-card__name">{name}</h3>
        <div className="r-card__meta" style={{ marginBottom: "var(--space-1)" }}>
          <span className="muted">{cuisine}</span>
          <span className="r-card__dot" />
          <Stars value={ratingAvg} count={ratingCount} />
        </div>
        <div className="r-card__meta muted">
          <span style={{ color: "var(--color-ember)", fontFamily: "var(--font-mono)" }}>
            {deliveryMinutes} min
          </span>
          <span className="r-card__dot" />
          <DeliveryFee feeCents={deliveryFeeCents} />
          <span className="r-card__dot" />
          <span style={{ fontFamily: "var(--font-mono)" }}>{priceLevelLabel(priceLevel)}</span>
        </div>
      </div>
    </Link>
  );
}
