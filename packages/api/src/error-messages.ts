// What the customer reads when a call fails. Every sentence is for the customer: no error codes and no
// technical words. The backend's own English sentence stays in ApiError.message for the logs.

export interface ErrorInfo {
  status: number;
  code: string;
  retryAfterSeconds?: number;
  errors?: unknown;
  traceId?: string;
}

const STOCK =
  "Một số sản phẩm không còn đủ hàng. Hãy giảm số lượng hoặc bỏ sản phẩm đó khỏi giỏ.";
const REGISTRATION_EXPIRED =
  "Phiên đăng ký đã hết hạn hoặc đã thay đổi. Hãy đăng ký lại.";
const RELOAD_AND_RETRY =
  "Không gửi được yêu cầu. Hãy tải lại trang rồi thử lại.";
const SOON = "Hãy thử lại sau ít giây.";

/** Messages by the backend's error code. A code that is not here gets the sentence for its HTTP status. */
export const MESSAGES: Record<string, string> = {
  // Shared
  "SYS-001": "Hệ thống đang gặp sự cố. Hãy thử lại sau.",
  "SYS-002": `Hệ thống đang xử lý một yêu cầu khác của bạn. ${SOON}`,
  "VAL-001": "Thông tin chưa hợp lệ. Hãy kiểm tra lại rồi thử lại.",

  // Sign in, register, sessions
  "AUTH-000": "Yêu cầu chưa hợp lệ, hãy kiểm tra lại.",
  "AUTH-001": "Email hoặc mật khẩu chưa đúng.",
  "AUTH-002": "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.",
  "AUTH-003": "Phiên đăng nhập không còn hiệu lực, hãy đăng nhập lại.",
  "AUTH-004": "Bạn cần đăng nhập để tiếp tục.",
  "AUTH-005": "Bạn không có quyền thực hiện việc này.",
  "AUTH-006": "Bạn thao tác quá nhanh. Hãy thử lại sau ít phút.",
  "AUTH-007": "Không tìm thấy thiết bị đăng nhập này.",
  "AUTH-008": "Mã chưa đúng hoặc đã hết hạn.",
  "AUTH-009": REGISTRATION_EXPIRED,
  "AUTH-010": "Mật khẩu này quá dễ đoán, hãy chọn mật khẩu khác.",
  "AUTH-011": REGISTRATION_EXPIRED,
  "AUTH-012": "Mật khẩu hiện tại chưa đúng.",
  "AUTH-013": "Mật khẩu vừa được thay đổi ở nơi khác. Hãy thử lại.",
  "AUTH-014": "Không đăng nhập được bằng Google. Hãy thử lại.",
  "AUTH-015": "Email của tài khoản Google này chưa được xác minh.",
  "AUTH-016": "Tài khoản này đã liên kết với một tài khoản Google khác.",
  "AUTH-017": "Đây là cách đăng nhập duy nhất của tài khoản nên không thể gỡ.",
  "AUTH-018": "Đăng nhập bằng Google hiện chưa dùng được.",
  "AUTH-019": "Chưa có tài khoản Google nào được liên kết.",
  "AUTH-020": "Tài khoản này đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.",

  // Account, addresses, locations
  "USR-000": "Thông tin tài khoản chưa hợp lệ.",
  "USR-001": "Không tìm thấy tài khoản này.",
  "USR-002": "Email này đã có tài khoản. Hãy đăng nhập.",
  "USR-003": "Ảnh đại diện phải là ảnh JPEG, PNG hoặc WebP và không quá 2 MB.",
  "USR-006": "Tên hiển thị phải từ 1 đến 100 ký tự.",
  "ADDR-000": "Địa chỉ chưa hợp lệ.",
  "ADDR-001": "Không tìm thấy địa chỉ này.",
  "ADDR-002": "Bạn chỉ lưu được tối đa 10 địa chỉ. Hãy xóa bớt một địa chỉ cũ.",
  "ADDR-003": "Địa chỉ chưa hợp lệ. Hãy kiểm tra lại tỉnh, phường và số nhà.",
  "LOC-001": "Không tìm thấy tỉnh hoặc thành phố này.",
  "LOC-002": "Không tìm thấy phường hoặc xã này.",

  // Catalog (the codes a customer can meet)
  "CAT-010": "Không tìm thấy sản phẩm này.",
  "CAT-017":
    "Không tìm được với tổ hợp bộ lọc này. Hãy bớt bộ lọc hoặc đổi cách tìm.",
  "CAT-018": "Giá gốc phải lớn hơn giá bán.",

  // Cart
  "CART-000": "Giỏ hàng chưa xử lý được yêu cầu này.",
  "CART-001": "Giỏ hàng chỉ chứa được tối đa 50 sản phẩm khác nhau.",
  "CART-002": "Mỗi sản phẩm chỉ mua được tối đa 99 cái.",
  "CART-003": "Sản phẩm này hiện không còn bán.",
  "CART-004": "Sản phẩm này không còn trong giỏ hàng.",
  "CART-005": "Giỏ hàng tạm thời chưa dùng được. Hãy thử lại sau.",

  // Orders
  "ORD-000": "Đơn hàng chưa xử lý được yêu cầu này.",
  "ORD-001": STOCK,
  "ORD-002": "Không tìm thấy đơn hàng này.",
  "ORD-003": "Giỏ hàng của bạn đang trống.",
  "ORD-004":
    "Một số sản phẩm trong giỏ không còn bán. Hãy bỏ chúng khỏi giỏ rồi đặt lại.",
  "ORD-005": RELOAD_AND_RETRY,
  "ORD-006":
    "Không thực hiện được việc này với đơn hàng ở trạng thái hiện tại.",

  // Payments
  "PAY-000": "Thanh toán chưa xử lý được yêu cầu này.",
  "PAY-001": RELOAD_AND_RETRY,
  "PAY-002": "Đơn hàng này thanh toán khi nhận hàng, không cần trả trước.",
  "PAY-003":
    "Đơn hàng này hiện chưa thanh toán được: đơn không còn chờ thanh toán hoặc đang có một giao dịch khác.",
  "PAY-004": "Đơn hàng này đã dùng hết số lần thanh toán. Hãy đặt đơn mới.",
  "PAY-005": "Đã hết thời gian thanh toán cho đơn này. Hãy đặt đơn mới.",
  "PAY-006": "Cổng thanh toán đang tạm gián đoạn. Hãy thử lại sau ít phút.",

  // Stock
  "INV-001": STOCK,
  "INV-002": "Yêu cầu giữ hàng chưa hợp lệ. Hãy thử lại.",
  "INV-003": "Đơn hàng này chưa được giữ hàng.",
  "INV-004": `Đơn hàng đang được xử lý. ${SOON}`,
  "INV-005": "Hàng giữ cho đơn này đã thay đổi. Hãy đặt đơn mới.",
  "INV-006": "Hàng giữ cho đơn này đã được trả lại. Hãy đặt đơn mới.",
  "INV-007": "Kho hàng tạm thời chưa dùng được. Hãy thử lại sau.",
  "INV-008": "Không thực hiện được việc này với đơn hàng hiện tại.",
  "INV-009": "Không thể gia hạn thời gian giữ hàng cho đơn này.",

  // Vouchers (the sentences of VOU-002 and VOU-003 are made sharper by `errors.reason`, below)
  "VOU-000": "Mã giảm giá chưa xử lý được yêu cầu này.",
  "VOU-001": "Không tìm thấy mã giảm giá này. Hãy kiểm tra lại mã.",
  "VOU-002": "Mã giảm giá này chưa dùng được hoặc đã hết hạn.",
  "VOU-003": "Mã giảm giá này chưa áp dụng được cho giỏ hàng của bạn.",
  "VOU-004": "Mã giảm giá này đã hết lượt dùng.",
  "VOU-005": "Bạn đã dùng hết số lượt của mã giảm giá này.",
  "VOU-006":
    "Đơn này đã dùng một mã giảm giá khác. Hãy tải lại trang rồi thử lại.",
  "VOU-007": `Mã giảm giá tạm thời chưa dùng được. ${SOON}`,
};

