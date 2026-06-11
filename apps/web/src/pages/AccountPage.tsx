import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo, Button, Input } from "../components/ui";
import { useAuth } from "../features/auth/context/AuthContext";
import { getDevConfirmationCode } from "../lib/api";

type Mode = "login" | "signup" | "confirm";

export default function AccountPage() {
  const { user, signup, confirmEmail, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <Shell>
        <h1 className="account__title">You're signed in</h1>
        <p className="muted" style={{ marginBottom: "var(--space-6)" }}>
          {user.email}
        </p>
        <Link to="/" className="btn btn--primary">
          Back to browsing
        </Link>
      </Shell>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signup(email, password);
        const c = await getDevConfirmationCode(email); // dev-only; null in prod
        setDevCode(c);
        setMode("confirm");
      } else if (mode === "confirm") {
        await confirmEmail(email, code);
        await login(email, password);
        navigate("/");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <h1 className="account__title">
        {mode === "login"
          ? "Welcome back"
          : mode === "signup"
            ? "Create your account"
            : "Confirm your email"}
      </h1>

      {mode === "confirm" && devCode && (
        <div
          role="status"
          style={{
            background: "rgba(94,224,192,.12)",
            border: "1px solid rgba(94,224,192,.4)",
            borderRadius: "var(--radius-card)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-5)",
            fontSize: "var(--fs-14)",
          }}
        >
          Dev mode — your confirmation code is{" "}
          <strong style={{ fontFamily: "var(--font-mono)", color: "var(--color-ember)" }}>
            {devCode}
          </strong>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {mode !== "confirm" && (
          <>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}
        {mode === "confirm" && (
          <Input
            label="6-digit code"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        )}

        {error && <p style={{ color: "var(--color-danger)", fontSize: "var(--fs-14)" }}>{error}</p>}

        <Button type="submit" disabled={busy} block>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Confirm & sign in"}
        </Button>
      </form>

      {mode === "login" && (
        <p className="muted" style={{ marginTop: "var(--space-5)", fontSize: "var(--fs-14)" }}>
          New here?{" "}
          <button
            className="linklike"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
          >
            Create an account
          </button>
        </p>
      )}
      {mode !== "login" && (
        <p className="muted" style={{ marginTop: "var(--space-5)", fontSize: "var(--fs-14)" }}>
          Already have an account?{" "}
          <button
            className="linklike"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Sign in
          </button>
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <div className="site-header__row">
            <Logo />
          </div>
        </div>
      </header>
      <div
        className="wrap"
        style={{ maxWidth: 420, paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)" }}
      >
        {children}
      </div>
    </>
  );
}
