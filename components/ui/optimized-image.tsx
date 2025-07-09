'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy',
  onLoad,
  onError,
  fallback = '/placeholder.svg',
  aspectRatio = 'auto',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallback);
    onError?.();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      default:
        return '';
    }
  };

  const containerClasses = cn(
    'relative overflow-hidden',
    getAspectRatioClass(),
    className
  );

  const imageClasses = cn(
    'transition-opacity duration-300',
    isLoaded ? 'opacity-100' : 'opacity-0',
    hasError && 'opacity-50 grayscale'
  );

  if (fill) {
    return (
      <div className={containerClasses}>
        <Image
          src={currentSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        loading={loading}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

// Progressive image loading hook
export function useProgressiveImage(src: string, placeholder?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const img = document.createElement('img');
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setLoading(false);
    };
    img.src = src;
  }, [src]);

  return { src: currentSrc, loading, error };
}

// Lazy image component with intersection observer
export function LazyImage({
  src,
  alt,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: OptimizedImageProps & {
  threshold?: number;
  rootMargin?: string;
}) {
  const [isInView, setIsInView] = useState(false);
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!imgRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef, threshold, rootMargin]);

  return (
    <div ref={setImgRef} className={cn('relative', className)}>
      {isInView ? (
        <OptimizedImage
          src={src}
          alt={alt}
          className={className}
          {...props}
        />
      ) : (
        <div className="bg-muted animate-pulse w-full h-full" />
      )}
    </div>
  );
}

// Image with WebP/AVIF support detection
export function NextGenImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  const [supportedFormat, setSupportedFormat] = useState<string>('');

  useEffect(() => {
    const detectFormat = async () => {
      // Check AVIF support
      const avifSupported = await new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve(false);
          return;
        }
        const img = document.createElement('img');
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      });

      if (avifSupported) {
        setSupportedFormat('avif');
        return;
      }

      // Check WebP support
      const webpSupported = await new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve(false);
          return;
        }
        const img = document.createElement('img');
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });

      if (webpSupported) {
        setSupportedFormat('webp');
        return;
      }

      setSupportedFormat('jpg');
    };

    detectFormat();
  }, []);

  const optimizedSrc = supportedFormat
    ? src.replace(/\.(jpg|jpeg|png)$/i, `.${supportedFormat}`)
    : src;

  return (
    <OptimizedImage
      src={optimizedSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

// Responsive image component
export function ResponsiveImage({
  src,
  alt,
  className,
  breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },
  ...props
}: OptimizedImageProps & {
  breakpoints?: Record<string, number>;
}) {
  const generateSizes = () => {
    const sizeStrings = Object.entries(breakpoints)
      .sort(([, a], [, b]) => a - b)
      .map(([name, width], index, array) => {
        const isLast = index === array.length - 1;
        const viewportWidth = isLast ? '100vw' : `${width}px`;
        const imageWidth = isLast ? '100vw' : `${Math.floor(width * 0.9)}px`;
        
        return isLast
          ? imageWidth
          : `(max-width: ${viewportWidth}) ${imageWidth}`;
      });

    return sizeStrings.join(', ');
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      sizes={generateSizes()}
      {...props}
    />
  );
}