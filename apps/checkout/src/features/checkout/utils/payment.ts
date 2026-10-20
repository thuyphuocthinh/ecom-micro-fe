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
