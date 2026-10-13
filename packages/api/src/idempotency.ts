/**
 * A new Idempotency-Key for one attempt (one "Place order" intent, one payment attempt). Keep the same
 * key for every retry of that attempt; make a new one only when the customer really starts again.
 * 36 characters from A-Z a-z 0-9 -, inside the backend's rule (8 to 100 of A-Z a-z 0-9 _ -).
 */
export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}
