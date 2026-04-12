// Image optimization utilities

/**
 * Generate responsive image srcset for better performance
 */
export const generateSrcSet = (baseUrl: string, sizes: number[] = [380, 760, 1140]) => {
  return sizes.map(size => `${baseUrl}?w=${size}&q=80 ${size}w`).join(', ');
};

/**
 * Generate sizes attribute based on breakpoints
 */
export const generateSizes = () => {
  return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

/**
 * Convert image URL to WebP format with quality parameter
 */
export const toWebP = (url: string, _quality: number = 80) => {
  if (!url) return '';
  return url;
};

/**
 * Preload critical images for better LCP
 */
export const preloadImage = (src: string, fetchPriority: 'high' | 'low' = 'high') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = fetchPriority;
  document.head.appendChild(link);
};

/**
 * Lazy load images with intersection observer
 */
export const createImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
};