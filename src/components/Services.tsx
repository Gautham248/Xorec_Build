import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/utils/gsap-config';
import { Film, Camera, Video, Plane, ShoppingBag, Users } from 'lucide-react';
import { BorderBeam } from './magicui/border-beam';
import { MagicCard } from './magicui/magic-card';
const services = [
  {
    icon: <Film size={32} />,
    title: 'Cinematic Campaigns',
    description: 'Emotionally engaging brand stories that captivate audiences and drive conversions through cinematic excellence.'
  },
  {
    icon: <Camera size={32} />,
    title: 'Automotive Storytelling',
    description: 'Dynamic automotive content that showcases performance, design, and innovation with stunning visuals.'
  },
  {
    icon: <Users size={32} />,
    title: 'Corporate Events',
    description: 'Professional coverage of corporate events, conferences, and internal communications with polished production.'
  },
  {
    icon: <Plane size={32} />,
    title: 'Aerial Cinematography',
    description: 'Breathtaking aerial perspectives that add scale and drama to your visual storytelling.'
  },
  {
    icon: <ShoppingBag size={32} />,
    title: 'E-Commerce Films',
    description: 'Conversion-focused product videos that highlight features and benefits with stunning clarity.'
  },
  {
    icon: <Video size={32} />,
    title: 'Post-Production',
    description: 'Expert editing, color grading, sound design, and visual effects to elevate your content to the highest standard.'
  }
];

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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
      
      // Service cards animation
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
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-24 bg-grey-600">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="services-title section-title text-black">
            <div className="overflow-hidden">
              <span >Our Premium</span>       <span className="text-accent"> Services</span>
            </div>
            
          </h2>
          <p className="section-subtitle mx-auto text-gray-700">
            We deliver exceptional video content that meets your strategic objectives and exceeds creative expectations.
          </p>
        </div>
        
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {services.map((service, index) => (
                 


            <div 
              key={index} 
              className="service-card bg-zinc-100 p-8 rounded-lg border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all duration-300 hover:shadow-lg"
            >
              {/* <div className="text-accent mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-black">{service.title}</h3> */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-accent mr-4">
                    {service.icon}
                  </div>
                  <span className="text-xl font-bold  text-black">{service.title}</span>
                </div>
              <p className="text-gray-700">{service.description}</p>
              {/* <BorderBeam duration={5} size={150} /> */}
            </div>
            
          ))}
          
        </div>
      </div>
    </section>
  );
};

export default Services;