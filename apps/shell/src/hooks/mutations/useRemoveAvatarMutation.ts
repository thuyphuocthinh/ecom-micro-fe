import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService, type UserProfile } from "@/services/user.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.removeAvatar(),
    onSuccess: () => {
      queryClient.setQueryData<UserProfile | null>(
        queryKeys.user.me(),
        (prev) => (prev ? { ...prev, avatarUrl: null } : null),
      );
      toast.success("Đã xóa ảnh đại diện");
    },
  });
}
