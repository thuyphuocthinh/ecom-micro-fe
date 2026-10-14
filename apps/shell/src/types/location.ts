export type LocationType =
  "CITY" | "PROVINCE" | "WARD" | "COMMUNE" | "TOWNSHIP";

export interface Province {
  code: string;
  name: string;
  fullName: string;
  type: "CITY" | "PROVINCE";
}

export interface Ward {
  code: string;
  name: string;
  fullName: string;
  type: "WARD" | "COMMUNE" | "TOWNSHIP";
}
