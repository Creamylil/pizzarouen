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

  const handleImageError = useCallback(() => setImageError(true), []);

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
    <img
      src={imageUrl}
      alt={`Photo de ${name}`}
      className={`${className} bg-muted`}
      onError={handleImageError}
      loading="lazy"
      decoding="async"
    />
  );
}
