import { api } from "@ecom/api";
import type {
  Address,
  CreateAddressPayload,
  FakeGatewayResult,
  OrderResponse,
  PaymentResponse,
  PlaceOrderPayload,
  Province,
  Ward,
} from "@/types";

export const checkoutService = {
  async getAddresses(): Promise<Address[]> {
    const res = await api.get("/users/me/addresses");
    return (res.data ?? []) as Address[];
  },

  async createAddress(payload: CreateAddressPayload): Promise<Address> {
    const res = await api.post("/users/me/addresses", {
      body: payload,
    });
    return res.data as Address;
  },

  async getProvinces(): Promise<Province[]> {
    const res = await api.get("/locations/provinces");
    return (res.data ?? []) as Province[];
  },

  async getWards(provinceCode: string): Promise<Ward[]> {
    const res = await api.get("/locations/provinces/{code}/wards", {
      params: { code: provinceCode },
    });
    return (res.data ?? []) as Ward[];
  },

  async placeOrder(
    payload: PlaceOrderPayload,
    idempotencyKey?: string,
  ): Promise<OrderResponse> {
    const res = await api.post("/orders", {
      body: payload,
      idempotencyKey,
    });
    return res.data as OrderResponse;
  },

  async getOrder(id: string): Promise<OrderResponse> {
    const res = await api.get("/orders/{id}", {
      params: { id },
    });
    return res.data as OrderResponse;
  },

  async getOrderPayments(orderId: string): Promise<PaymentResponse[]> {
    const res = await api.get("/orders/{orderId}/payments", {
      params: { orderId },
    });
    return (res.data ?? []) as PaymentResponse[];
  },

  async startPayment(
    orderId: string,
    idempotencyKey?: string,
  ): Promise<PaymentResponse> {
    const res = await api.post("/orders/{orderId}/payments", {
      params: { orderId },
      idempotencyKey,
    });
    return res.data as PaymentResponse;
  },

  async simulateGatewayPay(
    providerRef: string,
    amount?: number,
  ): Promise<FakeGatewayResult> {
    const res = await api.post("/dev/fake-gateway/charges/{providerRef}/pay", {
      params: { providerRef },
      body: amount !== undefined ? { amount } : {},
    });
    return res.data as FakeGatewayResult;
  },

  async simulateGatewayFail(providerRef: string): Promise<FakeGatewayResult> {
    const res = await api.post("/dev/fake-gateway/charges/{providerRef}/fail", {
      params: { providerRef },
    });
    return res.data as FakeGatewayResult;
  },
};
