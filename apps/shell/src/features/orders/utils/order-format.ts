export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatOrderDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatOrderDateTime(
  isoString: string | null | undefined,
): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const date = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);
    const time = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);
    return `${date}, ${time}`;
  } catch {
    return isoString;
  }
}

export function formatOrderCode(id: string): string {
  if (!id) return "";
  // If id is UUID, take the first 8 characters and uppercase
  const clean = id.replace(/-/g, "");
  return clean.slice(0, 8).toUpperCase();
}

export function calculateMinutesLeft(
  expiresAt: string | null | undefined,
): number | null {
  if (!expiresAt) return null;
  try {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60));
  } catch {
    return null;
  }
}
