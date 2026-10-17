import { api, type ApiResult } from "@ecom/api";
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/types";

export const addressService = {
  getAddresses(): Promise<ApiResult<Address[]>> {
    return api.get("/users/me/addresses") as Promise<ApiResult<Address[]>>;
  },

  createAddress(payload: CreateAddressPayload): Promise<ApiResult<Address>> {
    return api.post("/users/me/addresses", {
      body: payload,
    }) as Promise<ApiResult<Address>>;
  },

  updateAddress(
    id: string,
    payload: UpdateAddressPayload,
  ): Promise<ApiResult<Address>> {
    return api.patch("/users/me/addresses/{id}", {
      params: { id },
      body: payload,
    }) as Promise<ApiResult<Address>>;
  },

  deleteAddress(id: string): Promise<ApiResult<unknown>> {
    return api.delete("/users/me/addresses/{id}", {
      params: { id },
    });
  },

  setDefaultAddress(id: string): Promise<ApiResult<unknown>> {
    return api.put("/users/me/addresses/{id}/default", {
      params: { id },
    });
  },
};
