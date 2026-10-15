import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { OrderCounts, OrderSummary } from "@/types";
import { ORDERS_PAGE_SIZE } from "@/features/orders/hooks";
import { OrdersPage } from "./OrdersPage.tsx";

const COUNTS: OrderCounts = {
  PENDING: 0,
  PAYMENT_PROCESSING: 0,
  CONFIRMED: 0,
  SHIPPING: 0,
  DELIVERED: 22,
  CANCELLED: 0,
  EXPIRED: 0,
};

function makeOrders(count: number): OrderSummary[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${String(index + 1).padStart(8, "0")}-0000-0000-0000-000000000000`,
    status: "DELIVERED",
    paymentMethod: "COD",
    total: 1000,
    itemCount: 1,
    items: [
      { productName: `Sản phẩm ${index + 1}`, thumbnail: null, quantity: 1 },
    ],
    createdAt: "2026-10-01T08:00:00.000Z",
  }));
}

interface Call {
  path: string;
  query: Record<string, unknown>;
}

/** A fake API that pages like the real one: `limit` and a cursor that is the index of the next order. */
function installFakeApi(all: OrderSummary[]) {
  const calls: Call[] = [];
  vi.spyOn(api, "get").mockImplementation((async (
    path: string,
    config?: { query?: Record<string, unknown> },
  ) => {
    const query = config?.query ?? {};
    calls.push({ path, query });
    if (path === "/orders/counts") return { data: COUNTS };
    if (path === "/orders") {
      const start = Number(query.cursor ?? 0);
      const limit = Number(query.limit);
      const next = start + limit;
      return {
        data: all.slice(start, next),
        meta: { hasMore: next < all.length, nextCursor: String(next) },
      };
    }
    return {};
  }) as never);
  return {
    calls,
    orderCalls: () => calls.filter((call) => call.path === "/orders"),
    countCalls: () => calls.filter((call) => call.path === "/orders/counts"),
  };
}

const authValue: AuthContextValue = {
  status: "signedIn",
  user: {
    id: "u-1",
    email: "a@ecom.vn",
    displayName: "Nguyễn Văn A",
    role: "CUSTOMER",
    avatarUrl: null,
    hasPassword: true,
    googleLinked: false,
    createdAt: "2026-10-14T08:00:00.000Z",
  },
  cartCount: 0,
  login: vi.fn(),
  logout: vi.fn(),
};

function renderPage(initialUrl = "/account/orders") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [{ path: "/account/orders", element: <OrdersPage /> }],
    { initialEntries: ["/before", initialUrl], initialIndex: 1 },
  );
  const navigations: string[] = [];
  router.subscribe((state) => {
    navigations.push(`${state.historyAction} ${state.location.search}`);
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
  return { router, navigations };
}

const sleep = (milliseconds: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  });

const codeBox = () => screen.getByLabelText(/Mã đơn/) as HTMLInputElement;

function typeKeys(text: string) {
  for (const character of text) {
    fireEvent.change(codeBox(), {
      target: { value: codeBox().value + character },
    });
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("the orders list asks for 10 at a time (AC-8)", () => {
  it("is 10, not 4", () => {
    expect(ORDERS_PAGE_SIZE).toBe(10);
  });

  it("22 orders take 3 requests: 10, then 10, then 2", async () => {
    const api = installFakeApi(makeOrders(22));
    renderPage();
    await screen.findByText("#00000001");
    expect(screen.getAllByRole("listitem").length).toBe(10);

    fireEvent.click(
      await screen.findByRole("button", { name: "Xem thêm đơn hàng" }),
    );
    await waitFor(() =>
      expect(screen.getByText("#00000020")).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("listitem").length).toBe(20);

    fireEvent.click(
      await screen.findByRole("button", { name: "Xem thêm đơn hàng" }),
    );
    await waitFor(() =>
      expect(screen.getByText("#00000022")).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("listitem").length).toBe(22);
    expect(
      screen.queryByRole("button", { name: "Xem thêm đơn hàng" }),
    ).not.toBeInTheDocument();

    const orderCalls = api.orderCalls();
    expect(orderCalls).toHaveLength(3);
    expect(orderCalls.map((call) => call.query.limit)).toEqual([10, 10, 10]);
    expect(orderCalls.map((call) => call.query.cursor)).toEqual([
      undefined,
      "10",
      "20",
    ]);
  });
});

describe("typing the order code (AC-7)", () => {
  it("typing 8 characters makes one new request for the list and one for the counts, after the pause", async () => {
    const fake = installFakeApi(makeOrders(22));
    renderPage();
    await screen.findByText("#00000001");
    const listBefore = fake.orderCalls().length;
    const countsBefore = fake.countCalls().length;

    typeKeys("0000000a");
    // While typing nothing is asked, and the box already shows everything
    expect(codeBox()).toHaveValue("0000000a");
    await sleep(100);
    expect(fake.orderCalls().length).toBe(listBefore);
    expect(fake.countCalls().length).toBe(countsBefore);

    await sleep(350);

    await waitFor(() => expect(fake.orderCalls().length).toBe(listBefore + 1));
    expect(fake.countCalls().length).toBe(countsBefore + 1);
    expect(fake.orderCalls().at(-1)?.query.q).toBe("0000000a");
    expect(fake.countCalls().at(-1)?.query.q).toBe("0000000a");
  });

  it("a code shorter than 6 characters makes no request at all, even after the pause", async () => {
    const fake = installFakeApi(makeOrders(22));
    renderPage();
    await screen.findByText("#00000001");
    const before = fake.calls.length;

    typeKeys("00000");
    await sleep(450);

    expect(fake.calls.length).toBe(before);
  });

  it("adds no history entry: the typing is one REPLACE, and Back leaves the page", async () => {
    installFakeApi(makeOrders(22));
    const { router, navigations } = renderPage();
    await screen.findByText("#00000001");
    navigations.length = 0;

    typeKeys("00000001");
    await sleep(450);

    expect(navigations).toEqual(["REPLACE ?q=00000001"]);

    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe("/before");
  });

  it("changing the status tab still adds a history entry, so Back works there", async () => {
    installFakeApi(makeOrders(22));
    const { navigations } = renderPage();
    await screen.findByText("#00000001");
    navigations.length = 0;

    fireEvent.click(screen.getByRole("button", { name: /Đã giao/ }));

    await waitFor(() => expect(navigations).toEqual(["PUSH ?tab=delivered"]));
  });

  it("clearing the filters empties the box too", async () => {
    installFakeApi(makeOrders(22));
    renderPage("/account/orders?q=0000000a&range=7d");
    await screen.findByText("#00000001").catch(() => undefined);
    expect(codeBox()).toHaveValue("0000000a");

    const clear = await screen.findByRole("button", {
      name: /Xóa bộ lọc|Xoá bộ lọc/,
    });
    await userEvent.click(clear);

    await waitFor(() => expect(codeBox()).toHaveValue(""));
  });
});
