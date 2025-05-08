import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Play, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { collection, getDocs, getDocsFromCache, enableIndexedDbPersistence, query, orderBy } from 'firebase/firestore';
import ProjectImage from '@/components/ProjectImage';
import { db } from '@/firebase-config';

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
  status?: 'active' | 'disabled';
  displayOrder?: number;
}

// Define the structure of a tag
interface Tag {
  id: string;
  count: number;
  createdAt: string;
}

const awards = [
  { title: "Successful Events", count: 107 },
  { title: "Track Days", count: 13 },
  { title: "Clients", count: 58 },
  { title: "Digital Ads", count: 12 }
];

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleProjects, setVisibleProjects] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch tags and projects from Firestore with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Enable Firestore persistence
        try {
          await enableIndexedDbPersistence(db);
        } catch (err: any) {
          console.warn('Persistence error:', err.code, err.message);
        }

        // Fetch tags
        const tagsCollection = collection(db, "TAGS");
        let tagsList: Tag[] = [];
        try {
          const cachedTagsSnapshot = await getDocsFromCache(tagsCollection);
          if (!cachedTagsSnapshot.empty) {
            tagsList = cachedTagsSnapshot.docs.map(doc => ({
              id: doc.id,
              count: doc.data().count || 0,
              createdAt: doc.data().createdAt || new Date().toISOString()
            }));
            console.log('Serving tags from cache:', tagsList);
            setTags(tagsList.sort((a, b) => a.id.localeCompare(b.id)));
          }
        } catch (cacheError) {
          console.warn('Cache fetch for tags failed:', cacheError);
        }

        try {
          const serverTagsSnapshot = await getDocs(tagsCollection);
          tagsList = serverTagsSnapshot.docs.map(doc => ({
            id: doc.id,
            count: doc.data().count || 0,
            createdAt: doc.data().createdAt || new Date().toISOString()
          }));
          console.log('Serving tags from server:', tagsList);
          setTags(tagsList.sort((a, b) => a.id.localeCompare(b.id)));
        } catch (tagError: any) {
          console.error('Error fetching tags:', tagError);
          setError(`Failed to load tags: ${tagError.message}`);
        }

        // Fetch projects
        const projectsCollection = collection(db, "Projects");
        const q = query(
          projectsCollection,
          orderBy("displayOrder", "asc"),
          orderBy("year", "desc")
        );

        // Process snapshot helper function
        const processSnapshot = (snapshot: any, source: string) => {
          const projectsList: Project[] = [];
          snapshot.forEach((doc: any) => {
            const urlId = doc.id.toLowerCase().replace(/\s+/g, '-');
            const projectData = doc.data();
            if (projectData.status === 'active' || !projectData.status) {
              projectsList.push({
                title: doc.id,
                id: urlId,
                status: projectData.status || 'active',
                displayOrder: projectData.displayOrder || 0,
                ...projectData as Omit<Project, 'title' | 'id' | 'status' | 'displayOrder'>
              });
            }
          });
          projectsList.sort((a, b) => {
            if (a.displayOrder === b.displayOrder) {
              return (b.year || 0) - (a.year || 0);
            }
            return (a.displayOrder || 0) - (b.displayOrder || 0);
          });
          console.log(`Active projects from ${source}:`, projectsList);
          return projectsList;
        };

        // Always fetch from server to ensure fresh data
        let updatedProjectsList: Project[] = [];
        try {
          const serverSnapshot = await getDocs(q);
          console.log('Serving projects from server');
          updatedProjectsList = processSnapshot(serverSnapshot, 'server');
          setProjects(updatedProjectsList);
        } catch (serverError: any) {
          console.warn('Server fetch with index failed:', serverError.message);
          const fallbackSnapshot = await getDocs(projectsCollection);
          console.log('Serving projects from server (fallback)');
          updatedProjectsList = processSnapshot(fallbackSnapshot, 'server fallback');
          setProjects(updatedProjectsList);
        }

        if (updatedProjectsList.length === 0 && tagsList.length === 0) {
          setError('No active projects or tags found.');
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(`Failed to load data: ${error.message}. Please check your database or try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter projects based on active category with memoization
  const filteredProjects = useMemo(() => {
    const filtered = projects
      .filter(project => {
        const isActive = project.status === 'active' || !project.status;
        const hasTag = activeCategory === "All" || (project.tags && project.tags.includes(activeCategory));
        console.log(`Project "${project.title}" - isActive: ${isActive}, hasTag: ${hasTag}, tags: ${project.tags}`);
        return isActive && hasTag;
      })
      .sort((a, b) => {
        if (a.displayOrder === b.displayOrder) {
          return (b.year || 0) - (a.year || 0);
        }
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
    console.log(`Filtered projects (category: ${activeCategory}):`, filtered);
    return filtered;
  }, [projects, activeCategory]);

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
      setVisibleProjects(filteredProjects.map((_, index) => index));
      return;
    }
    
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: [0.15, 0.3, 0.5],
    };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const index = Number(entry.target.getAttribute('data-index'));
        if (entry.isIntersecting) {
          setVisibleProjects(prev => [...new Set([...prev, index])]);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    projectRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, [isMobile, filteredProjects.length]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleProjects([]);
  };

  // GSAP animations for static elements
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
      
      const awardCards = gsap.utils.toArray('.award-card');
      gsap.set(awardCards, { scale: 0.8, opacity: 0 });
      
      gsap.to(awardCards, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: {
          each: 0.1,
          from: "start",
          grid: "auto"
        },
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.awards-section',
          start: 'top 75%',
          once: true
        }
      });
      
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

  // GSAP animations for project cards
  useLayoutEffect(() => {
    if (loading || filteredProjects.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.1,
        }
      );
    }, projectsContainerRef);
    
    return () => ctx.revert();
  }, [loading, filteredProjects]);

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
                <span>Creative</span><span className="text-accent"> Portfolio</span>
              </div>
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
          <div className="filter-container flex flex-wrap justify-center gap-4 mb-12">
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-accent border-r-transparent"></div>
                <span className="ml-2 text-gray-600">Loading categories...</span>
              </div>
            ) : (
              ["All", ...tags.map(tag => tag.id)].map((category, index) => (
                <button
                  key={index}
                  className={`filter-btn px-6 py-2 rounded-lg text-sm transition-all duration-300 ${
                    activeCategory === category 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))
            )}
          </div>

          {/* Projects Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <p className="text-gray-600 mt-2">
                  Please add active projects.
                </p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div ref={projectsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <ProjectImage 
                        src={project.photo && project.photo.length > 0 ? project.photo[0] : "/api/placeholder/400/320"} 
                        alt={project.title} 
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
          </motion.div>

          <div className="mt-16 text-center">
            <Link 
              to="/contact"
              className="btn bg-accent text-white"
            >
              Start Your Project
            </Link>
          </div>
          
          {isMobile && filteredProjects.length > 0 && (
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