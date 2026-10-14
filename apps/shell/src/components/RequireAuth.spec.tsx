import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { RequireAuth } from "./RequireAuth.tsx";
import {
  AuthContext,
  type AuthContextValue,
} from "../features/auth/auth-context.ts";

function renderWithAuth(
  authStatus: AuthContextValue["status"],
  initialPath = "/protected",
) {
  const fullValue: AuthContextValue = {
    status: authStatus,
    user:
      authStatus === "signedIn"
        ? { id: "1", role: "CUSTOMER", displayName: "User" }
        : null,
    cartCount: 0,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={fullValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div data-testid="protected-content">Protected Content</div>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={<div data-testid="login-page">Login Page</div>}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("RequireAuth (AC-24)", () => {
  it("renders loading indicator while session is checking", () => {
    renderWithAuth("checking");
    expect(screen.getByTestId("auth-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects to login with returnTo when guest", () => {
    renderWithAuth("guest", "/protected?tab=settings");
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders protected content when user is signed in", () => {
    renderWithAuth("signedIn");
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});
