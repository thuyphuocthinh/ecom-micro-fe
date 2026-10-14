import { api } from "@ecom/api";
export type { UserProfile } from "@/types";

export const userService = {
  getMe(options?: { silent?: boolean }) {
    return api.get("/users/me", options);
  },
};
