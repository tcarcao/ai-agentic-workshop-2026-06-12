import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({
  variant = "primary",
  block = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn btn--primary"
      : variant === "secondary"
        ? "btn btn--secondary"
        : "btn btn--ghost";

  return (
    <button
      className={`${variantClass}${block ? " btn--block" : ""}${className ? " " + className : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
