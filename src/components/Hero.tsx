import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import { TypingAnimation } from './magicui/typing-animation';
import { HyperText } from './magicui/hyper-text';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  // State to control zoom level, with appropriate initial values
  const [zoomLevel, setZoomLevel] = useState(1.25); // Default zoom for desktop
  const [aspectRatio, setAspectRatio] = useState(window.innerWidth / window.innerHeight);
  
  useEffect(() => {
    // Function to update aspect ratio and set appropriate zoom level
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newAspectRatio = width / height;
      setAspectRatio(newAspectRatio);
      
      // Calculate appropriate zoom based on screen dimensions
      // Mobile portrait (tall) needs more zoom to fill the screen width
      if (width < 768) {
        if (newAspectRatio < 0.8) {
          // Very tall portrait mode - needs extra zoom
          setZoomLevel(2.5);
        } else if (newAspectRatio < 1) {
          // Standard portrait mode
          setZoomLevel(2);
        } else {
          // Landscape mobile (like in landscape orientation)
          setZoomLevel(1.5);
        }
      } else {
        // Desktop or tablet
        setZoomLevel(1.25);
      }
    };
    
    // Initial calculation
    updateDimensions();
    
    // Set up listener
    window.addEventListener('resize', updateDimensions);
    
    // Animation setup
    const ctx = gsap.context(() => {
      // Hero title animation
      gsap.fromTo(
        '.hero-title span',
        { y: '100%', opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.5, 
          stagger: 0.1, 
          ease: 'power4.out',
          delay: 0.5
        }
      );
      
      // Hero subtitle animation
      gsap.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          delay: 1.2 
        }
      );
      
      // CTA button animation
      gsap.fromTo(
        '.hero-cta',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          delay: 1.5 
        }
      );
      
      // Scroll indicator animation
      gsap.fromTo(
        '.scroll-indicator',
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1, 
          delay: 2,
          yoyo: true,
          repeat: -1,
          repeatDelay: 1
        }
      );
    }, heroRef);
    
    return () => {
      ctx.revert();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Prevent default on click for the entire section to disable video interactions
  const preventClickInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <section 
      id="home" 
      ref={heroRef} 
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* YouTube Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          ref={youtubeContainerRef}
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoomLevel})`, // Apply dynamic zoom based on device
            transformOrigin: 'center',
            transition: 'transform 0.3s ease-out' // Smooth transition when resizing
          }}
          onClick={preventClickInteraction}
        >
          {/* Invisible overlay to prevent interactions with the iframe */}
          <div 
            className="absolute inset-0 z-10" 
            onClick={preventClickInteraction}
          ></div>
          
          <iframe
            className="absolute w-full h-full pointer-events-none"
            src="https://www.youtube.com/embed/LM2L0iX11do?autoplay=1&mute=1&controls=0&loop=1&playlist=LM2L0iX11do&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&enablejsapi=1&playsinline=1&fs=0"
            title="Cinematic Video Background"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
          ></iframe>
        </div>
      </div>
      
      {/* Video Overlay - Added gradient overlay for better text visibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-black/30"></div>
      
      {/* Hero Content */}
      <div className="container relative z-20 text-center px-4">
        <h1 className="hero-title text-4xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white">
          <div className="overflow-hidden">
            <span className="block">Cinematic</span>
          </div>
          <div className="overflow-hidden">
            <span className="block">Storytelling</span>
          </div>
          <div className="overflow-hidden">
            <span className="block">Redefined</span>
          </div>
        </h1>
        
        <div className="hero-subtitle text-lg md:text-2xl text-white mb-6 md:mb-8 max-w-3xl mx-auto">Award-winning video production trusted by global brands to create impactful visual stories that drive results.</div>
        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#portfolio" 
            className="btn bg-accent text-white px-6 py-3 rounded font-medium"
          >
            View Our Work
          </a>
          <a 
            href="#contact" 
            className="btn btn-secondary px-6 py-3 rounded font-medium border border-white text-white"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce hidden md:block">
        <ChevronDown size={24} />
      </div>

      {/* Add a style tag to disable YouTube controls */}
      <style jsx>{`
        /* Hide YouTube iframe border and any YouTube UI elements */
        iframe {
          border: none !important;
        }
        
        /* Additional styles to prevent interaction */
        iframe:-webkit-full-screen {
          display: none !important;
        }
        
        @media (hover: hover) {
          iframe:hover {
            cursor: default !important;
          }
        }
        
        /* Improve YouTube video display on different screen sizes */
        @media (max-width: 767px) and (orientation: portrait) {
          iframe {
            width: 100vw;
            height: 100vh;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.35);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;