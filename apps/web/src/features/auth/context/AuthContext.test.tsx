import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import { AuthProvider, useAuth } from "./AuthContext";

function Probe() {
  const { user, ready } = useAuth();
  return <div>{ready ? (user ? `user:${user.email}` : "anon") : "loading"}</div>;
}

it("starts anon when /me returns no user", async () => {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await waitFor(() => expect(screen.getByText("anon")).toBeInTheDocument());
});

it("reflects a logged-in user from /me", async () => {
  server.use(
    http.get("/api/auth/me", () =>
      HttpResponse.json({ user: { id: "u1", email: "a@b.com", confirmed: true } }),
    ),
  );
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await waitFor(() => expect(screen.getByText("user:a@b.com")).toBeInTheDocument());
});
