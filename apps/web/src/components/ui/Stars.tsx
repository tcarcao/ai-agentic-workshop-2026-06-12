// Ember stars component — uses ember.css .stars classes with glyph technique
interface StarsProps {
  value: number; // 0–5, supports decimals
  count?: number;
}

export function Stars({ value, count }: StarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const pct = (clamped / 5) * 100;

  return (
    <span className="stars" role="img" aria-label={`${clamped} out of 5 stars`}>
      <span className="stars__glyphs">
        <span className="bg">★★★★★</span>
        <span className="fg" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="stars__num">{clamped.toFixed(1)}</span>
      {count !== undefined && <span className="stars__count">({count})</span>}
    </span>
  );
}
