import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Globe, MessageSquare } from 'lucide-react';

const offices = [
  {
    city: "Bangalore",
    address: "108 Jayanagar, Bangalore, 560068",
    phone: "+91 9846853884",
    email: "eby@xorec.com",
    timezone: "PST (UTC-8)"
  },
  {
    city: "London",
    address: "19 Newcastle Road, Reading, Berkshire RG2 7TN",
    phone: "+44 7436403501",
    email: "sales@xorec.com",
    timezone: "GMT (UTC+0)"
  },
  {
    city: "Dubai",
    address: "789 Production Road, Dubai Media City, UAE",
    phone: "+971 4 123 4567",
    email: "dubai@xorec.com",
    timezone: "GST (UTC+4)"
  }
];

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    budget: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({
      name: '',
      email: '',
      company: '',
      service: '',
      budget: '',
      message: ''
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
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
      
      gsap.fromTo(
        '.office-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.offices-grid',
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-20">
      <section ref={sectionRef} className="bg-white py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="text-center mb-16">
            <h1 className="contact-title text-5xl md:text-6xl font-bold mb-6">
              <div className="overflow-hidden">
                <span className="block">Let's Create</span>
              </div>
              <div className="overflow-hidden">
                <span className="block text-accent">Together</span>
              </div>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Ready to elevate your brand with cinematic storytelling? Get in touch with our team 
              and let's create something extraordinary together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6 text-black">Start Your Project</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="10k-25k">$10,000 - $25,000</option>
                    <option value="25k-50k">$25,000 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k+">$100,000+</option>
                  </select>
                </div>

                <div>
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
                  className="w-full bg-black text-white py-4 px-8 rounded-md hover:bg-zinc-600 transition-colors duration-300 font-medium"
                
                >
                  Submit Request
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-6 text-black">Quick Contact</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-accent mr-4">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">Chat with Us</h3>
                      <p className="text-gray-600">Available 24/7 for urgent inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-accent mr-4">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">Email Us</h3>
                      <p className="text-gray-600">hello@xorec.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-accent mr-4">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">Global Coverage</h3>
                      <p className="text-gray-600">Available worldwide</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="offices-grid grid grid-cols-1 gap-6">
                {offices.map((office, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="office-card bg-white p-6 rounded-lg border border-gray-200 shadow-lg"
                  >
                    <h3 className="text-xl font-bold mb-4 text-black">{office.city}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        <span>{office.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone size={18} className="mr-2" />
                        <span>{office.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail size={18} className="mr-2" />
                        <span>{office.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-2" />
                        <span>{office.timezone}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-lg overflow-hidden shadow-lg h-96 bg-gray-100">
            {/* Add your map component here */}
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Interactive Map Coming Soon
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;