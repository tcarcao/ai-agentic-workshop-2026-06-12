import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addToCart, removeFromCart, type CartLine } from "../domain/cart";

type CartContextType = {
  lines: CartLine[];
  add: (item: Omit<CartLine, "quantity">) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "workshop-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) setLines(JSON.parse(raw));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  return (
    <CartContext.Provider
      value={{
        lines,
        add: (item) => setLines((prev) => addToCart(prev, item)),
        remove: (id) => setLines((prev) => removeFromCart(prev, id)),
        clear: () => setLines([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
