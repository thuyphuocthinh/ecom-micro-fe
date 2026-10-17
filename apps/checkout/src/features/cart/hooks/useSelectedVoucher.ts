import { useSyncExternalStore } from "react";

/** Where the chosen code is kept: only the text of the code, never an amount. */
export const SELECTED_VOUCHER_KEY = "ecom.checkout.voucherCode";

/** A code the server refused, and the sentence to show the customer for it. */
export interface VoucherRefusal {
  code: string;
  message: string;
}

interface SelectedVoucherState {
  code: string | null;
  refusal: VoucherRefusal | null;
}

// The state lives outside React so the cart page and the checkout page see the same code. The code is
// also kept in sessionStorage (it survives a reload and ends with the tab); where storage is blocked it
// stays in this variable. The refusal is only for the screen: it is never stored.
let state: SelectedVoucherState = { code: readStored(), refusal: null };
const listeners = new Set<() => void>();

function readStored(): string | null {
  try {
    return sessionStorage.getItem(SELECTED_VOUCHER_KEY);
  } catch {
    return null;
  }
}

function writeStored(code: string | null): void {
  try {
    if (code === null) sessionStorage.removeItem(SELECTED_VOUCHER_KEY);
    else sessionStorage.setItem(SELECTED_VOUCHER_KEY, code);
  } catch {
    // Blocked storage: the code then lives only in memory
  }
}

function publish(next: SelectedVoucherState): void {
  state = next;
  for (const listener of [...listeners]) listener();
}

/** Chooses a code (one at most: it replaces the old one) and forgets the last refusal. */
export function selectVoucher(code: string): void {
  const trimmed = code.trim();
  if (!trimmed) {
    clearVoucher();
    return;
  }
  writeStored(trimmed);
  publish({ code: trimmed, refusal: null });
}

/** Drops the chosen code, and the last refusal with it. */
export function clearVoucher(): void {
  writeStored(null);
  publish({ code: null, refusal: null });
}

/** The server refused this code: drops it, and keeps the sentence so the page can explain. */
export function rejectVoucher(refusal: VoucherRefusal): void {
  writeStored(null);
  publish({ code: null, refusal });
}

/** The code now, read straight from the store (outside React). */
export function getSelectedVoucher(): string | null {
  return state.code;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = (): SelectedVoucherState => state;

/** The code the customer chose (null when none), the last refusal, and the ways to change them. */
export function useSelectedVoucher() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    code: current.code,
    refusal: current.refusal,
    select: selectVoucher,
    clear: clearVoucher,
    reject: rejectVoucher,
  };
}

/** For tests: forget everything, including what storage still holds. */
export function resetSelectedVoucherForTests(): void {
  writeStored(null);
  state = { code: null, refusal: null };
  for (const listener of [...listeners]) listener();
}
