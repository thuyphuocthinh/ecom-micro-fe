/** Joins class names, skipping the empty ones: cx("a", cond && "b", undefined) gives "a" or "a b". */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
