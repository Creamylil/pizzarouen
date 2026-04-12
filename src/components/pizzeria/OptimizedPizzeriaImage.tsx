'use client';

import { useState, useCallback } from 'react';
import { Pizza } from 'lucide-react';

interface OptimizedPizzeriaImageProps {
  imageUrl?: string;
  name: string;
  className?: string;
}

export default function OptimizedPizzeriaImage({
  imageUrl,
  name,
  className = "w-full h-48 object-cover"
}: OptimizedPizzeriaImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = useCallback(() => setImageError(true), []);
  const handleImageLoad = useCallback(() => setImageLoaded(true), []);

  if (!imageUrl || imageError) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <div className="text-center p-4">
          <Pizza className="h-10 w-10 text-muted-foreground mx-auto mb-1" />
          <p className="text-muted-foreground text-xs font-medium">{name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={imageUrl}
        alt={`Photo de ${name}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
