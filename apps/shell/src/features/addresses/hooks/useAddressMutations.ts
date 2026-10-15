import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressService } from "@/services/address.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { CreateAddressPayload, UpdateAddressPayload } from "@/types";

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      addressService.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.addresses(),
      });
      toast.success("Thêm địa chỉ thành công");
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAddressPayload;
    }) => addressService.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.addresses(),
      });
      toast.success("Cập nhật địa chỉ thành công");
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.addresses(),
      });
      toast.success("Đã xóa địa chỉ");
    },
  });
}

export function useSetDefaultAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.addresses(),
      });
      toast.success("Đã đặt làm địa chỉ mặc định");
    },
  });
}
