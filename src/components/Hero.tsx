import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
// Import your video
import ferrariVideo from '../assets/ferraritributo.mp4'; // Adjust path as needed
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90 backdrop-blur-sm z-10"></div> */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/40 to-white/50  z-10"></div>
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src={ferrariVideo} type="video/mp4" />
          {/* Fallback content if video doesn't load */}
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Hero Content */}
      <div className="container relative z-20 text-center px-4">
        <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-tight text-black">
          <div className="overflow-hidden">
            <span className="block">Cinematic</span>
          </div>
          <div className="overflow-hidden">
            <span className="block">Storytelling</span>
          </div>
          <div className="overflow-hidden">
            <span className="block text-zinc-800">Redefined</span>
          </div>
        </h1>
        
        {/* <p >
         
        </p> */}
        {/* <HyperText  duration={1000} className="hero-subtitle text-xl md:text-2xl text-slate-900 mb-8 max-w-3xl mx-auto"> Award-winning video production trusted by global brands to create impactful visual stories that drive results.</HyperText> */}
        <div className="hero-subtitle text-xl md:text-2xl text-slate-900 mb-8 max-w-3xl mx-auto">Award-winning video production trusted by global brands to create impactful visual stories that drive results.</div>
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
        
        {/* Scroll Indicator */}
        {/* <div className="scroll-indicator mt-10 absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-black">
          <span className="text-sm uppercase tracking-widest mt-90">Scroll</span>
          <ChevronDown size={20} className="animate-bounce" />
        </div> */}
      </div>
    </section>
  );
};

export default Hero;