import React from "react";
import Image from "next/legacy/image";
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
  const src = theme === "dark" ? "/thread.svg" : "/thread-light.svg";
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
