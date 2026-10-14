import { api } from "@ecom/api";
import type { CreateAddressPayload, UpdateAddressPayload } from "@/types";

export const addressService = {
  getAddresses() {
    return api.get("/users/me/addresses");
  },

  createAddress(payload: CreateAddressPayload) {
    return api.post("/users/me/addresses", {
      body: payload as unknown as never,
    });
  },

  updateAddress(id: string, payload: UpdateAddressPayload) {
    return api.patch("/users/me/addresses/{id}", {
      params: { id },
      body: payload as unknown as never,
    });
  },

  deleteAddress(id: string) {
    return api.delete("/users/me/addresses/{id}", {
      params: { id },
    });
  },

  setDefaultAddress(id: string) {
    return api.put("/users/me/addresses/{id}/default", {
      params: { id },
    });
  },
};
