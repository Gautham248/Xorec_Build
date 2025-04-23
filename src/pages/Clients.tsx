import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Globe } from 'lucide-react';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { TypingAnimation } from '@/components/magicui/typing-animation';

// Import SVGs directly - adding these from the first file
import ferrariLogo from '../assets/XOREC-LOGO/Ferrari.svg';
import airIndiaExpress from '../assets/XOREC-LOGO/Air india express.svg';
import astonMartin from '../assets/XOREC-LOGO/Aston Martin.svg';
import Audi from '../assets/XOREC-LOGO/Audi.svg';
import Benz from '../assets/XOREC-LOGO/Benz.svg';
import Castrol from '../assets/XOREC-LOGO/Castrol.svg';
import Ducati from '../assets/XOREC-LOGO/Ducati.svg';
import Empire from '../assets/XOREC-LOGO/Empire.svg';
import GalaxyBuilders from '../assets/XOREC-LOGO/Galaxy Builders.svg';
import Huyndai from '../assets/XOREC-LOGO/Huyndai.svg';
import JSW from '../assets/XOREC-LOGO/JSW.svg';
import JWMarriot from '../assets/XOREC-LOGO/JW Marriot.svg';
import Jaguar from '../assets/XOREC-LOGO/Jaguar.svg';
import Lamborghini from '../assets/XOREC-LOGO/Lamborghini.svg';
import LandRover from '../assets/XOREC-LOGO/Land Rover.svg';
import Lexus from '../assets/XOREC-LOGO/Lexus.svg';
import Mahindra from '../assets/XOREC-LOGO/Mahindra.svg';
import McLaren from '../assets/XOREC-LOGO/McLaren.svg';
import Nothing from '../assets/XOREC-LOGO/Nothing.svg';
import OrxaBuilders from '../assets/XOREC-LOGO/Orxa builders.svg';
import Petes from '../assets/XOREC-LOGO/Petes.svg';
import Porsche from '../assets/XOREC-LOGO/Porsche.svg';
import RollsRoyce from '../assets/XOREC-LOGO/RollsRoyce.svg';
import Toyota from '../assets/XOREC-LOGO/Toyota.svg';
import UST from '../assets/XOREC-LOGO/UST global.svg';
import VaynerMedia from '../assets/XOREC-LOGO/Vayner Media.svg';
import Zomato from '../assets/XOREC-LOGO/Zomato.svg';

const stats = [
  { icon: <Star size={24} />, value: "50+", label: "Global Brands" },
  { icon: <TrendingUp size={24} />, value: "500+", label: "Projects Completed" },
  { icon: <Users size={24} />, value: "10M+", label: "Views Generated" },
  { icon: <Globe size={24} />, value: "6+", label: "Countries Served" }
];

// Updated clients array with logos instead of text
// Updated clients array with logos instead of text - now including all imports
const clients = [
  { name: 'Ferrari', logo: ferrariLogo, industry: 'Automotive' },
  { name: 'Air India Express', logo: airIndiaExpress, industry: 'Aviation' },
  { name: 'Aston Martin', logo: astonMartin, industry: 'Automotive' },
  { name: 'Audi', logo: Audi, industry: 'Automotive' },
  { name: 'Mercedes-Benz', logo: Benz, industry: 'Automotive' },
  { name: 'Castrol', logo: Castrol, industry: 'Oil & Gas' },
  { name: 'Ducati', logo: Ducati, industry: 'Automotive' },
  { name: 'Empire', logo: Empire, industry: 'Real Estate' },
  { name: 'Galaxy Builders', logo: GalaxyBuilders, industry: 'Construction' },
  { name: 'Hyundai', logo: Huyndai, industry: 'Automotive' },
  { name: 'JSW', logo: JSW, industry: 'Steel' },
  { name: 'JW Marriott', logo: JWMarriot, industry: 'Hospitality' },
  { name: 'Jaguar', logo: Jaguar, industry: 'Automotive' },
  { name: 'Lamborghini', logo: Lamborghini, industry: 'Automotive' },
  { name: 'Land Rover', logo: LandRover, industry: 'Automotive' },
  { name: 'Lexus', logo: Lexus, industry: 'Automotive' },
  { name: 'Mahindra', logo: Mahindra, industry: 'Automotive' },
  { name: 'McLaren', logo: McLaren, industry: 'Automotive' },
  { name: 'Nothing', logo: Nothing, industry: 'Technology' },
  { name: 'Orxa Builders', logo: OrxaBuilders, industry: 'Construction' },
  { name: 'Petes', logo: Petes, industry: 'Retail' },
  { name: 'Porsche', logo: Porsche, industry: 'Automotive' },
  { name: 'Rolls-Royce', logo: RollsRoyce, industry: 'Automotive' },
  { name: 'Toyota', logo: Toyota, industry: 'Automotive' },
  { name: 'UST Global', logo: UST, industry: 'Technology' },
  { name: 'Vayner Media', logo: VaynerMedia, industry: 'Media' },
  { name: 'Zomato', logo: Zomato, industry: 'Food Delivery' }
];

const testimonials = [
  {
    quote: "Xorec transformed our brand story into a cinematic masterpiece. The ROI on our campaign exceeded expectations by 300%.",
    author: "Sarah Johnson",
    position: "Marketing Director",
    company: "Ferrari",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "Their attention to detail and creative vision helped us showcase our new aircraft in ways we never imagined possible.",
    author: "Michael Chen",
    position: "VP of Brand",
    company: "Emirates",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "Working with Xorec elevated our property showcases to art. Their videos have become the gold standard in luxury hospitality.",
    author: "Elena Rodriguez",
    position: "Global Creative Director",
    company: "Marriott",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  }
];

const Clients = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.clients-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.clients-title',
            start: 'top 80%',
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
            <h1 className="clients-title text-5xl md:text-6xl font-bold mb-6">
              <div className="overflow-hidden">
                <span>Trusted by</span><span className="text-accent"> Global Brands</span>
              </div>
            </h1>
            <div className="text-xl text-gray-700 max-w-3xl mx-auto">
              We've partnered with industry leaders worldwide to create impactful visual content
              that drives results and elevates brands.
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
  {stats.map((stat, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="text-center"
    >
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-accent mx-auto mb-4">
        {stat.icon}
      </div>
      <div className="flex items-center justify-center">
        <NumberTicker
          value={index === 2 ? stat.value.replace("M+", "") : stat.value}
          className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white"
        />
        {index === 2 && <span className="text-3xl font-medium tracking-tighter text-black dark:text-white">M+</span>}
      </div>
      <p className="text-gray-600">{stat.label}</p>
    </motion.div>
  ))}
</div>

          {/* Clients Grid with Logos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-20">
            {clients.map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                viewport={{ once: true, amount: 0.1 }}
                className="flex flex-col items-center justify-center p-6 bg-zinc-100 rounded-lg border border-gray-200 hover:border-zinc-300 transition-all duration-300 group"
              >
                <div className="h-16 flex items-center justify-center mb-2">
                  <img 
                    src={client.logo} 
                    alt={`${client.name} logo`}
                    className="w-48 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm text-gray-500 mt-2">{client.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Testimonials Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-black">{testimonial.author}</h3>
                    <p className="text-gray-600">{testimonial.position}</p>
                    <p className="text-red-600">{testimonial.company}</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  "{testimonial.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a
              href="/contact"
              className="btn bg-accent text-white"
            >
              Become Our Client
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Clients;