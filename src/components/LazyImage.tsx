import { useState, useRef, useEffect } from 'react';

export function LazyImage({ src, alt, className = "" }: { src: string; alt?: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
