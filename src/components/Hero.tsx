import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/utils/gsap-config';
import { ChevronDown } from 'lucide-react';
import { TypingAnimation } from './magicui/typing-animation';
import { HyperText } from './magicui/hyper-text';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  useEffect(() => {
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
          scrollTrigger: {
            trigger: '.hero-title',
            start: 'top 80%',
          }
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
          scrollTrigger: {
            trigger: '.hero-subtitle',
            start: 'top 75%',
          }
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
          scrollTrigger: {
            trigger: '.hero-cta',
            start: 'top 75%',
          }
        }
      );
      
      // Scroll indicator animation
      gsap.fromTo(
        '.scroll-indicator',
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1,
          yoyo: true,
          repeat: -1,
          repeatDelay: 1,
          scrollTrigger: {
            trigger: '.scroll-indicator',
            start: 'top 90%',
          }
        }
      );
    }, heroRef);
    
    return () => {
      ctx.revert();
    };
  }, []);

  // Handle video load
  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

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
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="video-container">
          {/* Invisible overlay to prevent interactions with the video */}
          <div 
            className="absolute inset-0 z-10" 
            onClick={preventClickInteraction}
          ></div>
          
          <video
            ref={videoRef}
            className="video-background"
            src="https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/VIDEO/WEB%20SITE_4_prob3.mp4?updatedAt=1750266352530"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            onError={(e) => {
              console.error('Video failed to load:', e);
            }}
          />
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
            href="/contact" 
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

      <style jsx>{`
        .video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .video-background {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
          pointer-events: none;
        }
        
        /* Ensure full coverage on all devices */
        @media (max-width: 768px) {
          .video-background {
            /* For mobile devices, ensure the video covers the full screen */
            min-width: 100vw;
            min-height: 100vh;
            width: 100vw;
            height: 100vh;
          }
        }
        
        /* Handle very wide screens */
        @media (min-aspect-ratio: 16/9) {
          .video-background {
            width: 100%;
            height: auto;
          }
        }
        
        /* Handle very tall screens */
        @media (max-aspect-ratio: 16/9) {
          .video-background {
            width: auto;
            height: 100%;
          }
        }
        
        /* Specific adjustments for portrait mobile */
        @media (max-width: 767px) and (orientation: portrait) {
          .video-background {
            width: auto;
            height: 100vh;
            min-height: 100vh;
            min-width: calc(100vh * 16/9); /* Assume 16:9 aspect ratio */
          }
        }
        
        /* Specific adjustments for landscape mobile */
        @media (max-width: 767px) and (orientation: landscape) {
          .video-background {
            width: 100vw;
            height: auto;
            min-width: 100vw;
            min-height: calc(100vw * 9/16); /* Assume 16:9 aspect ratio */
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;