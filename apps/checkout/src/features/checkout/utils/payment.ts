export function getPaymentState(orderStatus?: string, paymentStatus?: string) {
  const isSuccess =
    orderStatus === "CONFIRMED" || paymentStatus === "SUCCEEDED";
  const isFailed = paymentStatus === "FAILED";
  const isExpired = orderStatus === "EXPIRED" || paymentStatus === "EXPIRED";
  const isWaiting = !isSuccess && !isFailed && !isExpired;

  return {
    isSuccess,
    isFailed,
    isExpired,
    isWaiting,
  };
}

/**
 * The key of the "start payment" request for one attempt. It is the same every time for the same order
 * and attempt, so a request that is sent twice (the page opened again, drawn twice, a double click) is
 * recognised by the backend, which answers with the payment it already made instead of refusing.
 * A new attempt (after a failed payment) has a new number, so a new key.
 * Inside the backend's rule for keys: 8 to 100 of A-Z a-z 0-9 _ -.
 */
export function paymentIdempotencyKey(orderId: string, attempt: number) {
  return `pay-${orderId}-${attempt}`;
}

/**
 * The reference of a charge at the payment gateway, taken from where to pay: for the fake gateway the
 * address is `/dev/fake-gateway/charges/<providerRef>`. The API gives the address, not the reference.
 * Null when there is no address, or it has no path to take a reference from.
 */
export function providerRefFromPayUrl(payUrl?: string | null): string | null {
  if (!payUrl) return null;
  const path = payUrl
    .split(/[?#]/)[0]
    .replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, "");
  const last = path.split("/").filter(Boolean).at(-1);
  if (!last) return null;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}
