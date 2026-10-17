import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import type { VoucherListItem } from "@/types";
import {
  VoucherPicker,
  type VoucherPickerProps,
  type VoucherStatus,
} from "./VoucherPicker.tsx";

const FIXED: VoucherListItem = {
  code: "GIAM50K",
  name: "Giảm 50 nghìn cho 100 người đầu tiên",
  discountType: "FIXED_AMOUNT",
  value: 50000,
  maxDiscount: null,
  minOrderValue: 200000,
  endsAt: "2026-10-31T10:00:00.000Z",
  usable: true,
  reason: null,
  discountAmount: 50000,
};
const PERCENT: VoucherListItem = {
  code: "SALE10",
  name: "Giảm 10% tối đa 100 nghìn",
  discountType: "PERCENTAGE",
  value: 10,
  maxDiscount: 100000,
  minOrderValue: 0,
  endsAt: "2026-11-30T10:00:00.000Z",
  usable: true,
  reason: null,
  discountAmount: 32000,
};
const TOO_BIG: VoucherListItem = {
  ...FIXED,
  code: "BIGONLY",
  name: "Chỉ cho đơn lớn",
  minOrderValue: 900000,
  usable: false,
  reason: "BELOW_MINIMUM",
  discountAmount: null,
};
const USED_UP: VoucherListItem = {
  ...FIXED,
  code: "HETLUOT",
  name: "Đã hết lượt",
  usable: false,
  reason: "USED_UP",
  discountAmount: null,
};

function setup(overrides: Partial<VoucherPickerProps> = {}) {
  const props: VoucherPickerProps = {
    isGuest: false,
    subtotal: 320000,
    appliedCode: null,
    status: { kind: "none" },
    vouchers: [FIXED, PERCENT, TOO_BIG, USED_UP],
    listState: "ready",
    onOpen: vi.fn(),
    onSelect: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter>
      <VoucherPicker {...props} />
    </MemoryRouter>,
  );
  const rerender = (next: Partial<VoucherPickerProps>) =>
    view.rerender(
      <MemoryRouter>
        <VoucherPicker {...props} {...next} />
      </MemoryRouter>,
    );
  return { user, props, rerender };
}

const box = () => screen.getByRole("combobox");

