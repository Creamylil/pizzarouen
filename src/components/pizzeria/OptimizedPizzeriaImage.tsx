'use client';

import { useState, useCallback } from 'react';
import { Pizza } from 'lucide-react';
import { toWebP, generateSizes } from '@/utils/imageOptimization';

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
      <div className={`${className} bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center`}>
        <div className="text-center p-4">
          <Pizza className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 text-sm font-medium">{name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!imageLoaded && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center absolute inset-0`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      <img
        src={toWebP(imageUrl, 80)}
        alt={`Photo de ${name}`}
        className={`${className} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
        sizes={generateSizes()}
        style={{ aspectRatio: '380/270' }}
      />
    </div>
  );
}
