import { type ElementType, type ComponentPropsWithoutRef } from "react";

interface CardProps<T extends ElementType = "div"> {
  as?: T;
  className?: string;
  children?: React.ReactNode;
}

type PolymorphicCardProps<T extends ElementType> = CardProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardProps<T>>;

export function Card<T extends ElementType = "div">({
  as,
  className = "",
  children,
  ...rest
}: PolymorphicCardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component className={`r-card${className ? " " + className : ""}`} {...rest}>
      {children}
    </Component>
  );
}
