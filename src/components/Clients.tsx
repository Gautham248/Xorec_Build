import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Marquee } from './magicui/marquee';

// If you don't have the utils file with cn function, implement it directly:
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Import SVGs directly
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
import Harley from '../assets/XOREC-LOGO/Harley Davidson.svg';

const clients = [
  { name: 'Ferrari', logo: ferrariLogo },
  { name: 'Air India Express', logo: airIndiaExpress },
  { name: 'Aston Martin', logo: astonMartin },
  { name: 'Audi', logo: Audi },
  { name: 'Mercedes-Benz', logo: Benz },
  { name: 'Castrol', logo: Castrol },
  { name: 'Ducati', logo: Ducati },
  { name: 'Empire', logo: Empire },
  { name: 'Galaxy Builders', logo: GalaxyBuilders },
  { name: 'Hyundai', logo: Huyndai },
  { name: 'JSW', logo: JSW },
  { name: 'JW Marriott', logo: JWMarriot },
  { name: 'Jaguar', logo: Jaguar },
  { name: 'Lamborghini', logo: Lamborghini },
  { name: 'Land Rover', logo: LandRover },
  { name: 'Lexus', logo: Lexus },
  { name: 'Mahindra', logo: Mahindra },
  { name: 'McLaren', logo: McLaren },
  { name: 'Nothing', logo: Nothing },
  { name: 'Orxa Builders', logo: OrxaBuilders },
  { name: 'Petes', logo: Petes },
  { name: 'Porsche', logo: Porsche },
  { name: 'Rolls-Royce', logo: RollsRoyce },
  { name: 'Toyota', logo: Toyota },
  { name: 'UST Global', logo: UST },
  { name: 'Vayner Media', logo: VaynerMedia },
  { name: 'Zomato', logo: Zomato },
  { name: 'Harley', logo: Harley }
];

// Divide clients into two rows for the marquee
const firstRow = clients.slice(0, Math.ceil(clients.length / 2));
const secondRow = clients.slice(Math.ceil(clients.length / 2));

// Client Card Component for Marquee
const ClientCard = ({ name, logo }: { name: string, logo: string }) => {
  return (
    <figure
      className={cn(
        "relative h-full w-48 cursor-pointer overflow-hidden rounded-lg p-6 mx-4", // Removed border
        "transition-all duration-300 group",
      )}
    >
      <div className="flex items-center justify-center h-full">
        <img 
          src={logo} 
          alt={`${name} logo`} 
          className="w-50 h-28 object-contain group-hover:scale-210 transition-transform duration-300" // Increased from w-28 h-16
        />
      </div>
    </figure>
  );
};

const Clients: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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
    <section id="clients" ref={sectionRef} className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="clients-title section-title text-black">
            <div className="overflow-hidden">
              <span>Trusted by</span> <span className="text-accent"> Global Brands</span>
            </div>
          </h2>
          <p className="section-subtitle mx-auto text-gray-700">
            We've partnered with industry leaders worldwide to create impactful visual content that drives results.
          </p>
        </div>
        
        {/* Clients Marquee with horizontal scrolling support */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee 
            pauseOnHover 
            scrollable={true} 
            scrollSpeed={80} 
            className="[--duration:13s]"
          > 
            {firstRow.map((client) => (
              <ClientCard key={client.name} name={client.name} logo={client.logo} />
            ))}
          </Marquee>
          
          
          <Marquee 
            reverse 
            pauseOnHover 
            scrollable={true}
            scrollSpeed={80}
            className="[--duration:13s] mt-4"
          > 
            {secondRow.map((client) => (
              <ClientCard key={client.name} name={client.name} logo={client.logo} />
            ))}
          </Marquee>
          
          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white"></div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-700 mb-6">Join over 100+ global brands who trust Xorec with their visual storytelling</p>
          <a href="/contact" className="btn bg-accent text-white">
            Become Our Client
          </a>
        </div>
      </div>
    </section>
  );
};

export default Clients;