/** Why a voucher cannot be used now (VOU-002), as `errors.reason` says. */
const VOUCHER_NOT_ACTIVE_REASONS: Record<string, string> = {
  DISABLED: "Mã giảm giá này không còn áp dụng.",
  NOT_STARTED: "Mã giảm giá này chưa tới thời gian áp dụng.",
  ENDED: "Mã giảm giá này đã hết hạn.",
};

/** Why a voucher does not fit the cart (VOU-003), as `errors.reason` says. */
function voucherNotApplicableReason(errors: unknown): string | undefined {
  const { reason, minOrderValue } = (errors ?? {}) as {
    reason?: unknown;
    minOrderValue?: unknown;
  };
  if (reason === "NO_DISCOUNT") {
    return "Mã này chưa giảm được cho giỏ hàng của bạn.";
  }
  if (reason !== "BELOW_MINIMUM") return undefined;
  return typeof minOrderValue === "number" && minOrderValue > 0
    ? `Đơn hàng cần từ ${new Intl.NumberFormat("vi-VN").format(minOrderValue)} ₫ để dùng mã này.`
    : "Đơn hàng chưa đủ giá trị tối thiểu để dùng mã này.";
}

/** Why the backend refused a password (AUTH-010), as `errors.reason` says. */
const WEAK_PASSWORD_REASONS: Record<string, string> = {
  COMMON: "Mật khẩu này quá phổ biến, hãy chọn mật khẩu khác.",
  REPEATED_OR_SEQUENTIAL:
    "Mật khẩu không được là chuỗi lặp hoặc dãy liên tiếp.",
  CONTAINS_EMAIL: "Mật khẩu không được chứa email của bạn.",
  CONTAINS_APP_NAME: "Mật khẩu không được chứa tên cửa hàng.",
};

