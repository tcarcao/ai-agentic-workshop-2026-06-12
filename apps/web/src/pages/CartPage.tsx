import { Link } from "react-router-dom";
import { CartView } from "../features/cart/components/CartView";
import { Logo } from "../components/ui";

export default function CartPage() {
  return (
    <>
      {/* Minimal header on cart page */}
      <header className="site-header">
        <div className="wrap">
          <div className="site-header__row">
            <Logo />
            <Link to="/" className="btn btn--ghost" style={{ marginLeft: "auto" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>{" "}
              Keep browsing
            </Link>
          </div>
        </div>
      </header>

      <div className="wrap">
        <CartView />
      </div>
    </>
  );
}
