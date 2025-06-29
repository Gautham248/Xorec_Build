
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Play } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { Link } from 'react-router-dom';

// Define the structure of a project based on your database structure
interface Project {
  title: string;
  tags: string[];
  clientName: string;
  overview: string;
  photo: string[];
  videoURL: string;
  year: number;
  Challenge: string;
  Solution: string;
  ProjectResult: string[];
  id?: string;
  status: 'active' | 'disabled';
}

// Tag options from the previous upload form
const categories = [
  "All", 
  "Events",
  "Products",
  "Launches",
  "Delivery",
  "Concerts",
  "Aviation",
  "Automotive",
  "Architecture"
];

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleProjects, setVisibleProjects] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, "Projects");
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList: Project[] = [];
        
        projectsSnapshot.forEach((doc) => {
          // Create a URL-friendly ID from the title
          const urlId = doc.id.toLowerCase().replace(/\s+/g, '-');
          
          projectsList.push({ 
            title: doc.id,
            id: urlId,
            status: doc.data().status || 'active',
            ...doc.data() as Omit<Project, 'title' | 'id' | 'status'>
          });
        });
        
        setProjects(projectsList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter projects based on active category and status
  const filteredProjects = projects
    .filter(project => project.status === 'active')
    .filter(project => 
      activeCategory === "All" || (project.tags && project.tags.includes(activeCategory))
    );
  
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
      threshold: 0.6,
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
  
  // Initial animations for title and filter buttons (run only once)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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
      
      // Filter buttons animation
      gsap.fromTo(
        '.filter-btn',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.filter-container',
            start: 'top 85%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);
  
  // Separate effect for project cards animation when category changes
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Kill any existing animations on project cards
      gsap.killTweensOf('.project-card');
      
      // Project cards animation
      gsap.fromTo(
        '.project-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }, projectsContainerRef);
    
    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section id="portfolio" ref={sectionRef} className="py-24 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="portfolio-title section-title text-black">
            <div className="overflow-hidden">
              <span>Featured</span> <span className="text-accent">Projects</span>
            </div>
          </h2>
          <p className="section-subtitle mx-auto text-gray-700">
            Explore our award-winning work for global brands across various industries.
          </p>
        </div>
        
        <div className="filter-container flex flex-wrap justify-center gap-4 mb-12">
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
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div ref={projectsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProjects.map((project, index) => (
              <Link 
                key={index}
                to={`/portfolio/${project.id || project.title.toLowerCase().replace(/\s+/g, '-')}`}
                state={{ projectTitle: project.title }}
                className="cursor-pointer"
              >
                <div 
                  ref={el => projectRefs.current[index] = el}
                  data-index={index}
                  className="project-card group relative overflow-hidden rounded-lg shadow-md"
                >
                  <img 
                    src={project.photo && project.photo.length > 0 ? project.photo[0] : "/api/placeholder/400/320"} 
                    alt={project.title} 
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 transition-opacity duration-300 ${
                      isMobile 
                        ? visibleProjects.includes(index) ? 'opacity-100' : 'opacity-0'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <p className="text-gray-200 mb-4">{project.clientName}</p>
                    <div className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors">
                      <Play size={16} />
                      <span>View Project</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No active projects found for this category.</p>
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link to="/contact" className="btn bg-accent text-white">
            Discuss Your Project
          </Link>
        </div>
      </div>
      
      {isMobile && filteredProjects.length > 0 && (
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Scroll to view project details</p>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
