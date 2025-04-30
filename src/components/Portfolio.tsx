import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import { gsap } from 'gsap';
import { Play } from 'lucide-react';
import { collection, getDocs, doc, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { Link } from 'react-router-dom';
import { ResponsiveImage } from './ResponsiveImage';
import { useVirtualizer } from '@tanstack/react-virtual';

// Define the structure of a project
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

// Define the structure for featured projects
interface FeaturedProject {
  projectId: string;
  clientName: string;
  photo: string[];
  tags: string[];
  year: number;
  addedAt: any; // Firebase timestamp
  status: 'active' | 'disabled';
}

// Tag options from the previous upload form - commented out but preserved
// const categories = [
//   "All", 
//   "Events",
//   "Products",
//   "Launches",
//   "Delivery",
//   "Concerts",
//   "Aviation",
//   "Automotive",
//   "Architecture"
// ];

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleProjects, setVisibleProjects] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch only featured projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // First, get all featured project IDs from the FeaturedProjects collection
        const featuredCollection = collection(db, "FeaturedProjects");
        const featuredSnapshot = await getDocs(featuredCollection);
        
        if (featuredSnapshot.empty) {
          setProjects([]);
          setLoading(false);
          return;
        }
        
        // Process featured projects and get their full details
        const projectsList: Project[] = [];
        
        // For each featured project, get the full project details
        // Use Promise.all to fetch all project data in parallel
        const projectPromises = featuredSnapshot.docs.map(async (featuredDoc) => {
          const featuredData = featuredDoc.data() as FeaturedProject;
          
          // Create a URL-friendly ID from the project ID
          const urlId = featuredData.projectId.toLowerCase().replace(/\s+/g, '-');
          
          // Return basic project with minimal data from featured collection
          return {
            title: featuredData.projectId,
            id: urlId,
            clientName: featuredData.clientName,
            photo: featuredData.photo,
            tags: featuredData.tags,
            year: featuredData.year,
            status: featuredData.status || 'active', // Use status from data or default to active
          };
        });
        
        const projects = await Promise.all(projectPromises);
        // Filter out projects that don't have an active status
        const activeProjects = projects.filter(project => project.status === 'active');
        setProjects(activeProjects.map(project => ({
          ...project,
          overview: '',
          videoURL: '',
          Challenge: '',
          Solution: '',
          ProjectResult: []
        })));
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Enable Firestore persistence
  useEffect(() => {
    const enablePersistence = async () => {
      try {
        await enableIndexedDbPersistence(db);
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.log('The current browser does not support persistence.');
        }
      }
    };
    enablePersistence();
  }, []);

  // Memoize filtered projects
  const filteredProjects = useMemo(() => projects, [projects]);
  
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
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div ref={projectsContainerRef} className="h-[800px] overflow-auto">
            <div
              style={{
                height: `${filteredProjects.length * 320}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                      <ResponsiveImage
                        src={project.photo && project.photo.length > 0 ? project.photo[0] : "/api/placeholder/400/320"}
                        alt={project.title}
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="w-full h-80 transition-transform duration-700 group-hover:scale-110"
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
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No active featured projects found.</p>
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link to="/contact" className="btn bg-accent text-white">
            Discuss Your Project
          </Link>
        </div>
        
        {isMobile && filteredProjects.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Scroll to view project details</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;