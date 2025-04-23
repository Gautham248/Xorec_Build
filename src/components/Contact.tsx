import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({
      name: '',
      email: '',
      company: '',
      service: '',
      message: ''
    });
  };
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.contact-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.contact-title',
            start: 'top 80%',
          }
        }
      );
      
      // Contact info animation
      gsap.fromTo(
        '.contact-info-item',
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 75%',
          }
        }
      );
      
      // Form animation
      gsap.fromTo(
        '.contact-form',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="contact-title section-title text-black">
            <div className="overflow-hidden">
              <span className="block">Let's Create</span>
            </div>
            <div className="overflow-hidden">
              <span className="block text-red-600">Together</span>
            </div>
          </h2>
          <p className="section-subtitle mx-auto text-gray-700">
            Ready to elevate your brand with cinematic storytelling? Get in touch with our team.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="contact-info space-y-8">
            <div className="contact-info-item flex items-start">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mr-4">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Email Us</h3>
                <p className="text-gray-700">info@xorec.com</p>
                <p className="text-gray-700">projects@xorec.com</p>
              </div>
            </div>
            
            <div className="contact-info-item flex items-start">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mr-4">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Call Us</h3>
                <p className="text-gray-700">+1 (555) 123-4567</p>
                <p className="text-gray-700">+44 20 1234 5678</p>
              </div>
            </div>
            
            <div className="contact-info-item flex items-start">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mr-4">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Visit Us</h3>
                <p className="text-gray-700">123 Creative Avenue</p>
                <p className="text-gray-700">Los Angeles, CA 90210</p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-black">Global Presence</h3>
              <p className="text-gray-700 mb-4">
                With offices in Los Angeles, London, Dubai, and Singapore, we provide video production services worldwide.
              </p>
              <p className="text-gray-700">
                No matter where your project is located, our team can deliver exceptional results.
              </p>
            </div>
          </div>
          
          <div className="contact-form bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-black">Request a Consultation</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Interested In *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="Cinematic Campaigns">Cinematic Campaigns</option>
                    <option value="Automotive Storytelling">Automotive Storytelling</option>
                    <option value="Corporate Events">Corporate Events</option>
                    <option value="Aerial Cinematography">Aerial Cinematography</option>
                    <option value="E-Commerce Films">E-Commerce Films</option>
                    <option value="Post-Production">Post-Production</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;