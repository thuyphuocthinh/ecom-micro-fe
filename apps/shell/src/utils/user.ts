export interface UserLike {
  displayName?: string | null;
  email?: string | null;
}

/**
 * Returns a friendly display name for the user.
 * Priority: displayName > email prefix > "Tài khoản"
 */
export function getUserDisplayName(user: UserLike | null | undefined): string {
  if (!user) return "Tài khoản";
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }
  if (user.email && user.email.includes("@")) {
    return user.email.split("@")[0] || "Tài khoản";
  }
  return "Tài khoản";
}

/**
 * Extracts avatar initial following Vietnamese name conventions:
 * In Vietnamese, the given name is the last word (e.g. "Nguyễn Văn An" -> "A").
 * Returns "U" if user is null or missing info.
 */
export function getUserInitial(user: UserLike | null | undefined): string {
  if (!user || (!user.displayName?.trim() && !user.email?.trim())) {
    return "U";
  }
  const name = getUserDisplayName(user);
  const words = name.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  const char = lastWord?.charAt(0) || name.charAt(0) || "U";
  return char.toUpperCase();
}
