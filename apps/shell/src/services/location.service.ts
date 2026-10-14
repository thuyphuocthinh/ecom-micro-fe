import { api } from "@ecom/api";

export const locationService = {
  getProvinces() {
    return api.get("/locations/provinces");
  },

  getWards(provinceCode: string) {
    return api.get("/locations/provinces/{code}/wards", {
      params: { code: provinceCode },
    });
  },
};
