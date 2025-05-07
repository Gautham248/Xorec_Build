import React, { useState } from 'react';

interface ProjectImageProps {
  src: string;
  alt: string;
}

const ProjectImage: React.FC<ProjectImageProps> = ({ src, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="relative w-full h-80">
      <img 
        src={`${src}?tr=w-300`}
        // src={src} 
        alt={alt}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default ProjectImage;