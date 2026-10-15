import { describe, it, expect } from "vitest";
import { isNewAddressFormComplete } from "./address";

describe("address utils", () => {
  it("returns true only when all fields are non-empty", () => {
    expect(
      isNewAddressFormComplete({
        recipientName: "Nguyễn Văn A",
        phone: "0901234567",
        provinceCode: "01",
        wardCode: "001",
        street: "123 Đường A",
      }),
    ).toBe(true);

    expect(
      isNewAddressFormComplete({
        recipientName: "  ",
        phone: "0901234567",
        provinceCode: "01",
        wardCode: "001",
        street: "123 Đường A",
      }),
    ).toBe(false);
  });
});
