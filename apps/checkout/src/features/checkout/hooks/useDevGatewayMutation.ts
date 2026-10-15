import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { checkoutService } from "@/services";

export function useDevGatewayMutation(orderId?: string) {
  const queryClient = useQueryClient();

  const payMutation = useMutation({
    mutationFn: ({
      providerRef,
      amount,
    }: {
      providerRef: string;
      amount?: number;
    }) => checkoutService.simulateGatewayPay(providerRef, amount),
    onSuccess: () => {
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.checkout.order(orderId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.checkout.payments(orderId),
        });
      }
    },
  });

  const failMutation = useMutation({
    mutationFn: ({ providerRef }: { providerRef: string }) =>
      checkoutService.simulateGatewayFail(providerRef),
    onSuccess: () => {
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.checkout.order(orderId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.checkout.payments(orderId),
        });
      }
    },
  });

  return {
    simulatePay: payMutation.mutate,
    isPaying: payMutation.isPending,
    simulateFail: failMutation.mutate,
    isFailing: failMutation.isPending,
  };
}
