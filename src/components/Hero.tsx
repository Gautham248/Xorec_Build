import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
// Import your video
// import ferrariVideo from '../assets/ferraritributo.mp4'; // Adjust path as needed
import xorec_showreel from '../assets/xorec_showreel.mp4'; // Adjust path as needed
import { TypingAnimation } from './magicui/typing-animation';
import { HyperText } from './magicui/hyper-text';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
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
    
    return () => ctx.revert();
  }, []);

  // Add an effect to ensure video loads and plays properly
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <section 
      id="home" 
      ref={heroRef} 
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Removed the gradient overlays to show video as is */}
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src={xorec_showreel} type="video/mp4" />
          {/* Fallback content if video doesn't load */}
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Hero Content */}
      <div className="container relative z-20 text-center px-4">
        <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
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
        
        <div className="hero-subtitle text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">Award-winning video production trusted by global brands to create impactful visual stories that drive results.</div>
        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#portfolio" 
            className="btn bg-accent text-white"
          >
            View Our Work
          </a>
          <a 
            href="#contact" 
            className="btn btn-secondary"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;