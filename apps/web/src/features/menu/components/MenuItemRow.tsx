import { useState } from "react";
import { Tag, Price } from "../../../components/ui";

type DietaryTone = "vegetarian" | "vegan" | "gluten-free" | "base";

function toTone(tag: string): DietaryTone {
  const t = tag.toLowerCase();
  if (t === "vegetarian") return "vegetarian";
  if (t === "vegan") return "vegan";
  if (t === "gluten-free" || t === "gluten free") return "gluten-free";
  return "base";
}

// Deterministic hue from item id
function photoHue(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return `photo--h${(n % 5) + 1}`;
}

type Props = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  dietaryTags: string[];
  imageUrl?: string;
  popular?: boolean;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function MenuItemRow({
  id,
  name,
  description,
  priceCents,
  dietaryTags,
  imageUrl,
  popular,
  quantity,
  onAdd,
  onRemove,
}: Props) {
  const [broken, setBroken] = useState(false);
  const hue = photoHue(id);
  const qty = quantity;
  const active = qty > 0;

  function handleAdd() {
    onAdd();
  }

  function handleRemove() {
    onRemove();
  }

  return (
    <article className="m-item reveal">
      {/* Dish image: show real image or fall back to coloured glow placeholder */}
      {imageUrl && !broken ? (
        <div
          className="photo photo--1x1"
          style={{ overflow: "hidden", borderRadius: "var(--radius-card)" }}
        >
          <img
            src={imageUrl}
            alt={name}
            onError={() => setBroken(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div className={`photo photo--1x1 photo--ph ${hue}`} />
      )}
      <div className="m-item__body">
        <div
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}
        >
          <div className="m-item__name">{name}</div>
          {popular && (
            <span
              className="tag tag--cuisine"
              style={{
                background: "var(--color-ember)",
                color: "var(--color-on-ember)",
                fontWeight: 700,
              }}
            >
              Popular
            </span>
          )}
        </div>
        {description && <div className="m-item__desc">{description}</div>}
        {dietaryTags.length > 0 && (
          <div className="m-item__tags">
            {dietaryTags.map((t) => (
              <Tag key={t} tone={toTone(t)}>
                {t}
              </Tag>
            ))}
          </div>
        )}
      </div>
      <div className="m-item__right">
        <Price cents={priceCents} />
        <button
          className={`add${active ? " is-active" : ""}`}
          aria-label={`Add ${name}`}
          onClick={handleAdd}
        >
          <span className="add__plus">+</span>
          <span className="add__stepper">
            <span
              className="add__btn minus"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  handleRemove();
                }
              }}
            >
              −
            </span>
            <span className="add__qty">{qty}</span>
            <span className="add__btn plus" role="button" tabIndex={0}>
              +
            </span>
          </span>
        </button>
      </div>
    </article>
  );
}
