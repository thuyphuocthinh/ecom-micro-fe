import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService, type UserProfile } from "@/services/user.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: Blob | File) => userService.uploadAvatar(file),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.setQueryData<UserProfile>(
          queryKeys.user.me(),
          result.data as unknown as UserProfile,
        );
      }
      toast.success("Cập nhật ảnh đại diện thành công");
    },
  });
}
