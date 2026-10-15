import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useDebouncedSearchParam } from "./useDebouncedSearchParam.ts";

function Box() {
  const { input, setInput } = useDebouncedSearchParam("q", 300);
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  return (
    <div>
      <input
        aria-label="code"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <button onClick={() => setSearchParams(new URLSearchParams())}>
        clear
      </button>
      <button onClick={() => navigate(-1)}>back</button>
      <button
        onClick={() =>
          setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set("tab", "shipping");
            return next;
          })
        }
      >
        tab
      </button>
    </div>
  );
}

function setup(initialUrl = "/orders") {
  const router = createMemoryRouter([{ path: "/orders", element: <Box /> }], {
    initialEntries: ["/before", initialUrl],
    initialIndex: 1,
  });
  const navigations: string[] = [];
  router.subscribe((state) => {
    navigations.push(`${state.historyAction} ${state.location.search}`);
  });
  render(<RouterProvider router={router} />);
  return { router, navigations };
}

const box = () => screen.getByLabelText("code") as HTMLInputElement;

/** Types key by key, like a person: the box gets one more character each time. */
function typeKeys(text: string) {
  for (const character of text) {
    fireEvent.change(box(), { target: { value: box().value + character } });
  }
}

function pause(milliseconds = 300) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useDebouncedSearchParam (AC-7)", () => {
  it("shows what is in the URL at first", () => {
    setup("/orders?q=3FA85F64");

    expect(box()).toHaveValue("3FA85F64");
  });

  it("typing 8 characters writes the URL once, after the pause, and replaces the entry", () => {
    const { router, navigations } = setup();

    typeKeys("3FA85F64");
    // while typing: the box has everything, the URL nothing
    expect(box()).toHaveValue("3FA85F64");
    expect(router.state.location.search).toBe("");
    expect(navigations).toEqual([]);

    pause();

    expect(router.state.location.search).toBe("?q=3FA85F64");
    expect(navigations).toEqual(["REPLACE ?q=3FA85F64"]); // one write, no PUSH
  });

  it("does not write before the pause is over", () => {
    const { navigations } = setup();

    typeKeys("3FA85F64");
    pause(299);

    expect(navigations).toEqual([]);
  });

  it("does not add a history entry: Back goes to the page before the orders", () => {
    const { router } = setup();
    typeKeys("3FA85F64");
    pause();

    fireEvent.click(screen.getByText("back"));

    expect(router.state.location.pathname).toBe("/before");
  });

  it("keeps the other parameters", () => {
    const { router } = setup("/orders?tab=waiting&range=7d");

    typeKeys("3FA85F");
    pause();

    expect(new URLSearchParams(router.state.location.search).toString()).toBe(
      "tab=waiting&range=7d&q=3FA85F",
    );
  });

  it("emptying the box removes q from the URL", () => {
    const { router } = setup("/orders?q=3FA85F64&tab=waiting");

    fireEvent.change(box(), { target: { value: "" } });
    pause();

    expect(router.state.location.search).toBe("?tab=waiting");
  });

  it("a box with only spaces is the same as an empty one: no write", () => {
    const { navigations } = setup();

    typeKeys("   ");
    pause();

    expect(navigations).toEqual([]);
  });

  it("when the URL changes from outside (a clear button), the box follows", () => {
    setup("/orders?q=3FA85F64");
    expect(box()).toHaveValue("3FA85F64");

    fireEvent.click(screen.getByText("clear"));

    expect(box()).toHaveValue("");
  });

  it("another parameter changing does not touch what is being typed", () => {
    setup();
    typeKeys("3FA");

    fireEvent.click(screen.getByText("tab"));

    expect(box()).toHaveValue("3FA");
  });

  it("characters typed while the URL is being updated are not lost", () => {
    const { router } = setup();

    typeKeys("3FA85F");
    pause(); // the URL gets "3FA85F"
    typeKeys("64"); // more typing right after

    expect(box()).toHaveValue("3FA85F64");

    pause();

    expect(router.state.location.search).toBe("?q=3FA85F64");
    expect(box()).toHaveValue("3FA85F64");
  });

  it("two pauses make two writes, never one per key", () => {
    const { navigations } = setup();

    typeKeys("3FA85F");
    pause();
    typeKeys("64");
    pause();

    expect(navigations).toEqual(["REPLACE ?q=3FA85F", "REPLACE ?q=3FA85F64"]);
  });

  it("a long burst of typing is still one write (no write per key)", () => {
    const { navigations } = setup();

    typeKeys("a".repeat(200));
    pause();

    expect(navigations).toHaveLength(1);
  });
});
