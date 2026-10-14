import { describe, expect, it } from "vitest";
import { MESSAGES, userMessageFor } from "./error-messages";
import { ApiError } from "./errors";

// The error codes of the backend a customer can meet (src/core/domain/exceptions/error-codes.ts).
// When the backend adds a code a customer can meet, add it here and give it a sentence.
const CUSTOMER_CODES = [
  "SYS-001",
  "SYS-002",
  "VAL-001",
  ...[
    "000",
    "001",
    "002",
    "003",
    "004",
    "005",
    "006",
    "007",
    "008",
    "009",
    "010",
    "011",
    "012",
    "013",
    "014",
    "015",
    "016",
    "017",
    "018",
    "019",
    "020",
  ].map((n) => `AUTH-${n}`),
  ...["000", "001", "002", "003", "006"].map((n) => `USR-${n}`),
  ...["000", "001", "002", "003"].map((n) => `ADDR-${n}`),
  ...["001", "002"].map((n) => `LOC-${n}`),
  ...["000", "001", "002", "003", "004", "005"].map((n) => `CART-${n}`),
  ...["000", "001", "002", "003", "004", "005", "006"].map((n) => `ORD-${n}`),
  ...["000", "001", "002", "003", "004", "005", "006"].map((n) => `PAY-${n}`),
  ...["001", "002", "003", "004", "005", "006", "007", "008", "009"].map(
    (n) => `INV-${n}`,
  ),
  "CAT-010",
  "CAT-017",
  "CAT-018",
];

// Administration only: a customer does not meet them, so they get the sentence for their status
const ADMIN_CODES = [
  "CAT-001",
  "CAT-002",
  "CAT-016",
  "STO-001",
  "STO-003",
  "AUTH-021",
];

const say = (
  status: number,
  code: string,
  extra: Partial<Parameters<typeof userMessageFor>[0]> = {},
) => userMessageFor({ status, code, ...extra });

describe("a sentence for a known code (AC-15)", () => {
  it.each([
    [
      "ORD-001",
      409,
      "Một số sản phẩm không còn đủ hàng. Hãy giảm số lượng hoặc bỏ sản phẩm đó khỏi giỏ.",
    ],
    ["CART-002", 409, "Mỗi sản phẩm chỉ mua được tối đa 99 cái."],
    [
      "PAY-005",
      409,
      "Đã hết thời gian thanh toán cho đơn này. Hãy đặt đơn mới.",
    ],
    ["AUTH-001", 401, "Email hoặc mật khẩu chưa đúng."],
    ["AUTH-020", 403, "Tài khoản này đã bị tạm khóa. Vui lòng liên hệ hỗ trợ."],
    ["AUTH-008", 400, "Mã chưa đúng hoặc đã hết hạn."],
    ["USR-002", 409, "Email này đã có tài khoản. Hãy đăng nhập."],
  ])("%s says the friendly sentence", (code, status, sentence) => {
    expect(say(status, code, { traceId: "t-1" })).toBe(sentence);
  });

  it("keeps the backend's English sentence in message, and the friendly one in userMessage", () => {
    const error = new ApiError({
      status: 409,
      code: "ORD-001",
      message: "Not enough stock available",
    });

    expect(error.message).toBe("Not enough stock available");
    expect(error.userMessage).toContain("không còn đủ hàng");
  });

  it.each([
    ["COMMON", "Mật khẩu này quá phổ biến, hãy chọn mật khẩu khác."],
    [
      "REPEATED_OR_SEQUENTIAL",
      "Mật khẩu không được là chuỗi lặp hoặc dãy liên tiếp.",
    ],
    ["CONTAINS_EMAIL", "Mật khẩu không được chứa email của bạn."],
    ["CONTAINS_APP_NAME", "Mật khẩu không được chứa tên cửa hàng."],
    ["SOMETHING_NEW", "Mật khẩu này quá dễ đoán, hãy chọn mật khẩu khác."],
  ])("AUTH-010 with reason %s", (reason, sentence) => {
    expect(say(400, "AUTH-010", { errors: { reason } })).toBe(sentence);
  });

  it("AUTH-010 without a reason still has a sentence", () => {
    expect(say(400, "AUTH-010")).toBe(
      "Mật khẩu này quá dễ đoán, hãy chọn mật khẩu khác.",
    );
  });
});

