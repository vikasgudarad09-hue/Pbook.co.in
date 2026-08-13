import { useState, useEffect, useRef, MouseEvent } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLImageElement>) => void;
  fallbackType?: 'user' | 'image';
  eager?: boolean;
}

export function LazyImage({ 
  src, 
  alt = "", 
  className = "", 
  onClick, 
  fallbackType = 'user',
  eager = true
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);

    if (imgRef.current) {
      if (imgRef.current.complete) {
        if (imgRef.current.naturalWidth > 0) {
          setIsLoaded(true);
        } else if (imgRef.current.naturalWidth === 0 && src) {
          // If complete but naturalWidth is 0, it failed to load
          setIsError(true);
        }
      }
    }
  }, [src]);

  if (!src || isError) {
    return (
      <div 
        className={`bg-zinc-100 border border-zinc-200/80 rounded-xl flex items-center justify-center text-zinc-400 select-none ${className}`}
        title={alt || "Image preview"}
      >
        {fallbackType === 'user' ? (
          <User className="w-1/2 h-1/2 max-w-[24px] max-h-[24px] opacity-60" />
        ) : (
          <ImageIcon className="w-1/2 h-1/2 max-w-[24px] max-h-[24px] opacity-60" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse z-10 rounded-[inherit] pointer-events-none" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        loading={eager ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        onLoad={() => {
          setIsLoaded(true);
          setIsError(false);
        }}
        onError={() => setIsError(true)}
        onClick={onClick}
      />
    </div>
  );
}


