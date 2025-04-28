import React from 'react';
import { Instagram, Twitter, Linkedin, Facebook, Youtube, ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-footerColor pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <a href="/" className="flex items-center mb-6">
              <span className="text-3xl font-bold tracking-tighter text-accent">XOREC</span>
            </a>
            <p className="text-gray-400 mb-6">
              Industry-recognized video production agency creating cinematic content for global brands.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg text-white  mb-6">Services</h3>
            <ul className="space-y-3">
            <li className="text-gray-400 hover:text-red-600 transition-colors">Cinematic Campaigns</li>
            <li className="text-gray-400 hover:text-red-600 transition-colors">Automotive Storytelling</li>
            <li className="text-gray-400 hover:text-red-600 transition-colors">Corporate Events</li>
            <li className="text-gray-400 hover:text-red-600 transition-colors">Aerial Cinematography</li>
            <li className="text-gray-400 hover:text-red-600 transition-colors">E-Commerce Films</li>
            <li className="text-gray-400 hover:text-red-600 transition-colors">Post-Production</li>

            </ul>
          </div>
          
          <div>
            <h3 className="text-lg text-white  mb-6">Company</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-red-600 transition-colors">About Us</a></li>
              <li><a href="/portfolio" className="text-gray-400 hover:text-red-600 transition-colors">Portfolio</a></li>
              <li><a href="/clients" className="text-gray-400 hover:text-red-600 transition-colors">Clients</a></li>
              <li><a href="/services" className="text-gray-400 hover:text-red-600 transition-colors">Services</a></li>
              {/* <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors">Blog</a></li> */}
              <li><a href="/contact" className="text-gray-400 hover:text-red-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg text-white  mb-6">Contact</h3>
            <ul className="space-y-3">
              <li className="text-gray-400">Bengaluru, India</li>
              <li className="text-gray-400">London, UK</li>
              <li className="text-gray-400">Dubai, UAE</li>
              <li className="text-gray-400">Riyadh, Saudi Arabia</li>
              {/* <li className="text-gray-400">info@xorec.com</li>
              <li className="text-gray-400">+1 (555) 123-4567</li> */}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Xorec. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-red-600 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-red-600 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-red-600 text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
      
      <button 
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-colors focus:outline-none"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;