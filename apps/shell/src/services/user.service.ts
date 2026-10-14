import { api } from "@ecom/api";
export type { UserProfile } from "@/types";

export const userService = {
  getMe(options?: { silent?: boolean }) {
    return api.get("/users/me", options);
  },

  updateProfile(data: { displayName: string }) {
    return api.patch("/users/me", { body: data });
  },

  uploadAvatar(file: Blob | File) {
    const formData = new FormData();
    formData.append("file", file);
    return api.put("/users/me/avatar", { body: formData });
  },

  removeAvatar() {
    return api.delete("/users/me/avatar");
  },
};
