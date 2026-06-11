import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test/server";
import { AuthProvider } from "../features/auth/context/AuthContext";
import AccountPage from "./AccountPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/account"]}>
      <AuthProvider>
        <AccountPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

it("transitions signup -> confirm and shows the dev-code hint", async () => {
  server.use(
    http.post("/api/auth/signup", () =>
      HttpResponse.json({ email: "user@test.com", confirmed: false }, { status: 201 }),
    ),
    // MSW matches the path without query params when using http.get with the base path
    http.get("/api/dev/confirmation-code", () => HttpResponse.json({ code: "123456" })),
  );
  const user = userEvent.setup();
  renderPage();

  // Click the "Create an account" toggle (linklike button) to switch from login → signup mode
  await user.click(screen.getByRole("button", { name: "Create an account" }));

  await user.type(screen.getByLabelText(/email/i), "user@test.com");
  await user.type(screen.getByLabelText(/password/i), "longenough");

  // Submit button in signup mode reads "Create account"
  await user.click(screen.getByRole("button", { name: "Create account" }));

  expect(await screen.findByRole("heading", { name: /confirm your email/i })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("123456"));
});

it("shows the server error when signup is rejected", async () => {
  server.use(
    http.post("/api/auth/signup", () =>
      HttpResponse.json({ error: "That email is already registered." }, { status: 409 }),
    ),
  );
  const user = userEvent.setup();
  renderPage();

  await user.click(screen.getByRole("button", { name: "Create an account" }));
  await user.type(screen.getByLabelText(/email/i), "existing@test.com");
  await user.type(screen.getByLabelText(/password/i), "longenough");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  expect(await screen.findByText(/already registered/i)).toBeInTheDocument();
});
