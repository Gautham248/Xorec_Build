import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, enableIndexedDbPersistence, getDocsFromCache, QuerySnapshot, writeBatch, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { Edit, Search, Filter, Trash2, Plus, Check, X, Star, LayoutGrid } from 'lucide-react';
import { gsap } from 'gsap';
import toast, { Toaster } from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: string;
  tags?: string[];
  clientName?: string;
  photo?: string[];
  year?: number;
  status?: 'active' | 'disabled';
  featured?: boolean;
  displayOrder?: number;
  updatedAt?: Date;
}

import Auth from '@/components/Auth';

const PortfolioManagement: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<'active' | 'disabled' | ''>('');
  const [featuredProjects, setFeaturedProjects] = useState<Set<string>>(new Set());
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderedProjects, setReorderedProjects] = useState<Project[]>([]);

  // Categories for filtering
  const categories = [
    "All", 
    "Events",
    "Products",
    "Films",
    "Launches",
    "Delivery",
    "Concerts",
    "Aviation",
    "Automotive",
    "Architecture"
  ];

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, "Projects");
        
        // Simplified query to avoid issues with displayOrder
        const q = query(
          projectsCollection,
          orderBy("year", "desc")
        );

        // Fetch featured projects
        const featuredCollection = collection(db, "FeaturedProjects");
        const featuredSnapshot = await getDocs(featuredCollection);
        const featuredIds = new Set<string>();
        featuredSnapshot.forEach(doc => {
          featuredIds.add(doc.id);
        });
        setFeaturedProjects(featuredIds);

        // Process snapshot helper function
        const processSnapshot = (snapshot: QuerySnapshot) => {
          if (snapshot.empty) {
            console.log('No projects found in Firestore');
            setError('No projects available in the database');
            setProjects([]);
            return;
          }

          const projectData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              status: data.status || 'active',
              featured: featuredIds.has(doc.id),
              displayOrder: data.displayOrder || 0,
              updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : undefined,
              tags: data.tags || [],
              clientName: data.clientName || 'Unknown',
              photo: data.photo || [],
              year: data.year || 0,
            } as Project;
          });
          console.log('Fetched projects:', projectData);
          setProjects(projectData);
        };

        // Enable local persistence
        try {
          await enableIndexedDbPersistence(db);
        } catch (err: any) {
          console.warn('Persistence error:', err.code, err.message);
        }

        // Get cached data first
        const cachedSnapshot = await getDocsFromCache(q);
        if (!cachedSnapshot.empty) {
          console.log('Serving from cache');
          processSnapshot(cachedSnapshot);
        }

        // Then get fresh data from server
        const freshSnapshot = await getDocs(q);
        console.log('Serving from server');
        processSnapshot(freshSnapshot);

      } catch (error: any) {
        console.error("Error fetching projects:", error);
        setError(`Failed to load projects: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Initialize reordered projects when opening modal
  useEffect(() => {
    if (isReorderModalOpen) {
      setReorderedProjects([...projects].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    }
  }, [isReorderModalOpen, projects]);

  // Filter projects based on active category and search term
  const filteredProjects = projects
    .filter(project => {
      if (activeCategory === "All") return true;
      return project.tags && project.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());
    })
    .filter(project => {
      const searchTermLower = searchTerm.toLowerCase();
      const titleMatch = (project.id || '').toLowerCase().includes(searchTermLower);
      const clientMatch = (project.clientName || '').toLowerCase().includes(searchTermLower);
      return titleMatch || clientMatch;
    });

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.management-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.management-title',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  // Handle edit project navigation
  const handleEditProject = (projectId: string) => {
    navigate(`/portfolio/edit/${projectId}`);
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      toast.error('Please select a status to apply', { duration: 3000 });
      return;
    }

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      
      if (bulkStatus === 'active') {
        let highestDisplayOrder = 0;
        projects.forEach(project => {
          if (project.displayOrder && project.displayOrder > highestDisplayOrder) {
            highestDisplayOrder = project.displayOrder;
          }
        });
        
        selectedProjects.forEach((projectId, index) => {
          const projectRef = doc(db, 'Projects', projectId);
          batch.update(projectRef, { 
            status: bulkStatus,
            displayOrder: highestDisplayOrder + index + 1,
            updatedAt: new Date()
          });
        });
      } else {
        selectedProjects.forEach(projectId => {
          const projectRef = doc(db, 'Projects', projectId);
          batch.update(projectRef, { 
            status: bulkStatus,
            updatedAt: new Date()
          });
        });
      }
      
      await batch.commit();
      
      setProjects(prev => prev.map(p => {
        if (selectedProjects.includes(p.id)) {
          if (bulkStatus === 'active') {
            const index = selectedProjects.indexOf(p.id);
            let highestDisplayOrder = 0;
            prev.forEach(project => {
              if (project.displayOrder && project.displayOrder > highestDisplayOrder) {
                highestDisplayOrder = project.displayOrder;
              }
            });
            
            return { 
              ...p, 
              status: bulkStatus,
              displayOrder: highestDisplayOrder + index + 1,
              updatedAt: new Date()
            };
          } else {
            return { 
              ...p, 
              status: bulkStatus,
              updatedAt: new Date()
            };
          }
        }
        return p;
      }));
      
      setSelectedProjects([]);
      setBulkStatus('');
      toast.success(`Successfully updated ${selectedProjects.length} project(s) to ${bulkStatus}`, {
        duration: 3000,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Error updating projects:', error);
      toast.error('Failed to update projects', { duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (projectId: string) => {
    try {
      setIsProcessing(true);
      const featuredRef = doc(db, "FeaturedProjects", projectId);
      const isFeatured = featuredProjects.has(projectId);
      
      if (isFeatured) {
        await deleteDoc(featuredRef);
        setFeaturedProjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
        toast.success('Project removed from featured projects', { duration: 3000 });
      } else {
        const projectDoc = await getDoc(doc(db, "Projects", projectId));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          await setDoc(featuredRef, {
            projectId,
            clientName: projectData.clientName || 'Unknown',
            photo: projectData.photo || [],
            tags: projectData.tags || [],
            year: projectData.year || 0,
            addedAt: new Date()
          });
          setFeaturedProjects(prev => new Set([...prev, projectId]));
          toast.success('Project added to featured projects', { duration: 3000 });
        }
      }
      
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, featured: !isFeatured } : p)
      );
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status', { duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk featured toggle
  const handleBulkFeaturedToggle = async (setAsFeatured: boolean) => {
    if (selectedProjects.length === 0) return;
    
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      
      for (const projectId of selectedProjects) {
        const featuredRef = doc(db, "FeaturedProjects", projectId);
        const isFeatured = featuredProjects.has(projectId);
        
        if (setAsFeatured && !isFeatured) {
          const projectDoc = await getDoc(doc(db, "Projects", projectId));
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            batch.set(featuredRef, {
              projectId,
              clientName: projectData.clientName || 'Unknown',
              photo: projectData.photo || [],
              tags: projectData.tags || [],
              year: projectData.year || 0,
              addedAt: new Date()
            });
          }
        } else if (!setAsFeatured && isFeatured) {
          batch.delete(featuredRef);
        }
      }
      
      await batch.commit();
      
      const newFeaturedSet = new Set(featuredProjects);
      selectedProjects.forEach(projectId => {
        if (setAsFeatured) {
          newFeaturedSet.add(projectId);
        } else {
          newFeaturedSet.delete(projectId);
        }
      });
      
      setFeaturedProjects(newFeaturedSet);
      setProjects(prev => 
        prev.map(p => 
          selectedProjects.includes(p.id) ? { ...p, featured: setAsFeatured } : p
        )
      );
      
      setSelectedProjects([]);
      toast.success(`Successfully ${setAsFeatured ? 'added' : 'removed'} ${selectedProjects.length} project(s) ${setAsFeatured ? 'to' : 'from'} featured`, {
        duration: 3000,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status', { duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag and drop for reordering
  const onDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReorderedProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over?.id);
        const newProjects = [...prev];
        const [reorderedItem] = newProjects.splice(oldIndex, 1);
        newProjects.splice(newIndex, 0, reorderedItem);
        return newProjects;
      });
    }
  };

  // Save reordered projects
  const handleSaveOrder = async () => {
    if (reorderedProjects.length === 0) {
      toast.error('No projects to reorder', { duration: 3000 });
      setIsReorderModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      reorderedProjects.forEach((project, index) => {
        const projectRef = doc(db, 'Projects', project.id);
        batch.update(projectRef, {
          displayOrder: index + 1,
          updatedAt: new Date()
        });
      });

      await batch.commit();

      setProjects(prev => prev.map(p => {
        const updatedProject = reorderedProjects.find(rp => rp.id === p.id);
        return updatedProject ? { ...p, displayOrder: reorderedProjects.indexOf(updatedProject) + 1, updatedAt: new Date() } : p;
      }));

      setIsReorderModalOpen(false);
      toast.success('Project order updated successfully', { duration: 3000, position: 'top-right' });
    } catch (error) {
      console.error('Error saving project order:', error);
      toast.error('Failed to save project order', { duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  // Sortable item component
  const SortableItem = ({ project, index }: { project: Project; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: project.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 0,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-80 shadow-lg scale-105' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {project.photo && project.photo[0] && (
            <img
              src={project.photo[0]}
              alt={project.id}
              className="h-12 w-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
              }}
            />
          )}
          <div>
            <h3 className="font-medium text-gray-900">{project.id}</h3>
            <p className="text-sm text-gray-500">{project.clientName || 'Unknown'}</p>
            <p className="text-xs text-gray-400">Order: {index + 1}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Auth>
      <div className="pt-20">
        <Toaster />
        <section ref={sectionRef} className="bg-white py-24">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="container"
          >
            <div className="text-center mb-12">
              <h1 className="management-title text-5xl md:text-6xl font-bold mb-6">
                <div className="overflow-hidden">
                  <span>Manage</span><span className="text-accent"> Portfolio</span>
                </div>
              </h1>
              <div className="text-xl text-gray-700 max-w-3xl mx-auto">
                View, edit, and manage all your portfolio projects in one place.
              </div>
            </div>

            {/* Action Bar - Search, Add Project, Reorder Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsReorderModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isProcessing}
                >
                  <LayoutGrid size={18} />
                  Reorder Projects
                </button>
                <Link 
                  to="/upload SPAWNED SUBTASK [Upload Project Component]project" 
                  className="flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Plus size={18} />
                  Add New Project
                </Link>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`filter-btn flex-shrink-0 px-6 py-2 rounded-lg text-sm transition-all duration-300 ${
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

            {/* Projects List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedProjects.length > 0 && selectedProjects.length === filteredProjects.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjects(filteredProjects.map(p => p.id));
                              } else {
                                setSelectedProjects([]);
                              }
                            }}
                            className="rounded border-gray-300 text-accent focus:ring-accent"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Project</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Year</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Featured</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="w-10 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes(project.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjects([...selectedProjects, project.id]);
                                } else {
                                  setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                }
                              }}
                              className="rounded border-gray-300 text-accent focus:ring-accent"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {project.photo && project.photo[0] && (
                                <img
                                  src={project.photo[0]}
                                  alt={project.id}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
                                  }}
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{project.id}</div>
                                <div className="text-sm text-gray-500">
                                  {project.tags?.slice(0, 2).join(', ') || 'No tags'}
                                  {project.tags?.length > 2 && ' ...'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{project.clientName || 'Unknown'}</td>
                          <td className="px-4 py-3 text-gray-500">{project.year || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {project.status || 'active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {project.displayOrder || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleFeatured(project.id)}
                              disabled={isProcessing}
                              className={`transition-colors ${
                                featuredProjects.has(project.id)
                                  ? 'text-yellow-500 hover:text-yellow-600'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              title={featuredProjects.has(project.id) ? "Remove from featured" : "Add to featured"}
                            >
                              <Star
                                size={18}
                                fill={featuredProjects.has(project.id) ? "currentColor" : "none"}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditProject(project.id)}
                              className="text-accent hover:text-accent/80"
                              title="Edit project"
                            >
                              <Edit size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {projects.length === 0 ? 'No projects in database' : 'No projects match your filters'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {projects.length === 0 ? 'Add a new project to get started.' : 'Try adjusting your search or category filter.'}
                </p>
                <Link 
                  to="/upload-project" 
                  className="inline-flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Plus size={18} />
                  Add New Project
                </Link>
              </div>
            )}

            {/* Bulk Actions Toolbar */}
            {selectedProjects.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
                <div className="container mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleBulkFeaturedToggle(true)}
                      className="px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors flex items-center gap-2"
                      disabled={isProcessing}
                    >
                      <Star size={18} />
                      <span>Add to Featured</span>
                    </button>
                    <button
                      onClick={() => handleBulkFeaturedToggle(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                      disabled={isProcessing}
                    >
                      <Star size={18} />
                      <span>Remove from Featured</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)?`)) {
                          setIsProcessing(true);
                          try {
                            const batch = writeBatch(db);
                            selectedProjects.forEach(projectId => {
                              const projectRef = doc(db, 'Projects', projectId);
                              batch.delete(projectRef);
                              
                              if (featuredProjects.has(projectId)) {
                                const featuredRef = doc(db, 'FeaturedProjects', projectId);
                                batch.delete(featuredRef);
                              }
                            });
                            await batch.commit();
                            setProjects(prev => prev.filter(p => !selectedProjects.includes(p.id)));
                            
                            const newFeaturedSet = new Set(featuredProjects);
                            selectedProjects.forEach(id => newFeaturedSet.delete(id));
                            setFeaturedProjects(newFeaturedSet);
                            
                            setSelectedProjects([]);
                            toast.success(`Successfully deleted ${selectedProjects.length} project(s)`, {
                              duration: 3000,
                              position: 'top-right'
                            });
                          } catch (error) {
                            console.error('Error deleting projects:', error);
                            toast.error('Failed to delete projects', { duration: 3000 });
                          } finally {
                            setIsProcessing(false);
                          }
                        }
                      }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isProcessing}
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 size={18} />
                        Delete
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value as 'active' | 'disabled' | '')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        disabled={isProcessing}
                        aria-label="Select bulk status"
                      >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                      </select>
                      <button
                        onClick={handleBulkStatusUpdate}
                        className="px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        disabled={isProcessing || !bulkStatus}
                      >
                        <div className="flex items-center gap-2">
                          <Check size={18} />
                          Apply
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reorder Modal */}
            {isReorderModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Reorder Projects</h2>
                    <button
                      onClick={() => setIsReorderModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Close modal"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                    <p className="text-gray-600 mb-4">Drag and drop projects to reorder them.</p>
                    {reorderedProjects.length === 0 ? (
                      <p className="text-gray-500 text-center">No projects available to reorder.</p>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                      >
                        <SortableContext
                          items={reorderedProjects.map((p) => p.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reorderedProjects.map((project, index) => (
                              <SortableItem key={project.id} project={project} index={index} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                  <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                    <button
                      onClick={() => setIsReorderModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveOrder}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                      disabled={isProcessing || reorderedProjects.length === 0}
                    >
                      {isProcessing ? (
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      ) : (
                        <Check size={18} />
                      )}
                      Save Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
                {error}
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </Auth>
  );
};

export default PortfolioManagement;