const NETWORK = "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
const BAD_RESPONSE = "Hệ thống trả về dữ liệu không đọc được. Hãy thử lại sau.";

/** The sentence for a status when the code has none of its own. */
function byStatus(status: number): string {
  if (status >= 500) return "Hệ thống đang bận, hãy thử lại sau.";
  switch (status) {
    case 400:
      return "Yêu cầu chưa hợp lệ, hãy kiểm tra lại.";
    case 401:
      return "Bạn cần đăng nhập để tiếp tục.";
    case 403:
      return "Bạn không có quyền thực hiện việc này.";
    case 404:
      return "Không tìm thấy nội dung bạn cần.";
    case 409:
      return "Thao tác bị xung đột, hãy thử lại.";
    default:
      return "Chưa thực hiện được yêu cầu này. Hãy thử lại.";
  }
}

function tooFast(retryAfterSeconds?: number): string {
  if (!retryAfterSeconds || retryAfterSeconds <= 0)
    return "Bạn thao tác quá nhanh. Hãy thử lại sau ít phút.";
  if (retryAfterSeconds < 60)
    return `Bạn thao tác quá nhanh. Thử lại sau ${Math.ceil(retryAfterSeconds)} giây.`;
  return `Bạn thao tác quá nhanh. Thử lại sau ${Math.ceil(retryAfterSeconds / 60)} phút.`;
}

function weakPasswordReason(errors: unknown): string | undefined {
  const reason = (errors as { reason?: unknown } | null | undefined)?.reason;
  return typeof reason === "string" ? WEAK_PASSWORD_REASONS[reason] : undefined;
}

/** A sentence that says more than the code's own one, when `errors.reason` allows it. */
function sharperSentence(error: ErrorInfo): string | undefined {
  switch (error.code) {
    case "AUTH-010":
      return weakPasswordReason(error.errors);
    case "VOU-002": {
      const reason = (error.errors as { reason?: unknown } | null | undefined)
        ?.reason;
      return typeof reason === "string"
        ? VOUCHER_NOT_ACTIVE_REASONS[reason]
        : undefined;
    }
    case "VOU-003":
      return voucherNotApplicableReason(error.errors);
    default:
      return undefined;
  }
}

/** The sentence a customer reads for a failed call. Pure: the same error always gives the same words. */
export function userMessageFor(error: ErrorInfo): string {
  if (error.code === "NETWORK") return NETWORK;
  if (error.code === "BAD_RESPONSE") return BAD_RESPONSE;
  if (error.status === 429) return tooFast(error.retryAfterSeconds);

  const known = sharperSentence(error) ?? MESSAGES[error.code];
  const message = known ?? byStatus(error.status);

  // A reference the customer can read out to support, only when the fault is ours or unknown
  const unknownOrServerFault = known === undefined || error.status >= 500;
  return unknownOrServerFault && error.traceId
    ? `${message} Mã tham chiếu: ${error.traceId}`
    : message;
}
