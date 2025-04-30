import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/utils/gsap-config';
import { MessageSquare, FileText, Video, Film, Award, CheckCircle } from 'lucide-react';
import { BorderBeam } from './magicui/border-beam';

const steps = [
  {
    icon: <MessageSquare size={32} />,
    title: "Discovery",
    description: "We begin with a thorough consultation to understand your brand, objectives, and target audience."
  },
  {
    icon: <FileText size={32} />,
    title: "Creative Strategy",
    description: "Our team develops a comprehensive creative strategy and detailed production plan."
  },
  {
    icon: <Video size={32} />,
    title: "Production",
    description: "Using state-of-the-art equipment and techniques, we capture stunning visuals that tell your story."
  },
  {
    icon: <Film size={32} />,
    title: "Post-Production",
    description: "Expert editing, color grading, sound design, and visual effects bring your vision to life."
  },
  {
    icon: <CheckCircle size={32} />,
    title: "Delivery",
    description: "Final content is delivered on time in multiple formats optimized for various platforms and uses."
  },
  {
    icon: <Award size={32} />,
    title: "Results",
    description: "We measure success through analytics and audience engagement to ensure ROI."
  }
];

const Process: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.process-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.process-title',
            start: 'top 80%',
          }
        }
      );
      
      // Process steps animation
      gsap.fromTo(
        '.process-step',
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.process-steps',
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="process-title section-title text-black">
            <div className="overflow-hidden">
              <span >Our Creative</span> <span className="text-accent"> Process</span>
            </div>
         
          </h2>
          <p className="section-subtitle mx-auto text-gray-700">
            A streamlined approach to delivering exceptional video content that meets your objectives.
          </p>
        </div>
        
        <div className="process-steps max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="process-step bg-zinc-100 p-8 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-accent mr-4">
                    {step.icon}
                  </div>
                  <span className="text-xl font-bold  text-black">{step.title}</span>
                </div>
                {/* <h3 className="text-xl font-bold mb-3 text-black">{step.title}</h3> */}
                <p className="text-gray-700">{step.description}</p>
                {/* <BorderBeam duration={5} size={150} /> */}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a href="#contact" className="btn bg-accent text-white">
            Start Your Project
          </a>
        </div>
      </div>
    </section>
  );
};

export default Process;