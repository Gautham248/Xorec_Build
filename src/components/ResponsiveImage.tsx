import React, { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate responsive image URLs with quality optimization
  const generateImageUrl = (width: number): string => {
    const baseUrl = new URL(src);
    const quality = width < 768 ? 75 : 85; // Lower quality for mobile devices
    
    // Add width and quality parameters
    baseUrl.searchParams.set('w', width.toString());
    baseUrl.searchParams.set('q', quality.toString());
    
    return baseUrl.toString();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
          Failed to load image
        </div>
      ) : (
        <img
          src={generateImageUrl(768)} // Default size
          srcSet={`
            ${generateImageUrl(320)} 320w,
            ${generateImageUrl(480)} 480w,
            ${generateImageUrl(768)} 768w,
            ${generateImageUrl(1024)} 1024w,
            ${generateImageUrl(1920)} 1920w
          `}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;