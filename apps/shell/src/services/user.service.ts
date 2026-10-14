import { api } from "@ecom/api";

export interface UserProfile {
  id: string;
  role: "CUSTOMER" | "ADMIN";
  displayName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
}

export const userService = {
  getMe(options?: { silent?: boolean }) {
    return api.get("/users/me", options);
  },
};
