"use client";

import { useEffect, useRef, useState } from "react";
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
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  // Derive the source from current props so a day switch or swap never paints
  // the previous meal image while an effect catches up.
  const imgSrc = failedUrl === photoUrl ? fallbackSvg : photoUrl;

  // The browser can fail an SSR image before hydration attaches onError.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0 && imgSrc !== fallbackSvg) {
      setFailedUrl(photoUrl);
    }
  }, [photoUrl, imgSrc, fallbackSvg]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={photoUrl}
      ref={imageRef}
      src={imgSrc}
      alt={name || "Food"}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (photoUrl !== fallbackSvg) setFailedUrl(photoUrl);
      }}
      className={className}
      style={style}
    />
  );
}
