import { GoogleIcon } from "./google.tsx";
import { SearchIcon } from "./search.tsx";
import { CartIcon } from "./cart.tsx";
import { OrdersIcon } from "./orders.tsx";
import { UserIcon } from "./user.tsx";
import { AddressesIcon } from "./addresses.tsx";
import { LogoutIcon } from "./logout.tsx";
import { LockIcon } from "./lock.tsx";
import { CheckIcon } from "./check.tsx";
import { DeviceIcon } from "./device.tsx";
import { CameraIcon } from "./camera.tsx";
import { PlusIcon } from "./plus.tsx";

export const icons = {
  google: GoogleIcon,
  search: SearchIcon,
  cart: CartIcon,
  orders: OrdersIcon,
  user: UserIcon,
  addresses: AddressesIcon,
  logout: LogoutIcon,
  lock: LockIcon,
  check: CheckIcon,
  device: DeviceIcon,
  camera: CameraIcon,
  plus: PlusIcon,
} as const;

export type IconName = keyof typeof icons;

export {
  GoogleIcon,
  SearchIcon,
  CartIcon,
  OrdersIcon,
  UserIcon,
  AddressesIcon,
  LogoutIcon,
  LockIcon,
  CheckIcon,
  DeviceIcon,
  CameraIcon,
  PlusIcon,
};
