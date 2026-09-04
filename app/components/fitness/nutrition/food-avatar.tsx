"use client";

import { useState, useEffect } from "react";
import { getFoodImage, getFoodSvgAvatar } from "@/lib/utils/food-images";

interface FoodAvatarProps {
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FoodAvatar({
  name,
  className = "w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0",
  style,
}: FoodAvatarProps) {
  const photoUrl = getFoodImage(name);
  const fallbackSvg = getFoodSvgAvatar(name);
  const [imgSrc, setImgSrc] = useState(photoUrl);

  useEffect(() => {
    setImgSrc(getFoodImage(name));
  }, [name]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={name || "Food"}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imgSrc !== fallbackSvg) {
          setImgSrc(fallbackSvg);
        }
      }}
      className={className}
      style={style}
    />
  );
}