describe("the list of vouchers (AC-9)", () => {
  it("is closed until the box is clicked, then opens and tells the page to load the list", async () => {
    const { user, props } = setup();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(box()).toHaveAttribute("aria-expanded", "false");

    await user.click(box());

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(box()).toHaveAttribute("aria-expanded", "true");
    expect(box()).toHaveAttribute(
      "aria-controls",
      screen.getByRole("listbox").id,
    );
    expect(props.onOpen).toHaveBeenCalledTimes(1);
  });

  it("also opens from the arrow button and from the keyboard", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", { name: "Mở danh sách mã giảm giá" }),
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Mở danh sách mã giảm giá" }),
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    box().focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows each voucher with its code, name, discount, minimum and expiry, in the order it was given", async () => {
    const { user } = setup();

    await user.click(box());

    const options = screen.getAllByRole("option");
    expect(
      options.map((o) => within(o).getByText(/^[A-Z0-9]+$/).textContent),
    ).toEqual(["GIAM50K", "SALE10", "BIGONLY", "HETLUOT"]);
    const first = options[0];
    expect(
      within(first).getByText("Giảm 50 nghìn cho 100 người đầu tiên"),
    ).toBeInTheDocument();
    expect(
      within(first).getByText(
        "Giảm 50.000 ₫ · Đơn từ 200.000 ₫ · HSD 31/10/2026",
      ),
    ).toBeInTheDocument();
    expect(
      within(options[1]).getByText(
        "Giảm 10%, tối đa 100.000 ₫ · HSD 30/11/2026",
      ),
    ).toBeInTheDocument();
  });

  it("a voucher that can be used shows what it would take off, and can be picked by click", async () => {
    const { user, props } = setup();
    await user.click(box());

    const first = screen.getAllByRole("option")[0];
    expect(within(first).getByText("−50.000 ₫")).toBeInTheDocument();
    expect(first).toHaveAttribute("aria-disabled", "false");
    await user.click(first);

    expect(props.onSelect).toHaveBeenCalledWith("GIAM50K");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(box()).toHaveValue("GIAM50K");
  });

  it("a voucher that cannot be used is dimmed, says why, and cannot be picked", async () => {
    const { user, props } = setup();
    await user.click(box());

    const [, , tooBig, usedUp] = screen.getAllByRole("option");
    expect(tooBig).toHaveAttribute("aria-disabled", "true");
    expect(
      within(tooBig).getByText("Mua thêm 580.000 ₫ để dùng mã này"),
    ).toBeInTheDocument();
    expect(usedUp).toHaveAttribute("aria-disabled", "true");
    expect(within(usedUp).getByText("Mã đã hết lượt dùng")).toBeInTheDocument();
    expect(within(tooBig).queryByText(/^−/)).not.toBeInTheDocument();

    await user.click(tooBig);
    await user.click(usedUp);

    expect(props.onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("marks the chosen voucher as selected", async () => {
    const { user } = setup({ appliedCode: "SALE10" });
    await user.click(box());

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it.each([
    ["loading", "Đang tải danh sách mã…"],
    ["idle", "Đang tải danh sách mã…"],
    ["error", "Chưa tải được danh sách mã. Bạn vẫn có thể gõ mã vào ô."],
  ] as const)(
    "while the list is %s it says so",
    async (listState, sentence) => {
      const { user } = setup({ listState, vouchers: [] });

      await user.click(box());

      expect(screen.getByText(sentence)).toBeInTheDocument();
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    },
  );

  it("says so when there is no voucher at all", async () => {
    const { user } = setup({ vouchers: [] });

    await user.click(box());

    expect(
      screen.getByText("Hiện chưa có mã giảm giá nào."),
    ).toBeInTheDocument();
  });

  it("the text typed narrows the list by code or name, in any case", async () => {
    const { user } = setup();
    await user.click(box());

    await user.type(box(), "sale");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("SALE10")).toBeInTheDocument();

    await user.clear(box());
    await user.type(box(), "đơn lớn");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("BIGONLY")).toBeInTheDocument();

    await user.clear(box());
    await user.type(box(), "zzz");
    expect(screen.getByText("Không có mã nào khớp.")).toBeInTheDocument();
  });

  it("arrow keys move through the list and Enter picks the voucher that is lit", async () => {
    const { user, props } = setup();
    box().focus();

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(box()).toHaveAttribute(
      "aria-activedescendant",
      screen.getAllByRole("option")[1].id,
    );
    await user.keyboard("{Enter}");

    expect(props.onSelect).toHaveBeenCalledWith("SALE10");
  });

  it("Enter on a voucher that cannot be used picks nothing", async () => {
    const { user, props } = setup();
    box().focus();

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");

    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it("Escape closes the list, and so does a click outside it", async () => {
    const { user } = setup();
    await user.click(box());
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(box());
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("choosing another voucher replaces the old one (one at most)", async () => {
    const { user, props } = setup({ appliedCode: "GIAM50K" });
    await user.click(box());

    await user.click(screen.getAllByRole("option")[1]);

    expect(props.onSelect).toHaveBeenCalledTimes(1);
    expect(props.onSelect).toHaveBeenCalledWith("SALE10");
  });
});

describe("typing a code (AC-13)", () => {
  it("applies the typed code, without the spaces at the ends, with the button", async () => {
    const { user, props } = setup();

    await user.type(box(), "  giam50k ");
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    expect(props.onSelect).toHaveBeenCalledWith("giam50k");
  });

  it("applies it with Enter too, and it needs no list", async () => {
    const { user, props } = setup({ vouchers: [], listState: "error" });

    await user.type(box(), "MA-TAY{Enter}");

    expect(props.onSelect).toHaveBeenCalledWith("MA-TAY");
  });

  it("does nothing, and says nothing, for an empty box", async () => {
    const { user, props } = setup();

    await user.click(screen.getByRole("button", { name: "Áp dụng" }));
    await user.type(box(), "   ");
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    expect(props.onSelect).not.toHaveBeenCalled();
    expect(
      screen.getByText("Chọn một mã từ danh sách hoặc nhập mã của bạn."),
    ).toBeInTheDocument();
  });

  it("while the server checks the code the button is busy and cannot be pressed again", () => {
    setup({ appliedCode: "GIAM50K", status: { kind: "applying" } });

    expect(screen.getByRole("button", { name: /Áp dụng/ })).toBeDisabled();
    expect(screen.getByText("Đang kiểm tra mã…")).toBeInTheDocument();
  });
});

describe("what the line under the box says (AC-9, AC-16)", () => {
  it("says the code is applied", () => {
    const status: VoucherStatus = { kind: "applied", code: "GIAM50K" };

    setup({ appliedCode: "GIAM50K", status });

    expect(screen.getByText("Đã áp dụng mã GIAM50K.")).toBeInTheDocument();
    expect(box()).toHaveAttribute("aria-invalid", "false");
    expect(box()).toHaveValue("GIAM50K");
  });

  it("says why a code was refused, in the error colour, and marks the box invalid", () => {
    setup({
      status: { kind: "error", message: "Mã giảm giá này đã hết lượt dùng." },
    });

    const message = screen.getByText("Mã giảm giá này đã hết lượt dùng.");
    expect(message).toHaveClass("text-err");
    expect(message).toHaveAttribute("aria-live", "polite");
    expect(box()).toHaveAttribute("aria-invalid", "true");
    expect(box()).toHaveAttribute("aria-describedby", message.id);
  });

  it("the box follows the chosen code: it fills when one is chosen and empties when it is dropped", () => {
    const { rerender } = setup();
    expect(box()).toHaveValue("");

    rerender({ appliedCode: "GIAM50K" });
    expect(box()).toHaveValue("GIAM50K");

    rerender({ appliedCode: null });
    expect(box()).toHaveValue("");
  });
});

describe("removing the code (AC-17)", () => {
  it("has a Bỏ mã button only while a code is chosen, and it tells the page", async () => {
    const { user, props, rerender } = setup();
    expect(
      screen.queryByRole("button", { name: "Bỏ mã" }),
    ).not.toBeInTheDocument();

    rerender({
      appliedCode: "GIAM50K",
      status: { kind: "applied", code: "GIAM50K" },
    });
    await user.click(screen.getByRole("button", { name: "Bỏ mã" }));

    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("a guest (AC-15)", () => {
  it("cannot use the box, is told to sign in, and gets a link to do it", async () => {
    const { user, props } = setup({ isGuest: true, vouchers: [] });

    expect(box()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Áp dụng" })).toBeDisabled();
    expect(
      screen.getByText(/Đăng nhập để dùng mã giảm giá\./),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fcart",
    );

    await user.click(box());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(props.onOpen).not.toHaveBeenCalled();
  });
});
