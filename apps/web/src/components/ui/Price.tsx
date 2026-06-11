import { formatCents } from "@workshop/shared";

interface PriceProps {
  cents: number;
  size?: "md" | "lg";
  variant?: "gold" | "ember";
}

export function Price({ cents, size = "md", variant = "gold" }: PriceProps) {
  const formatted = formatCents(cents);

  return (
    <span
      className={`price${size === "lg" ? " price--lg" : ""}${variant === "ember" ? " price--ember" : ""}`}
    >
      {formatted}
    </span>
  );
}
