import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, enableIndexedDbPersistence, getDocsFromCache, QuerySnapshot, writeBatch, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { Edit, Search, Filter, Trash2, Plus, Check, X, Star, LayoutGrid, Tag, ArrowUp, ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';
import toast, { Toaster } from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortField = 'id' | 'year' | 'clientName' | 'status' | 'displayOrder';
type SortDirection = 'asc' | 'desc';

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

interface Tag {
  id: string;
  count: number;
  createdAt: string;
}

import Auth from '@/components/Auth';

const PortfolioManagement: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
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
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [deleteTagProjects, setDeleteTagProjects] = useState<Project[]>([]);
  const [sortField, setSortField] = useState<SortField>('displayOrder');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch projects and tags from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tags
        const tagsCollection = collection(db, "TAGS");
        const tagsSnapshot = await getDocs(tagsCollection);
        const tagsList: Tag[] = [];
        tagsSnapshot.forEach(doc => {
          const data = doc.data();
          tagsList.push({
            id: doc.id,
            count: data.count || 0,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });
        setTags(tagsList.sort((a, b) => a.id.localeCompare(b.id)));
        console.log('Fetched tags:', tagsList);

        // Fetch projects
        const projectsCollection = collection(db, "Projects");
        const q = query(projectsCollection, orderBy("year", "desc"));

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
          console.log('Serving projects from cache');
          processSnapshot(cachedSnapshot);
        }

        // Then get fresh data from server
        const freshSnapshot = await getDocs(q);
        console.log('Serving projects from server');
        processSnapshot(freshSnapshot);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      // Only show active projects in the reorder modal
      const activeProjects = projects
        .filter(p => p.status === 'active')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setReorderedProjects(activeProjects);
    }
  }, [isReorderModalOpen, projects]);

  // Filter and sort projects based on active category, search term, and sort settings
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
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = (a.id || '').localeCompare(b.id || '');
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'clientName':
          comparison = (a.clientName || '').localeCompare(b.clientName || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'displayOrder':
          comparison = (a.displayOrder || 0) - (b.displayOrder || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
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

  // Update TAGS collection based on active projects
  const updateTagsCollection = async (projects: Project[]) => {
    try {
      const batch = writeBatch(db);
      const tagsCollection = collection(db, "TAGS");

      // Get all tags from active projects (excluding "All")
      const activeProjects = projects.filter(p => p.status === 'active' || !p.status);
      const tagCounts = new Map<string, number>();
      activeProjects.forEach(project => {
        if (project.tags) {
          project.tags.forEach(tag => {
            if (tag !== 'All') {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
          });
        }
      });

      // Fetch existing tags
      const tagsSnapshot = await getDocs(tagsCollection);
      const existingTags = new Set<string>();
      tagsSnapshot.forEach(doc => existingTags.add(doc.id));

      // Add or update tags in TAGS collection
      tagCounts.forEach((count, tag) => {
        const tagRef = doc(db, 'TAGS', tag);
        batch.set(tagRef, {
          id: tag,
          count,
          createdAt: existingTags.has(tag) ? tagsSnapshot.docs.find(doc => doc.id === tag)?.data().createdAt || new Date().toISOString() : new Date().toISOString()
        }, { merge: true });
      });

      // Remove tags no longer used by active projects
      existingTags.forEach(tag => {
        if (!tagCounts.has(tag)) {
          const tagRef = doc(db, 'TAGS', tag);
          batch.delete(tagRef);
        }
      });

      await batch.commit();
      console.log('TAGS collection updated:', Object.fromEntries(tagCounts));

      // Refresh tags list
      const newTagsSnapshot = await getDocs(tagsCollection);
      const newTagsList: Tag[] = [];
      newTagsSnapshot.forEach(doc => {
        const data = doc.data();
        newTagsList.push({
          id: doc.id,
          count: data.count || 0,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      setTags(newTagsList.sort((a, b) => a.id.localeCompare(b.id)));
    } catch (error) {
      console.error('Error updating TAGS collection:', error);
      toast.error('Failed to update tags', { duration: 3000 });
    }
  };

  // Handle tag creation
  const handleCreateTag = async () => {
    if (!newTag.trim()) {
      toast.error('Tag name cannot be empty', { duration: 3000 });
      return;
    }

    const normalizedTag = newTag.trim();
    if (tags.some(tag => tag.id.toLowerCase() === normalizedTag.toLowerCase())) {
      toast.error('Tag already exists', { duration: 3000 });
      return;
    }

    try {
      setIsProcessing(true);
      const tagRef = doc(db, 'TAGS', normalizedTag);
      await setDoc(tagRef, {
        id: normalizedTag,
        count: 0,
        createdAt: new Date().toISOString()
      });
      setTags([...tags, { id: normalizedTag, count: 0, createdAt: new Date().toISOString() }].sort((a, b) => a.id.localeCompare(b.id)));
      setNewTag('');
      toast.success(`Tag "${normalizedTag}" created`, { duration: 3000 });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag', { duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle tag deletion preparation
  const prepareDeleteTag = (tagId: string) => {
    const affectedProjects = projects.filter(project => 
      (project.status === 'active' || !project.status) && 
      project.tags?.includes(tagId)
    );
    setDeleteTagProjects(affectedProjects);
    setDeleteTag(tagId);
  };

  // Handle tag deletion
  const handleDeleteTag = async () => {
    if (!deleteTag) return;

    try {
      setIsProcessing(true);
      const batch = writeBatch(db);

      // Update affected projects to have tags: ["All"]
      deleteTagProjects.forEach(project => {
        const projectRef = doc(db, 'Projects', project.id);
        batch.update(projectRef, {
          tags: ['All'],
          updatedAt: new Date()
        });
      });

      // Delete the tag
      const tagRef = doc(db, 'TAGS', deleteTag);
      batch.delete(tagRef);

      await batch.commit();

      // Update local state
      const updatedProjects = projects.map(project => {
        if (deleteTagProjects.some(p => p.id === project.id)) {
          return { ...project, tags: ['All'], updatedAt: new Date() };
        }
        return project;
      });
      setProjects(updatedProjects);
      setTags(tags.filter(tag => tag.id !== deleteTag));
      setDeleteTag(null);
      setDeleteTagProjects([]);
      toast.success(`Tag "${deleteTag}" deleted and ${deleteTagProjects.length} project(s) updated`, { duration: 3000 });
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag', { duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
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

      // Get current active projects and their display orders
      const activeProjects = projects.filter(p => p.status === 'active' && !selectedProjects.includes(p.id));
      const maxDisplayOrder = activeProjects.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);

      if (bulkStatus === 'active') {
        // Add new projects to the end of the order
        selectedProjects.forEach((projectId, index) => {
          const projectRef = doc(db, 'Projects', projectId);
          batch.update(projectRef, {
            status: bulkStatus,
            displayOrder: maxDisplayOrder + index + 1,
            updatedAt: new Date()
          });
        });
      } else {
        // Remove display order when deactivating
        selectedProjects.forEach(projectId => {
          const projectRef = doc(db, 'Projects', projectId);
          batch.update(projectRef, {
            status: bulkStatus,
            displayOrder: 0,
            updatedAt: new Date()
          });
        });
      }

      await batch.commit();

      const updatedProjects = projects.map(p => {
        if (selectedProjects.includes(p.id)) {
          if (bulkStatus === 'active') {
            const index = selectedProjects.indexOf(p.id);
            return {
              ...p,
              status: bulkStatus,
              displayOrder: maxDisplayOrder + index + 1,
              updatedAt: new Date()
            };
          } else {
            return {
              ...p,
              status: bulkStatus,
              displayOrder: 0,
              updatedAt: new Date()
            };
          }
        }
        return p;
      });

      setProjects(updatedProjects);
      console.log('Updated projects after status change:', updatedProjects);

      // Update TAGS collection
      await updateTagsCollection(updatedProjects);

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

  // Handle project deletion with tag update
  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)?`)) {
      return;
    }

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

      const updatedProjects = projects.filter(p => !selectedProjects.includes(p.id));
      setProjects(updatedProjects);

      const newFeaturedSet = new Set(featuredProjects);
      selectedProjects.forEach(id => newFeaturedSet.delete(id));
      setFeaturedProjects(newFeaturedSet);

      // Update TAGS collection
      await updateTagsCollection(updatedProjects);

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
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSaveOrder = async () => {
    if (reorderedProjects.length === 0) {
      toast.error('No active projects to reorder', { duration: 3000 });
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

      const updatedProjects = projects.map(p => {
        const updatedProject = reorderedProjects.find(rp => rp.id === p.id);
        return updatedProject ? { ...p, displayOrder: reorderedProjects.indexOf(updatedProject) + 1, updatedAt: new Date() } : p;
      });
      setProjects(updatedProjects);

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

            {/* Action Bar - Search, Add Project, Reorder Button, Manage Tags */}
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
                  onClick={() => setIsTagModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isProcessing}
                >
                  <Tag size={18} />
                  Manage Tags
                </button>
                <button
                  onClick={() => setIsReorderModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isProcessing}
                >
                  <LayoutGrid size={18} />
                  Reorder Projects
                </button>
                <Link
                  to="/upload-project"
                  className="flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Plus size={18} />
                  Add New Project
                </Link>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-4">
              {["All", ...tags.map(tag => tag.id)].map((category, index) => (
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
                        <th 
                          className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center gap-1">
                            Project
                            {sortField === 'id' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('clientName')}
                        >
                          <div className="flex items-center gap-1">
                            Client
                            {sortField === 'clientName' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('year')}
                        >
                          <div className="flex items-center gap-1">
                            Year
                            {sortField === 'year' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('displayOrder')}
                        >
                          <div className="flex items-center gap-1">
                            Order
                            {sortField === 'displayOrder' && (
                              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            )}
                          </div>
                        </th>
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
                      onClick={handleBulkDelete}
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

            {/* Tag Management Modal */}
            {isTagModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full flex flex-col">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Manage Tags</h2>
                    <button
                      onClick={() => {
                        setIsTagModalOpen(false);
                        setNewTag('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                      title="Close modal"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <label htmlFor="newTag" className="block text-sm font-medium text-gray-700 mb-2">
                        Add New Tag
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="newTag"
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Enter tag name"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          disabled={isProcessing}
                        />
                        <button
                          onClick={handleCreateTag}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                          disabled={isProcessing}
                        >
                          <Plus size={18} />
                          Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Tags</h3>
                      {tags.length === 0 ? (
                        <p className="text-gray-500 text-center">No tags available</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {tags.map(tag => (
                            <div key={tag.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{tag.id}</span>
                              <button
                                onClick={() => prepareDeleteTag(tag.id)}
                                className="text-red-600 hover:text-red-800"
                                title={`Delete tag ${tag.id}`}
                                disabled={isProcessing}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => {
                        setIsTagModalOpen(false);
                        setNewTag('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Tag Confirmation Modal */}
            {deleteTag && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full flex flex-col">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Delete Tag</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to delete the tag <strong>{deleteTag}</strong>?
                    </p>
                    <p className="text-gray-7
                    00 mb-4">
                      This will affect {deleteTagProjects.length} project{deleteTagProjects.length !== 1 ? 's' : ''}:
                    </p>
                    {deleteTagProjects.length > 0 ? (
                      <ul className="list-disc pl-5 mb-4 text-gray-600">
                        {deleteTagProjects.map(project => (
                          <li key={project.id}>{project.id}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 mb-4">No projects are using this tag.</p>
                    )}
                    <p className="text-gray-700">
                      Affected projects will be updated to have the tag "All".
                    </p>
                  </div>
                  <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setDeleteTag(null);
                        setDeleteTagProjects([]);
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteTag}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Delete
                    </button>
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
                      <p className="text-gray-500 text-center">No active projects available to reorder.</p>
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