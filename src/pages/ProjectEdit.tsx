
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Image, 
  Video, 
  AlertCircle,
  Check, 
  X, 
  ChevronsUpDown,
  Tag as TagIcon,
  Loader2,
  Upload,
  GripVertical
} from 'lucide-react';
import { gsap } from 'gsap';
import Papa from 'papaparse';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import toast, { Toaster } from 'react-hot-toast';

interface ProjectData {
  clientName: string;
  Challenge: string;
  Solution: string;
  ProjectResult: string[];
  overview: string;
  photo: string[];
  tags: string[];
  videoURL: string;
  year: number;
  videoOrientation: 'Landscape' | 'Portrait';
  status: 'active' | 'disabled';
}

const TAG_OPTIONS = [
  'Events',
  'Products',
  'Launches',
  'Delivery',
  'Concerts',
  'Aviation',
  'Automotive',
  'Architecture'
];

const ProjectEdit: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [originalProjectData, setOriginalProjectData] = useState<ProjectData | null>(null);
  
  // Form state
  const [projectTitle, setProjectTitle] = useState('');
  const [formData, setFormData] = useState<ProjectData>({
    clientName: '',
    Challenge: '',
    Solution: '',
    ProjectResult: [''],
    overview: '',
    photo: [''],
    tags: [],
    videoURL: '',
    year: new Date().getFullYear(),
    videoOrientation: 'Landscape',
    status: 'active'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        const docRef = doc(db, "Projects", projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<ProjectData>;
          
          const projectData: ProjectData = {
            clientName: data.clientName || '',
            Challenge: data.Challenge || '',
            Solution: data.Solution || '',
            ProjectResult: Array.isArray(data.ProjectResult) && data.ProjectResult.length > 0 ? 
              data.ProjectResult : [''],
            overview: data.overview || '',
            photo: Array.isArray(data.photo) && data.photo.length > 0 ? 
              data.photo : [''],
            tags: Array.isArray(data.tags) ? data.tags : [],
            videoURL: data.videoURL || '',
            year: data.year || new Date().getFullYear(),
            videoOrientation: data.videoOrientation || 'Landscape',
            status: data.status || 'active'
          };
          
          setOriginalProjectData(projectData);
          setProjectTitle(projectId);
          setFormData(projectData);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.edit-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.edit-title',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  // Handle CSV file upload for bulk photo URLs
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const urls = result.data
          .flat()
          .map(url => typeof url === 'string' ? url.trim() : '')
          .filter(url => url && /^https?:\/\/.*\.(jpg|jpeg|png|svg|webp)/i.test(url));
        
        if (urls.length === 0) {
          setError('No valid image URLs found in CSV');
          return;
        }

        setFormData(prev => ({
          ...prev,
          photo: [...prev.photo.filter(url => url.trim() !== ''), ...urls]
        }));
        
        setSuccessMessage('Photos added from CSV successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setError('Failed to parse CSV file');
      }
    });

    // Reset file input
    event.target.value = '';
  };

  // Handle drag and drop reordering for photos
  const onDragEndPhotos = (result: DropResult) => {
    if (!result.destination) return;

    setFormData(prev => {
      const newPhotos = [...prev.photo];
      const [reorderedItem] = newPhotos.splice(result.source.index, 1);
      newPhotos.splice(result.destination!.index, 0, reorderedItem);
      return { ...prev, photo: newPhotos };
    });
  };

  // Handle drag and drop reordering for results
  const onDragEndResults = (result: DropResult) => {
    if (!result.destination) return;

    setFormData(prev => {
      const newResults = [...prev.ProjectResult];
      const [reorderedItem] = newResults.splice(result.source.index, 1);
      newResults.splice(result.destination!.index, 0, reorderedItem);
      return { ...prev, ProjectResult: newResults };
    });
  };

  // Form field change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'year') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectTitle(e.target.value);
  };

  // Handle array field updates (photos, results)
  const handleArrayChange = (index: number, value: string, field: 'photo' | 'ProjectResult') => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  // Add new item to array fields
  const handleAddItem = (field: 'photo' | 'ProjectResult') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove item from array fields
  const handleRemoveItem = (index: number, field: 'photo' | 'ProjectResult') => {
    setFormData(prev => {
      if (prev[field].length <= 1) {
        return {
          ...prev,
          [field]: [''] 
        };
      }
      
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  // Process video URL for embed format
  const processVideoUrl = (url: string): string => {
    if (!url) return '';
    
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:video\/|))(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    const driveFileRegex = /https:\/\/drive\.google\.com\/file\/d\/(.*?)(?:\/view|\/preview)/;
    const driveMatch = url.match(driveFileRegex);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    
    return url;
  };

  // Save the project
  const handleSave = async () => {
    if (!projectId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Clean form data
      const cleanData = {
        ...formData,
        videoURL: processVideoUrl(formData.videoURL),
        photo: formData.photo.filter(url => url.trim() !== ''),
        ProjectResult: formData.ProjectResult.filter(result => result.trim() !== '')
      };
      
      if (cleanData.photo.length === 0) cleanData.photo = [];
      if (cleanData.ProjectResult.length === 0) cleanData.ProjectResult = [];

      // Validate title
      const newTitle = projectTitle.trim();
      if (!newTitle) {
        setError('Project title cannot be empty');
        setSaving(false);
        return;
      }

      // Check if title already exists
      const projectsCollection = collection(db, "Projects");
      const existingDocs = await getDocs(projectsCollection);
      const titleExists = existingDocs.docs.some(doc => doc.id === newTitle && doc.id !== projectId);
      if (titleExists) {
        setError('A project with this title already exists');
        setSaving(false);
        return;
      }

      const batch = writeBatch(db);

      if (newTitle !== projectId) {
        // Create new document with new title
        const newDocRef = doc(db, "Projects", newTitle);
        batch.set(newDocRef, cleanData);

        // Delete old document
        const oldDocRef = doc(db, "Projects", projectId);
        batch.delete(oldDocRef);
      } else {
        // Update existing document
        const docRef = doc(db, "Projects", projectId);
        batch.update(docRef, cleanData);
      }

      // Commit batch
      await batch.commit();
      
      toast.success('Project updated successfully!', {
        duration: 3000,
        position: 'top-right'
      });
      
      navigate('/portfolio-management');
    } catch (err) {
      console.error("Error updating project:", err);
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  // Delete the project
  const handleDelete = async () => {
    if (!projectId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const docRef = doc(db, "Projects", projectId);
      await deleteDoc(docRef);
      
      navigate('/portfolio-management');
    } catch (err) {
      console.error("Error deleting project:", err);
      setError('Failed to delete project');
      setSaving(false);
    }
  };

  // Preview video embed
  const getVideoPreview = () => {
    if (!formData.videoURL) return null;
    
    const embedUrl = processVideoUrl(formData.videoURL);
    
    const isValidEmbedUrl = /^https:\/\/(www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/|drive\.google\.com\/uc\?export=view&id=|drive\.google\.com\/file\/d\/.*\/preview)/.test(embedUrl);
    
    if (!isValidEmbedUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Video className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-500 text-sm">Invalid video URL</p>
          </div>
        </div>
      );
    }
    
    return (
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error === 'Project not found') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link 
            to="/portfolio-management" 
            className="text-accent hover:text-accent/80"
          >
            Return to Portfolio Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <Toaster />
      <section ref={sectionRef} className="bg-white py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container max-w-5xl"
        >
          <Link
            to="/portfolio-management"
            className="inline-flex items-center text-gray-600 mb-6 hover:text-accent transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Portfolio Management
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="edit-title text-4xl md:text-5xl font-bold mb-6">
              <div className="overflow-hidden">
                <span>Edit </span><span className="text-accent">{projectTitle}</span>
              </div>
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <Check size={18} />
              {successMessage}
            </div>
          )}

          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={handleTitleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    aria-label="Select project status"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      <TagIcon size={16} className="mr-2 text-gray-500" />
                      {formData.tags.length > 0 ? (
                        formData.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Select tags...</span>
                      )}
                    </div>
                    <ChevronsUpDown size={16} className="text-gray-500" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
                      <div className="max-h-60 overflow-auto p-1">
                        {TAG_OPTIONS.map((tag) => (
                          <div
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded hover:bg-gray-100 ${
                              formData.tags.includes(tag) ? 'bg-gray-100' : ''
                            }`}
                          >
                            <div className="flex-shrink-0 h-4 w-4 border rounded flex items-center justify-center">
                              {formData.tags.includes(tag) && (
                                <Check size={12} className="text-accent" />
                              )}
                            </div>
                            <span>{tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Challenge & Solution</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">The Challenge</label>
                <textarea
                  name="Challenge"
                  value={formData.Challenge}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">The Solution</label>
                <textarea
                  name="Solution"
                  value={formData.Solution}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-2xl font-bold text-gray-800">
                  Project Results (Drag to reorder)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddItem('ProjectResult')}
                  className="flex items-center gap-1 text-accent hover:text-accent/80 text-sm"
                >
                  <Plus size={16} />
                  Add Result
                </button>
              </div>
              
              <DragDropContext onDragEnd={onDragEndResults}>
                <Droppable droppableId="results">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
                    >
                      {formData.ProjectResult.map((result, index) => (
                        <Draggable
                          key={`result-${index}`}
                          draggableId={`result-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex gap-2 p-2 rounded-lg border transition-all ${
                                snapshot.isDragging
                                  ? 'bg-gray-200 opacity-80 shadow-lg'
                                  : 'bg-white border-gray-200'
                              } cursor-grab active:cursor-grabbing`}
                            >
                              <GripVertical size={20} className="text-gray-400 flex-shrink-0 mt-3" />
                              <input
                                type="text"
                                value={result}
                                onChange={(e) => handleArrayChange(index, e.target.value, 'ProjectResult')}
                                placeholder="Enter a project result"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index, 'ProjectResult')}
                                className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove result"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Media</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Orientation</label>
                <select
                  name="videoOrientation"
                  value={formData.videoOrientation}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="Landscape">Landscape</option>
                  <option value="Portrait">Portrait</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo, or Google Drive)</label>
                <input
                  type="text"
                  name="videoURL"
                  value={formData.videoURL}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                
                {formData.videoURL && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Video Preview:</p>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {getVideoPreview()}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Photo Gallery (Drag to reorder)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddItem('photo')}
                      className="flex items-center gap-1 text-accent hover:text-accent/80 text-sm"
                    >
                      <Plus size={16} />
                      Add Photo
                    </button>
                    <label className="flex items-center gap-1 text-accent hover:text-accent/80 text-sm cursor-pointer">
                      <Upload size={16} />
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                <DragDropContext onDragEnd={onDragEndPhotos}>
                  <Droppable droppableId="photos">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
                      >
                        {formData.photo.map((photo, index) => (
                          <Draggable
                            key={`photo-${index}`}
                            draggableId={`photo-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-2 rounded-lg border transition-all ${
                                  snapshot.isDragging
                                    ? 'bg-gray-200 opacity-80 shadow-lg'
                                    : 'bg-white border-gray-200'
                                } cursor-grab active:cursor-grabbing`}
                              >
                                <div className="col-span-3 flex items-center gap-2">
                                  <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
                                  <input
                                    type="text"
                                    value={photo}
                                    onChange={(e) => handleArrayChange(index, e.target.value, 'photo')}
                                    placeholder="Enter photo URL"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                    {photo ? (
                                      <img 
                                        src={photo} 
                                        alt={`Preview ${index + 1}`} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/api/placeholder/200/200';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <Image size={20} className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index, 'photo')}
                                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove photo"
                                  >
                                    <X size={20} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                Save Changes
              </button>
              
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                  Delete Project
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProjectEdit;
