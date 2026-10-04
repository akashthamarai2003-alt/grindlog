"use client";

import { useState, useEffect, useRef } from "react";
import { getFoodImage, getFoodSvgAvatar } from "@/lib/utils/food-images";

interface FoodAvatarProps {
  name?: string;
  category?: string;
  imageUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FoodAvatar({
  name,
  category,
  imageUrl,
  className = "w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0",
  style,
}: FoodAvatarProps) {
  const photoUrl = getFoodImage(name, category, imageUrl);
  const fallbackSvg = getFoodSvgAvatar(name, category);
  const [imgSrc, setImgSrc] = useState(photoUrl);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImgSrc(getFoodImage(name, category, imageUrl));
  }, [name, category, imageUrl]);

  // A failed request can finish before hydration attaches React's onError.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0 && imgSrc !== fallbackSvg) {
      setImgSrc(fallbackSvg);
    }
  }, [imgSrc, fallbackSvg]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
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
