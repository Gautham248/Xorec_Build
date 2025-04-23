import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Play, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { TypingAnimation } from '@/components/magicui/typing-animation';

const awards = [
  { title: "Successful Events", count: 107 },
  { title: "Track Days", count: 13 },
  { title: "Clients", count: 58 },
  { title: "Digital Ads", count: 12 }
];

const projects = [
  {
    id: 'ferrari-f8-tributo-launch',
    title: "Ferrari F8 Tributo Launch",
    category: "Automotive",
    client: "Ferrari",
    year: "2023",
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Cannes Lions Gold", "Clio Award"]
  },
  {
    id: 'emirates-first-class',
    title: "Emirates First Class Experience",
    category: "Travel",
    client: "Emirates",
    year: "2023",
    image: "https://images.unsplash.com/photo-1540339832862-474599807836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Webby Award"]
  },
  {
    id: 'marriott-luxury-collection',
    title: "Marriott Luxury Collection",
    category: "Hospitality",
    client: "Marriott",
    year: "2023",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["D&AD Pencil"]
  },
  {
    id: 'sony-alpha-series',
    title: "Sony Alpha Camera Series",
    category: "Product",
    client: "Sony",
    year: "2023",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Cannes Lions Silver"]
  },
  {
    id: 'dubai-aerial-cityscape',
    title: "Dubai Aerial Cityscape",
    category: "Aerial",
    client: "Dubai Tourism",
    year: "2023",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Webby Award"]
  },
  {
    id: 'samsung-galaxy-launch',
    title: "Samsung Galaxy Launch Event",
    category: "Corporate",
    client: "Samsung",
    year: "2023",
    image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Clio Award"]
  },
  {
    id: 'nike-running-campaign',
    title: "Nike Running Campaign",
    category: "Sports",
    client: "Nike",
    year: "2023",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["D&AD Pencil", "Cannes Lions Gold"]
  },
  {
    id: 'apple-product-launch',
    title: "Apple Product Launch",
    category: "Technology",
    client: "Apple",
    year: "2023",
    image: "https://images.unsplash.com/photo-1537589376225-5405c60a5bd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Webby Award"]
  },
  {
    id: 'bmw-electric-future',
    title: "BMW Electric Future",
    category: "Automotive",
    client: "BMW",
    year: "2023",
    image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    videoUrl: "#",
    awards: ["Clio Award"]
  }
];

const categories = ["All", "Automotive", "Travel", "Hospitality", "Product", "Aerial", "Corporate", "Sports", "Technology"];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleProjects, setVisibleProjects] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Set up Intersection Observer for mobile devices
  useEffect(() => {
    if (!isMobile) {
      setVisibleProjects([]);
      return;
    }
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6, // Card needs to be 60% visible to trigger
    };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const index = Number(entry.target.getAttribute('data-index'));
        
        if (entry.isIntersecting) {
          setVisibleProjects(prev => [...prev, index]);
        } else {
          setVisibleProjects(prev => prev.filter(i => i !== index));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    projectRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, [isMobile, filteredProjects.length]);
  
  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.portfolio-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.portfolio-title',
            start: 'top 80%',
          }
        }
      );
      
      gsap.fromTo(
        '.award-card',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.awards-section',
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
            <h1 className="portfolio-title text-5xl md:text-6xl font-bold mb-6">
              <div className="overflow-hidden">
                <span >Creative</span><span className="text-accent"> Portfolio</span>
              </div>
              {/* <div className="overflow-hidden">
                
              </div> */}
            </h1>
            <div className="text-xl text-gray-700 max-w-3xl mx-auto">
              Collection of creative work that has helped global brands 
              tell their stories and achieve remarkable results.
            </div>
          </div>

          {/* Awards Section */}
          <div className="awards-section grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {awards.map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="award-card bg-zinc-100 p-6 rounded-lg border border-gray-200 text-center"
              >
                <Award className="w-8 h-8 text-accent mx-auto mb-3" />
                <NumberTicker
                  value={award.count}
                  className="whitespace-pre-wrap text-3xl font-medium tracking-tighter text-black dark:text-white"
                />
                <p className="text-gray-600">{award.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`filter-btn px-6 py-2 rounded-lg text-sm transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={index}
                ref={el => projectRefs.current[index] = el}
                data-index={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer"
              >
                <Link to={`/portfolio/${project.id}`}>
                  <div className="relative h-80">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div 
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                        isMobile 
                          ? visibleProjects.includes(index) ? 'opacity-100' : 'opacity-0'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-gray-200 mb-2">{project.client}</p>
                        {/* <div className="flex flex-wrap gap-2 mb-4">
                          {project.awards.map((award, awardIndex) => (
                            <span 
                              key={awardIndex}
                              className="inline-flex items-center text-sm text-yellow-400"
                            >
                              <Star size={12} className="mr-1" />
                              {award}
                            </span>
                          ))}
                        </div> */}
                        <div className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors">
                          <Play size={16} />
                          <span>View Project</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/contact"
              className="btn bg-accent text-white"
            >
              Start Your Project
            </Link>
          </div>
          
          {isMobile && (
            <div className="text-center mt-6 text-sm text-gray-500">
              <p>Scroll to view project details</p>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Portfolio;