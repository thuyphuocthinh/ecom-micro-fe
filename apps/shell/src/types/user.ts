export type UserRole = "CUSTOMER" | "ADMIN";

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
}

export interface UserLike {
  displayName?: string | null;
  email?: string | null;
}
