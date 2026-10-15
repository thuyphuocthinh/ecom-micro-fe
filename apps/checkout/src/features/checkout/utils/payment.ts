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
