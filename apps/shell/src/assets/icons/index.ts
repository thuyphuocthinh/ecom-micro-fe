import { GoogleIcon } from "./google.tsx";
import { SearchIcon } from "./search.tsx";
import { CartIcon } from "./cart.tsx";
import { OrdersIcon } from "./orders.tsx";
import { UserIcon } from "./user.tsx";

export const icons = {
  google: GoogleIcon,
  search: SearchIcon,
  cart: CartIcon,
  orders: OrdersIcon,
  user: UserIcon,
} as const;

export type IconName = keyof typeof icons;

export { GoogleIcon, SearchIcon, CartIcon, OrdersIcon, UserIcon };
