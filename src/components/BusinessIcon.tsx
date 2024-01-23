import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface BusinessIconProps {
  width: number;
  height: number;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const BusinessIcon: React.FC<BusinessIconProps> = ({
  width,
  height,
  alt,
  className,
  style,
}) => {
  const { theme } = useTheme();
  const src =
    process.env.NEXT_PUBLIC_COMPANY === "plz"
      ? theme === "dark"
        ? "/plz.png"
        : "/plz-light.png"
      : theme === "dark"
        ? "/thread.svg"
        : "/thread-light.svg";
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      style={style}
    />
  );
};

export default BusinessIcon;