describe("a code that is not in the table (AC-16)", () => {
  it.each([
    [400, "Yêu cầu chưa hợp lệ, hãy kiểm tra lại."],
    [401, "Bạn cần đăng nhập để tiếp tục."],
    [403, "Bạn không có quyền thực hiện việc này."],
    [404, "Không tìm thấy nội dung bạn cần."],
    [409, "Thao tác bị xung đột, hãy thử lại."],
  ])(
    "status %i gets its general sentence and a reference for support",
    (status, sentence) => {
      expect(say(status, "XYZ-999", { traceId: "abc-123" })).toBe(
        `${sentence} Mã tham chiếu: abc-123`,
      );
    },
  );

  it("works with no code in the body (HTTP_<status>) and no trace id", () => {
    expect(say(404, "HTTP_404")).toBe("Không tìm thấy nội dung bạn cần.");
  });

  it("a server fault gets the reference even when the code is known", () => {
    expect(say(503, "PAY-006", { traceId: "abc-123" })).toBe(
      "Cổng thanh toán đang tạm gián đoạn. Hãy thử lại sau ít phút. Mã tham chiếu: abc-123",
    );
    expect(say(500, "SYS-001", { traceId: "abc-123" })).toContain(
      "Mã tham chiếu: abc-123",
    );
    expect(say(502, "HTTP_502", { traceId: "abc-123" })).toBe(
      "Hệ thống đang bận, hãy thử lại sau. Mã tham chiếu: abc-123",
    );
  });

  it("a known client mistake carries no reference", () => {
    expect(say(409, "ORD-001", { traceId: "abc-123" })).not.toContain(
      "Mã tham chiếu",
    );
  });
});

describe("no usable answer (AC-17)", () => {
  it("says the network is the problem", () => {
    expect(say(0, "NETWORK")).toBe(
      "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
    );
  });

  it("says the answer could not be read, without a reference", () => {
    expect(say(502, "BAD_RESPONSE", { traceId: "abc" })).toBe(
      "Hệ thống trả về dữ liệu không đọc được. Hãy thử lại sau.",
    );
  });
});

describe("too many requests (AC-18)", () => {
  it.each([
    [45, "Bạn thao tác quá nhanh. Thử lại sau 45 giây."],
    [59.2, "Bạn thao tác quá nhanh. Thử lại sau 60 giây."],
    [60, "Bạn thao tác quá nhanh. Thử lại sau 1 phút."],
    [120, "Bạn thao tác quá nhanh. Thử lại sau 2 phút."],
    [121, "Bạn thao tác quá nhanh. Thử lại sau 3 phút."],
    [undefined, "Bạn thao tác quá nhanh. Hãy thử lại sau ít phút."],
  ])("retry after %s", (retryAfterSeconds, sentence) => {
    expect(say(429, "AUTH-006", { retryAfterSeconds })).toBe(sentence);
  });

  it("applies to any code answered with 429", () => {
    expect(say(429, "HTTP_429", { retryAfterSeconds: 30 })).toBe(
      "Bạn thao tác quá nhanh. Thử lại sau 30 giây.",
    );
  });
});

describe("the table covers what a customer can meet (AC-24)", () => {
  it.each(CUSTOMER_CODES)("%s has a Vietnamese sentence", (code) => {
    const sentence = MESSAGES[code];

    expect(sentence).toBeTruthy();
    expect(sentence).toMatch(
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i,
    );
  });

  it("no sentence shows a code or a technical word", () => {
    for (const sentence of Object.values(MESSAGES)) {
      expect(sentence).not.toMatch(/[A-Z]{2,5}-\d{3}/);
      expect(sentence).not.toMatch(
        /token|idempotency|sql|http|api|null|undefined|exception/i,
      );
    }
  });

  it("has no sentence for a code that is not a customer's (the table stays honest)", () => {
    for (const code of Object.keys(MESSAGES))
      expect(ADMIN_CODES).not.toContain(code);
  });

  it.each(ADMIN_CODES)(
    "%s falls back to the sentence for its status",
    (code) => {
      expect(say(409, code)).toBe("Thao tác bị xung đột, hãy thử lại.");
    },
  );
});
