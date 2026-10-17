import { describe, it, expect } from "vitest";
import {
  describeDiscount,
  describeMinimum,
  describeUnusable,
  formatVoucherExpiry,
} from "./voucher-format.ts";

const fixed = {
  discountType: "FIXED_AMOUNT" as const,
  value: 50000,
  maxDiscount: null,
  minOrderValue: 200000,
};
const percent = {
  discountType: "PERCENTAGE" as const,
  value: 10,
  maxDiscount: 100000,
  minOrderValue: 0,
};

describe("describeDiscount", () => {
  it("says the amount of a fixed voucher", () => {
    expect(describeDiscount(fixed)).toBe("Giảm 50.000 ₫");
  });

  it("says the percent and the cap of a percentage voucher", () => {
    expect(describeDiscount(percent)).toBe("Giảm 10%, tối đa 100.000 ₫");
  });

  it("leaves the cap out when there is none", () => {
    expect(describeDiscount({ ...percent, maxDiscount: null })).toBe(
      "Giảm 10%",
    );
  });
});

describe("describeMinimum", () => {
  it("says the smallest order", () => {
    expect(describeMinimum(fixed)).toBe("Đơn từ 200.000 ₫");
  });

  it("says nothing when there is no minimum", () => {
    expect(describeMinimum(percent)).toBeNull();
  });
});

describe("formatVoucherExpiry", () => {
  it("writes the day in Vietnam time", () => {
    // 17:00 UTC on the 31st is already the 1st in Vietnam (UTC+7)
    expect(formatVoucherExpiry("2026-10-31T17:00:00.000Z")).toBe(
      "HSD 01/11/2026",
    );
    expect(formatVoucherExpiry("2026-10-31T16:59:00.000Z")).toBe(
      "HSD 31/10/2026",
    );
  });

  it("gives nothing for a date it cannot read", () => {
    expect(formatVoucherExpiry("not a date")).toBe("");
  });
});

describe("describeUnusable", () => {
  it("says how much more to buy when the order is below the minimum", () => {
    expect(
      describeUnusable(
        { reason: "BELOW_MINIMUM", minOrderValue: 200000 },
        150000,
      ),
    ).toBe("Mua thêm 50.000 ₫ để dùng mã này");
  });

  it("falls back to a plain sentence when the missing amount cannot be worked out", () => {
    expect(
      describeUnusable(
        { reason: "BELOW_MINIMUM", minOrderValue: 200000 },
        200000,
      ),
    ).toBe("Chưa đủ giá trị đơn tối thiểu");
  });

  it.each([
    ["NO_DISCOUNT", "Mã này chưa giảm được cho giỏ hàng của bạn"],
    ["USED_UP", "Mã đã hết lượt dùng"],
    ["USER_LIMIT_REACHED", "Bạn đã dùng hết lượt của mã này"],
  ] as const)("%s has its own sentence", (reason, sentence) => {
    expect(describeUnusable({ reason, minOrderValue: 0 }, 100000)).toBe(
      sentence,
    );
  });

  it("says nothing for a voucher that can be used", () => {
    expect(
      describeUnusable({ reason: null, minOrderValue: 0 }, 100000),
    ).toBeNull();
  });
});
