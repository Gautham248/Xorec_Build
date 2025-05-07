import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Xorec truly understands the balance between creativity and efficiency. They captured our brand's essence perfectly and delivered the final product well within the deadline. Their professionalism and dedication are unmatched.",
    author: "RAJESH BR",
    position: "Marketing Head, Lamborghini Bangalore",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "Xorec transformed our ideas into stunning content that perfectly reflect our brand’s essence. Their creativity, attention to detail, and timely delivery set them apart. They balanced innovation with efficiency and made the entire process seamless. I’d definitely recommend them for top-quality video production!",
    author: "HARI KRISHNAN",
    position: "Lead - CCSE, Air India Express",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
 
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const testimonialContentRef = useRef<HTMLDivElement>(null);
  
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  // Initial animation for the title (runs only once)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.testimonials-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.testimonials-title',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []); // Empty dependency array means this runs once on mount
  
  // Separate effect for testimonial content animation when testimonial changes
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Kill any existing animations on testimonial content
      gsap.killTweensOf('.testimonial-content');
      
      // Testimonial animation
      gsap.fromTo(
        '.testimonial-content',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        }
      );
    }, testimonialContentRef);
    
    return () => ctx.revert();
  }, [currentIndex]); // This effect runs when currentIndex changes

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="testimonials-title section-title text-black">
            <div className="overflow-hidden">
              <span >Client</span> <span className="text-accent">Testimonials</span>
            </div>
            
          </h2>
          <p className="section-subtitle mx-auto text-gray-700">
            Hear what our clients have to say about their experience working with Xorec.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto relative" ref={testimonialContentRef}>
          <div className="testimonial-content bg-white p-8 md:p-12 rounded-lg border border-gray-200 shadow-lg">
            {/* <div className="absolute top-8 left-8 text-red-600 opacity-20">
              <Quote size={64} />
            </div> */}
            
            <blockquote className="text-xl md:text-2xl italic mb-8 relative z-10 text-black">
              {testimonials[currentIndex].quote}
            </blockquote>
            
            <div className="flex items-center">
              {/* <img 
                src={testimonials[currentIndex].image} 
                alt={testimonials[currentIndex].author} 
                className="w-16 h-16 rounded-full object-cover mr-4"
              /> */}
              <div>
                <p className="font-bold text-lg text-black">{testimonials[currentIndex].author}</p>
                <p className="text-accent">{testimonials[currentIndex].position}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 gap-4">
            <button 
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-gray-100 hover:bg-zinc-600 hover:text-white transition-colors text-gray-700"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'bg-zinc-600 scale-125' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-gray-100 hover:bg-zinc-600 hover:text-white transition-colors text-gray-700"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;