import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { toast } from "sonner";
import { api, ApiError } from "@ecom/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleAuthButton } from "./GoogleAuthButton.tsx";
import { AuthContext, type AuthContextValue } from "./auth-context.ts";
import * as googleAuthUtil from "@/utils/google-auth.ts";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockLogin = vi.fn();

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname + location.search}
    </div>
  );
}

function renderGoogleAuthButton({
  returnTo,
  context = "signin",
  initialEntry = "/login",
}: {
  returnTo?: string;
  context?: "signin" | "signup";
  initialEntry?: string;
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const authValue: AuthContextValue = {
    status: "guest",
    user: null,
    cartCount: 0,
    login: mockLogin,
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <GoogleAuthButton returnTo={returnTo} context={context} />
          <LocationProbe />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("GoogleAuthButton (AC-36, AC-37, AC-38, AC-39, AC-40, AC-41)", () => {
  let savedInitConfig: googleAuthUtil.GoogleIdConfiguration | null = null;
  let savedButtonOptions: googleAuthUtil.GsiButtonConfiguration | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    savedInitConfig = null;
    savedButtonOptions = null;

    // Setup mock window.google GIS SDK
    (window as unknown as { google: unknown }).google = {
      accounts: {
        id: {
          initialize: vi.fn((config: googleAuthUtil.GoogleIdConfiguration) => {
            savedInitConfig = config;
          }),
          renderButton: vi.fn(
            (
              parent: HTMLElement,
              options: googleAuthUtil.GsiButtonConfiguration,
            ) => {
              savedButtonOptions = options;
              const btn = document.createElement("button");
              btn.setAttribute("data-testid", "mocked-gis-button");
              btn.textContent = "Sign in with Google";
              parent.appendChild(btn);
            },
          ),
        },
      },
    };
  });

  afterEach(() => {
    delete (window as unknown as { google?: unknown }).google;
    googleAuthUtil.resetGoogleScriptPromiseForTests();
  });

  it("renders Google auth container and initializes GIS button (AC-36)", async () => {
    renderGoogleAuthButton();

    await waitFor(() => {
      expect(window.google?.accounts.id.initialize).toHaveBeenCalled();
      expect(window.google?.accounts.id.renderButton).toHaveBeenCalled();
      expect(screen.getByTestId("google-auth-container")).toBeInTheDocument();
      expect(screen.getByTestId("mocked-gis-button")).toBeInTheDocument();
    });

    expect(savedButtonOptions?.text).toBe("continue_with");
  });

  it("uses signup text option when context is signup (AC-36)", async () => {
    renderGoogleAuthButton({ context: "signup" });

    await waitFor(() => {
      expect(savedButtonOptions?.text).toBe("signup_with");
      expect(savedInitConfig?.context).toBe("signup");
    });
  });

  it("successfully signs in existing user and navigates to default / (AC-37)", async () => {
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: {
        accessToken: "at-google-123",
        refreshToken: "rt-google-123",
        isNewUser: false,
      },
    } as never);

    renderGoogleAuthButton();

    await waitFor(() => {
      expect(savedInitConfig).not.toBeNull();
    });

    // Simulate GIS returning valid credential callback
    await act(async () => {
      await savedInitConfig!.callback!({ credential: "mock-google-id-token" });
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/google", {
        body: { idToken: "mock-google-id-token" },
      });
      expect(mockLogin).toHaveBeenCalledWith({
        accessToken: "at-google-123",
        refreshToken: "rt-google-123",
      });
      expect(toast.success).toHaveBeenCalledWith("Đăng nhập thành công!");
      expect(screen.getByTestId("location-probe")).toHaveTextContent("/");
    });
  });

  it("successfully signs in new user, shows welcome toast, and navigates to returnTo (AC-38)", async () => {
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: {
        accessToken: "at-new-user",
        refreshToken: "rt-new-user",
        isNewUser: true,
      },
    } as never);

    renderGoogleAuthButton({ returnTo: "/checkout" });

    await waitFor(() => {
      expect(savedInitConfig).not.toBeNull();
    });

    await act(async () => {
      await savedInitConfig!.callback!({ credential: "new-user-token" });
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/google", {
        body: { idToken: "new-user-token" },
      });
      expect(mockLogin).toHaveBeenCalledWith({
        accessToken: "at-new-user",
        refreshToken: "rt-new-user",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Chào mừng bạn gia nhập Ecom!",
      );
      expect(screen.getByTestId("location-probe")).toHaveTextContent(
        "/checkout",
      );
    });
  });

  it("automatically links account when email matches existing user (AC-39)", async () => {
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: {
        accessToken: "at-linked-user",
        refreshToken: "rt-linked-user",
        isNewUser: false,
      },
    } as never);

    renderGoogleAuthButton({ returnTo: "/account" });

    await waitFor(() => {
      expect(savedInitConfig).not.toBeNull();
    });

    await act(async () => {
      await savedInitConfig!.callback!({ credential: "linked-user-token" });
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        accessToken: "at-linked-user",
        refreshToken: "rt-linked-user",
      });
      expect(toast.success).toHaveBeenCalledWith("Đăng nhập thành công!");
      expect(screen.getByTestId("location-probe")).toHaveTextContent(
        "/account",
      );
    });
  });

  it("handles backend error via api.onError and does not navigate (AC-40)", async () => {
    vi.spyOn(api, "post").mockRejectedValueOnce(
      new ApiError({
        status: 401,
        code: "AUTH-014",
        message: "Google token invalid",
      }),
    );

    renderGoogleAuthButton();

    await waitFor(() => {
      expect(savedInitConfig).not.toBeNull();
    });

    await act(async () => {
      await savedInitConfig!.callback!({ credential: "invalid-token" });
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockLogin).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      expect(screen.getByTestId("location-probe")).toHaveTextContent("/login");
    });
  });

  it("displays fallback button and toast when VITE_GOOGLE_CLIENT_ID is missing and window.google is absent (AC-41)", async () => {
    delete (window as unknown as { google?: unknown }).google;
    vi.spyOn(googleAuthUtil, "getGoogleClientId").mockReturnValue("");

    const user = userEvent.setup();
    renderGoogleAuthButton();

    const fallbackBtn = await screen.findByTestId("google-auth-button");
    expect(fallbackBtn).toHaveTextContent("Tiếp tục với Google");

    await user.click(fallbackBtn);
    expect(toast.error).toHaveBeenCalledWith(
      "Chưa cấu hình Google Client ID trên hệ thống.",
    );
  });

  it("displays error fallback button and toast when script fails to load (AC-41)", async () => {
    delete (window as unknown as { google?: unknown }).google;
    vi.spyOn(googleAuthUtil, "getGoogleClientId").mockReturnValue(
      "test-client-id",
    );
    vi.spyOn(googleAuthUtil, "loadGoogleScript").mockRejectedValueOnce(
      new Error("Network failed"),
    );

    const user = userEvent.setup();
    renderGoogleAuthButton();

    const fallbackBtn = await screen.findByTestId("google-auth-button");
    expect(fallbackBtn).toHaveTextContent("Tiếp tục với Google");

    await user.click(fallbackBtn);
    expect(toast.error).toHaveBeenCalledWith(
      "Không thể tải Google Sign-In. Vui lòng thử lại sau.",
    );
  });
});
