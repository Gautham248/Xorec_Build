import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Film, Camera, Video, Plane, ShoppingBag, Users, Clapperboard, Palette, Music, Code, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { TypingAnimation } from '@/components/magicui/typing-animation';

const services = [
  {
    icon: <Film size={32} />,
    title: 'Cinematic Campaigns',
    description: 'Emotionally engaging brand stories that captivate audiences and drive conversions through cinematic excellence.',
    features: ['4K/8K Resolution', 'Cinematic Color Grading', 'Professional Sound Design', 'Custom Music Scoring']
  },
  {
    icon: <Camera size={32} />,
    title: 'Automotive Storytelling',
    description: 'Dynamic automotive content that showcases performance, design, and innovation with stunning visuals.',
    features: ['Rolling Shoot', 'B-Roll Shoot', 'Interior Details', 'Track Day Coverage']
  },
  {
    icon: <Users size={32} />,
    title: 'Corporate Events',
    description: 'Professional coverage of corporate events, conferences, and internal communications with purpose driven production.',
    features: ['Multi-Camera Setup', 'Live Streaming & Spot Editing', 'Highlight Reels & Aftermovie', 'Interview Sessions & Tesrtimonials']
  },
  {
    icon: <Plane size={32} />,
    title: 'Aerial Cinematography',
    description: 'Breathtaking aerial perspectives that add scale and drama to your visual storytelling.',
    features: ['4K Drone Footage', 'FAA Licensed Pilots', 'Dynamic to High Speed FPV Drone', 'Location Scouting']
  },
  {
    icon: <ShoppingBag size={32} />,
    title: 'E-Commerce Films',
    description: 'Conversion-focused product videos that highlight features and benefits with stunning clarity.',
    features: ['360° Product Views', 'Lifestyle Integration', 'Feature Highlights', 'Social Media Cuts']
  },
  {
    icon: <Video size={32} />,
    title: 'Post-Production',
    description: 'Expert color grading, sound design, and visual effects to elevate your content to the highest standard.',
    features: ['Color Grading', 'Sound Design', 'Motion Graphics', 'VFX Integration']
  },
  {
    icon: <Clapperboard size={32} />,
    title: 'Commercial Production',
    description: 'Full-scale commercial production services from concept to delivery for television and digital platforms.',
    features: ['Script Development', 'Location Scouting', 'Talent Casting', 'Full Crew Production']
  },
  {
    icon: <Palette size={32} />,
    title: 'Creative Direction',
    description: 'Strategic creative direction to ensure your video content aligns with your brand and marketing objectives.',
    features: ['Brand Integration', 'Style Guides', 'Concept Development', 'Visual Strategy']
  },
  {
    icon: <Music size={32} />,
    title: 'Audio Production',
    description: 'Professional audio services including original music composition, sound design, and voice-over production.',
    features: ['Original Scoring', 'Voice-Over', 'Sound Effects', 'Audio Mixing']
  },
  {
    icon: <Code size={32} />,
    title: 'Interactive Content',
    description: 'Innovative interactive video experiences that engage viewers and provide immersive storytelling opportunities.',
    features: ['360° Videos', 'Interactive Elements', 'AR Integration', 'Custom Players']
  },
  {
    icon: <Globe size={32} />,
    title: 'Global Production',
    description: 'Worldwide production capabilities with local crews and expertise in major markets.',
    features: ['International Crews', 'Local Expertise', 'Cultural Adaptation', 'Global Coordination','Corporate Films']
  },
  {
    icon: <Award size={32} />,
    title: 'Consulting',
    description: 'Expert consultation on video strategy, production planning, and content distribution.',
    features: ['Strategy Development', 'Budget Planning', 'Distribution Plans', 'ROI Analysis','Product Launches']
  }
];

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  
  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    // Only apply GSAP animations on desktop
    if (isMobile) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.services-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.services-title',
            start: 'top 80%',
          }
        }
      );
      
      gsap.fromTo(
        '.service-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div className="pt-20" ref={sectionRef}>
      <section className="relative bg-white py-24 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="text-center mb-16">
            <h1 className="services-title text-5xl md:text-6xl font-bold mb-6">
              <div className="overflow-hidden">
                <span>Our Premium</span><span className="text-accent"> Services</span>
              </div>
            </h1>
            <div className="text-xl text-gray-700 max-w-3xl mx-auto">
              From concept to delivery, we offer comprehensive video production services 
              that help brands tell their stories and achieve their marketing objectives.
            </div>
          </div>

          <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`service-card bg-zinc-100 p-8 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all duration-300 hover:shadow-lg group ${
                  isMobile ? "opacity-100" : ""
                }`}
              >
                {!isMobile ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="h-full"
                  >
                    <div className="text-accent mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black">{service.title}</h3>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  // Simple non-animated content for mobile
                  <>
                    <div className="text-accent mb-4">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black">{service.title}</h3>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a 
              href="/contact" 
              className="btn bg-accent text-white"
            >
              Start Your Project
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Services;