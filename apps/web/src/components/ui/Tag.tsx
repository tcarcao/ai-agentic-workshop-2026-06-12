// Ember dietary tag — maps tone to ember.css class
type Tone = "vegetarian" | "vegan" | "gluten-free" | "base";

interface TagProps {
  tone?: Tone;
  children: React.ReactNode;
}

const toneClass: Record<Tone, string> = {
  vegetarian: "tag tag--veg",
  vegan: "tag tag--vegan",
  "gluten-free": "tag tag--gf",
  base: "tag tag--cuisine",
};

export function Tag({ tone = "base", children }: TagProps) {
  return <span className={toneClass[tone]}>{children}</span>;
}
