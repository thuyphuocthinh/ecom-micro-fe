import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { ApiError, createIdempotencyKey } from "@ecom/api";
import { Spinner, Button, Icon } from "@ecom/ui";
import { useCartQuery } from "@/features/cart/hooks/useCartQuery.ts";
import {
  isVoucherRefusal,
  useSelectedVoucher,
  useVoucherPreviewQuery,
} from "@/features/cart/hooks";
import {
  useUserAddressesQuery,
  useCreateAddressMutation,
  useProvincesQuery,
  useWardsQuery,
  usePlaceOrderMutation,
} from "@/features/checkout/hooks";
import {
  CheckoutStepper,
  ShippingAddressSelector,
  PaymentMethodSelector,
  CheckoutSummaryAside,
  type NewAddressFormData,
} from "@/features/checkout/components";
import type { PaymentMethod } from "@/types";

export function CheckoutPage() {
  const navigate = useNavigate();

  // Queries
  const { data: cart, isLoading: isLoadingCart, isGuest } = useCartQuery();
  const { data: addresses = [], isLoading: isLoadingAddresses } =
    useUserAddressesQuery();
  const { data: provinces = [] } = useProvincesQuery();

  // Form state
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    "new",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ONLINE");
  const [newAddressData, setNewAddressData] = useState<NewAddressFormData>({
    recipientName: "",
    phone: "",
    provinceCode: "",
    wardCode: "",
    street: "",
  });

  // Wards query for selected province
  const { data: wards = [], isLoading: isLoadingWards } = useWardsQuery(
    newAddressData.provinceCode,
  );

  // Mutations
  const createAddressMutation = useCreateAddressMutation();
  const placeOrderMutation = usePlaceOrderMutation();

  // The voucher chosen in the cart: the server says what it takes off; this page only shows it and
  // sends the code when the order is placed
  const isCartEmpty = !cart || cart.items.length === 0;
  const {
    code: chosenVoucher,
    clear: clearVoucher,
    reject: rejectVoucher,
  } = useSelectedVoucher();
  const voucher = useVoucherPreviewQuery(!isGuest && !isCartEmpty);

  // One attempt, one Idempotency-Key: pressing the button again after a temporary failure sends the
  // same key, so the order is made once. Anything the order depends on changing makes a new key.
  const attemptRef = useRef<{ signature: string; key: string } | null>(null);
  const keyForAttempt = (signature: string): string => {
    if (attemptRef.current?.signature !== signature) {
      attemptRef.current = { signature, key: createIdempotencyKey() };
    }
    return attemptRef.current.key;
  };

  // Initialize selected address once addresses load
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (addresses.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const defaultAddr = addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
    }
  }, [addresses]);

  const handleUpdateNewAddress = (patch: Partial<NewAddressFormData>) => {
    setNewAddressData((prev) => ({ ...prev, ...patch }));
  };

  const isNewAddressIncomplete =
    selectedAddressId === "new" &&
    !(
      newAddressData.recipientName.trim() &&
      newAddressData.phone.trim() &&
      newAddressData.provinceCode &&
      newAddressData.wardCode &&
      newAddressData.street.trim()
    );

  const handlePlaceOrder = async () => {
    if (isCartEmpty) {
      toast.error("Giỏ hàng của bạn đang trống.");
      return;
    }

    try {
      let finalAddressId = selectedAddressId;

      // If user selected to input a new address, create it first
      if (selectedAddressId === "new") {
        if (isNewAddressIncomplete) {
          toast.error("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
          return;
        }

        const created = await createAddressMutation.mutateAsync({
          recipientName: newAddressData.recipientName.trim(),
          phone: newAddressData.phone.trim(),
          wardCode: newAddressData.wardCode,
          street: newAddressData.street.trim(),
          label: "Địa chỉ mới",
        });
        finalAddressId = created.id;
      }

      // Submit order, with the voucher of the cart when there is one
      const voucherCode = !isGuest && chosenVoucher ? chosenVoucher : undefined;
      const signature = JSON.stringify({
        address: selectedAddressId,
        newAddress: selectedAddressId === "new" ? newAddressData : null,
        paymentMethod,
        voucherCode: voucherCode ?? null,
        cart: cart.items.map((item) => `${item.skuId}:${item.quantity}`),
      });
      const order = await placeOrderMutation.mutateAsync({
        payload: {
          addressId: finalAddressId,
          paymentMethod,
          ...(voucherCode ? { voucherCode } : {}),
        },
        idempotencyKey: keyForAttempt(signature),
      });

      // Placed: the next order is a new attempt, and its voucher is chosen again
      attemptRef.current = null;
      clearVoucher();
      toast.success("Đặt hàng thành công!");

      if (paymentMethod === "ONLINE") {
        navigate(`/checkout/payment?orderId=${order.id}`);
      } else {
        navigate(`/checkout/success?orderId=${order.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // The client has already told the customer (one toast for every failed call). A voucher the
        // server refused is dropped, so the next press does not send it again; a temporary failure
        // keeps it, and the key, so the next press is a retry of the same order.
        if (isVoucherRefusal(error) && chosenVoucher) {
          rejectVoucher({ code: chosenVoucher, message: error.userMessage });
        }
        return;
      }
      toast.error(
        error instanceof Error ? error.message : "Đặt hàng không thành công.",
      );
    }
  };

  if (isLoadingCart || isLoadingAddresses) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <CheckoutStepper currentStep={2} />
        <div className="flex-1 flex items-center justify-center p-12">
          <Spinner className="size-8 text-brand" />
        </div>
      </div>
    );
  }

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <CheckoutStepper currentStep={2} />
        <div className="max-w-[640px] mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-surface-sunken flex items-center justify-center text-muted">
            <Icon name="cart" size={32} />
          </div>
          <h1 className="font-head text-2xl font-bold text-ink">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-sm text-muted">
            Vui lòng thêm sản phẩm vào giỏ trước khi tiến hành đặt hàng.
          </p>
          <Link to="/cart">
            <Button variant="primary" size="md">
              Quay lại giỏ hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSubmitting =
    createAddressMutation.isPending || placeOrderMutation.isPending;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <CheckoutStepper currentStep={2} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-16 w-full">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink mb-7">
          Đặt hàng
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Main columns: Address & Payment */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
            <ShippingAddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              newAddressData={newAddressData}
              onChangeNewAddress={handleUpdateNewAddress}
              provinces={provinces}
              wards={wards}
              isLoadingWards={isLoadingWards}
            />

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>

          {/* Sticky Summary column */}
          <div className="w-full lg:w-[400px] flex-none">
            <CheckoutSummaryAside
              items={cart.items}
              subtotal={cart.subtotal}
              paymentMethod={paymentMethod}
              isSubmitting={isSubmitting}
              isDisabled={isNewAddressIncomplete}
              onPlaceOrder={handlePlaceOrder}
              voucher={{
                code: voucher.preview?.code ?? null,
                discountAmount: voucher.preview?.discountAmount ?? 0,
                total: voucher.preview?.total,
                isChecking: voucher.isFetching,
                message: voucher.errorMessage,
                refusedCode: voucher.refusedCode,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
