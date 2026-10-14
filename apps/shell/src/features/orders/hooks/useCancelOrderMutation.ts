import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys.ts";
import { orderService } from "@/services/order.service.ts";

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.cancelOrder(id),
    onSuccess: () => {
      toast.success(
        "Đã huỷ đơn thành công. Hàng được trả về kho và tiền sẽ hoàn lại.",
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
  });
}
