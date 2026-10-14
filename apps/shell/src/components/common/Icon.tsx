import type { ComponentProps } from "react";
import { icons, type IconName } from "@/assets/icons";

export type { IconName };

export interface IconProps extends ComponentProps<"svg"> {
  name: IconName;
  size?: number | string;
}

export function Icon({
  name,
  size = 20,
  className = "",
  style,
  ...props
}: IconProps) {
  const IconComponent = icons[name];
  if (!IconComponent) return null;

  return (
    <IconComponent
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}
