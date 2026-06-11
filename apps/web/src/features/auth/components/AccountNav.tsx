import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyle: React.CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--fs-14)",
  fontWeight: 500,
  textDecoration: "none",
};

export function AccountNav() {
  const { user, ready, logout } = useAuth();
  if (!ready) return null;
  if (!user)
    return (
      <Link to="/account" style={linkStyle}>
        Sign in
      </Link>
    );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Link to="/account" style={{ ...linkStyle, color: "var(--color-text)" }}>
        {user.email}
      </Link>
      <button
        className="linklike"
        onClick={() => {
          void logout();
        }}
        style={{ fontSize: "var(--fs-14)" }}
      >
        Sign out
      </button>
    </span>
  );
}
