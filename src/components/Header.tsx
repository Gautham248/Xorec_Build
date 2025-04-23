import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
// import xoreclogo from '../assets/Xorec_logo.png';

import { ScrollProgress } from './magicui/scroll-progress';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="container relative flex items-center justify-between px-4">
          {/* Logo - positioned differently for mobile vs desktop */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-tighter text-neutral-900">XOREC</span>
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:block flex-1">
            <nav className="flex items-center justify-center space-x-8">
              <Link
                to="/"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/services' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                Services
              </Link>
              <Link
                to="/portfolio"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/portfolio' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                Portfolio
              </Link>
              <Link
                to="/clients"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/clients' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                Clients
              </Link>
              <Link
                to="/about"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/about' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm uppercase tracking-wider font-medium bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        
          {/* Mobile Menu Button - Keep on the right */}
          <button
            className="md:hidden text-neutral-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg">
            <div className="container py-5 flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/services' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/portfolio"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/portfolio' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                to="/clients"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/clients' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Clients
              </Link>
              <Link
                to="/about"
                className={`text-sm uppercase tracking-wider font-medium hover:text-neutral-900 transition-colors ${
                  location.pathname === '/about' ? 'text-neutral-900' : 'text-neutral-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm uppercase tracking-wider font-medium bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-block w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>
      
      <div className="z-10 rounded-lg">
        <ScrollProgress 
          className={isMobile ? "top-[55px]" : "top-[60px]"}
        />
        <h2 className="font-bold">
          {/* Note: The scroll progress is shown below the navbar of the page. */}
        </h2>
      </div>
    </>
  );
};

export default Header;