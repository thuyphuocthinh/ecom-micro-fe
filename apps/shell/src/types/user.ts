export type UserRole = "CUSTOMER" | "ADMIN";

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  createdAt?: string | Date;
  hasPassword?: boolean;
  googleLinked?: boolean;
}

export interface UserLike {
  displayName?: string | null;
  email?: string | null;
}
