import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, session } from "@ecom/api";
import { AuthProvider, useAuth } from "./index.ts";

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

const ME = {
  id: "u-1",
  displayName: "Nguyễn Văn A",
  email: "a@ecom.vn",
  role: "CUSTOMER",
};

/** A promise that the test settles when it decides. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function Consumer() {
  const { status, user, cartCount, logout } = useAuth();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.displayName : "none"}</div>
      <div data-testid="cart">{cartCount}</div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderProvider(queryClient = newClient(), children = <Consumer />) {
  const ui = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  return { queryClient, ...render(ui), ui };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  session.clear();
  localStorage.clear();
});

describe("the page opens with /users/me and /cart at the same time (AC-3)", () => {
  it("sends both before either one has answered", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    const me = deferred<unknown>();
    const cart = deferred<unknown>();
    const get = vi
      .spyOn(api, "get")
      .mockImplementation(((path: string) =>
        path === "/users/me" ? me.promise : cart.promise) as never);

    renderProvider();

    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    const paths = get.mock.calls.map((call) => call[0]);
    expect(paths).toContain("/users/me");
    expect(paths).toContain("/cart");
    // Both are still waiting: neither one waited for the other
    expect(screen.getByTestId("status")).toHaveTextContent("checking");
  });

  it("shows the cart count as soon as the cart answers, even while the user is still loading", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    const me = deferred<unknown>();
    vi.spyOn(api, "get").mockImplementation(((path: string) =>
      path === "/users/me"
        ? me.promise
        : Promise.resolve({ data: { lineCount: 3 } })) as never);

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("cart")).toHaveTextContent("3"),
    );
    expect(screen.getByTestId("status")).toHaveTextContent("checking");

    await act(async () => {
      me.resolve({ data: ME });
    });
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("signedIn"),
    );
    expect(screen.getByTestId("cart")).toHaveTextContent("3");
  });

  it("a visitor with no token asks for nothing: no /users/me, no /cart", () => {
    const get = vi.spyOn(api, "get");

    renderProvider();

    expect(get).not.toHaveBeenCalled();
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
  });

  it("asks for the cart once, not once per render", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    const get = vi
      .spyOn(api, "get")
      .mockImplementation(((path: string) =>
        Promise.resolve(
          path === "/users/me" ? { data: ME } : { data: { lineCount: 1 } },
        )) as never);

    renderProvider();
    await screen.findByText("Nguyễn Văn A");

    const carts = get.mock.calls.filter((call) => call[0] === "/cart");
    expect(carts).toHaveLength(1);
  });

  it("asks for the count as 'silent': a failure of it is not worth a message", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    const get = vi
      .spyOn(api, "get")
      .mockImplementation(((path: string) =>
        Promise.resolve(
          path === "/users/me" ? { data: ME } : { data: { lineCount: 0 } },
        )) as never);

    renderProvider();
    await screen.findByText("Nguyễn Văn A");

    expect(get).toHaveBeenCalledWith("/cart", { silent: true });
  });
});

describe("a token that was already dead when the page opened (AC-4)", () => {
  it("returns to guest quietly: no toast, token removed", async () => {
    session.set({ accessToken: "dead", refreshToken: "dead" });
    const me = deferred<unknown>();
    const cart = deferred<unknown>();
    vi.spyOn(api, "get").mockImplementation(((path: string) =>
      path === "/users/me" ? me.promise : cart.promise) as never);

    renderProvider();
    expect(screen.getByTestId("status")).toHaveTextContent("checking");

    // What @ecom/api does when the token cannot be renewed: it ends the session...
    act(() => {
      session.notifyExpired();
    });
    // ...and both calls fail
    await act(async () => {
      me.reject(new Error("401"));
      cart.reject(new Error("401"));
    });

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(session.getAccessToken()).toBeNull();
  });

  it("a person who WAS shown as signed in is told when the session ends", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    vi.spyOn(api, "get").mockImplementation(((path: string) =>
      Promise.resolve(
        path === "/users/me" ? { data: ME } : { data: { lineCount: 0 } },
      )) as never);
    renderProvider();
    await screen.findByText("Nguyễn Văn A");

    act(() => {
      session.notifyExpired();
    });

    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith(
      "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.",
    );
  });

  it("is told only once, even if the session ends twice", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    vi.spyOn(api, "get").mockImplementation(((path: string) =>
      Promise.resolve(
        path === "/users/me" ? { data: ME } : { data: { lineCount: 0 } },
      )) as never);
    renderProvider();
    await screen.findByText("Nguyễn Văn A");

    act(() => {
      session.notifyExpired();
      session.notifyExpired();
    });

    expect(toast.info).toHaveBeenCalledTimes(1);
  });
});

function seedPublicAndUserData(queryClient: QueryClient) {
  queryClient.setQueryData(["products", "list", {}], [{ id: "p1" }]);
  queryClient.setQueryData(["categories", "all"], [{ id: "c1" }]);
  queryClient.setQueryData(["catalog", "categories"], [{ id: "c1" }]);
  queryClient.setQueryData(["locations", "provinces"], [{ code: "01" }]);
  queryClient.setQueryData(["orders", "list", {}], [{ id: "o1" }]);
  queryClient.setQueryData(["checkout", "order", "o1"], { id: "o1" });
}

describe("what is forgotten when the person leaves (AC-5)", () => {
  async function signedInClient() {
    session.set({ accessToken: "a", refreshToken: "r" });
    vi.spyOn(api, "get").mockImplementation(((path: string) =>
      Promise.resolve(
        path === "/users/me" ? { data: ME } : { data: { lineCount: 2 } },
      )) as never);
    vi.spyOn(api, "post").mockResolvedValue({ data: null } as never);
    const rendered = renderProvider();
    await screen.findByText("Nguyễn Văn A");
    seedPublicAndUserData(rendered.queryClient);
    return rendered;
  }

  function expectOnlyPublicDataLeft(queryClient: QueryClient) {
    expect(queryClient.getQueryData(["products", "list", {}])).toEqual([
      { id: "p1" },
    ]);
    expect(queryClient.getQueryData(["categories", "all"])).toEqual([
      { id: "c1" },
    ]);
    expect(queryClient.getQueryData(["catalog", "categories"])).toEqual([
      { id: "c1" },
    ]);
    expect(queryClient.getQueryData(["locations", "provinces"])).toEqual([
      { code: "01" },
    ]);
    expect(queryClient.getQueryData(["orders", "list", {}])).toBeUndefined();
    expect(
      queryClient.getQueryData(["checkout", "order", "o1"]),
    ).toBeUndefined();
    expect(queryClient.getQueryData(["user", "me"])).toBeUndefined();
    expect(queryClient.getQueryData(["cart", "summary"])).toBeUndefined();
  }

  it("logging out keeps the public pages cached", async () => {
    const { queryClient } = await signedInClient();

    await act(async () => {
      screen.getByText("Logout").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expectOnlyPublicDataLeft(queryClient);
  });

  it("a session that ends keeps the public pages cached", async () => {
    const { queryClient } = await signedInClient();

    act(() => {
      session.notifyExpired();
    });

    expectOnlyPublicDataLeft(queryClient);
    expect(screen.getByTestId("status")).toHaveTextContent("guest");
  });

  it("logging out in another tab keeps the public pages cached", async () => {
    const { queryClient } = await signedInClient();

    session.clear(); // the other tab removed the tokens
    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ecom.refreshToken" }),
      );
    });

    expectOnlyPublicDataLeft(queryClient);
  });
});

describe("the auth context does not change for nothing (AC-6)", () => {
  function CountingConsumer({ onRender }: { onRender: () => void }) {
    useAuth();
    onRender();
    return null;
  }

  it("the same object when the provider renders again with nothing new", () => {
    const seen: unknown[] = [];
    function Spy() {
      seen.push(useAuth());
      return null;
    }
    const queryClient = newClient();
    const child = <Spy />;
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{child}</AuthProvider>
      </QueryClientProvider>,
    );
    const first = seen.at(-1);

    rerender(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{child}</AuthProvider>
      </QueryClientProvider>,
    );
    rerender(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{child}</AuthProvider>
      </QueryClientProvider>,
    );

    expect(new Set(seen).size).toBe(1);
    expect(seen.at(-1)).toBe(first);
  });

  it("a component that reads it does not render again when the provider renders for another reason", () => {
    let renders = 0;
    const queryClient = newClient();
    const child = <CountingConsumer onRender={() => (renders += 1)} />;
    renderProvider(queryClient, child);
    const before = renders;

    // The provider renders (its session counter changes) but status, user and cart count do not
    act(() => {
      session.notifyExpired();
    });
    act(() => {
      session.notifyExpired();
    });

    expect(renders).toBe(before);
  });

  it("does render again when what it holds really changes (the cart count)", async () => {
    session.set({ accessToken: "a", refreshToken: "r" });
    vi.spyOn(api, "get").mockImplementation(((path: string) =>
      Promise.resolve(
        path === "/users/me" ? { data: ME } : { data: { lineCount: 4 } },
      )) as never);

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("cart")).toHaveTextContent("4"),
    );
    expect(screen.getByTestId("status")).toHaveTextContent("signedIn");
  });
});
