
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Calendar, User, Tag, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';

interface Project {
  title: string;
  category: string[];
  client: string;
  year: string;
  description: string;
  challenge: string;
  solution: string;
  mainImage: string;
  gallery: string[];
  videoUrl: string;
  results: string[];
  videoOrientation: 'Landscape' | 'Portrait';
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  
  // Image viewer states
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const projectTitle = location.state?.projectTitle as string | undefined;

  const isValidEmbedUrl = (url: string): boolean => {
    if (!url) return false;
    
    const patterns = [
      /^https:\/\/www\.youtube\.com\/embed\//,
      /^https:\/\/player\.vimeo\.com\/video\//,
      /^https:\/\/fast\.wistia\.net\/embed\/iframe\//,
      /^https:\/\/www\.dailymotion\.com\/embed\/video\//,
      /^https:\/\/drive\.google\.com\/uc\?export=view&id=.*/,
      /^https:\/\/drive\.google\.com\/file\/d\/.*\/preview/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        let docSnap = null;
        
        if (projectTitle) {
          const docRef = doc(db, "Projects", projectTitle);
          docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProject({
              title: projectTitle,
              category: data.tags || [],
              client: data.clientName || 'Unknown Client',
              year: data.year ? data.year.toString() : 'N/A',
              description: data.overview || '',
              challenge: data.Challenge || '',
              solution: data.Solution || '',
              mainImage: data.photo && data.photo.length > 0 ? data.photo[0] : "/api/placeholder/400/320",
              gallery: data.photo || [],
              videoUrl: data.videoURL || '',
              results: data.ProjectResult || [],
              videoOrientation: data.videoOrientation || 'Landscape'
            });
            return;
          }
        }
        
        const potentialTitles = [
          projectId!.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          projectId!.replace(/-/g, ' '),
          projectId!.replace(/-/g, ' ').toUpperCase(),
          projectId!.charAt(0).toUpperCase() + projectId!.slice(1).replace(/-/g, ' '),
          projectId!
        ];
        
        for (const title of potentialTitles) {
          const docRef = doc(db, "Projects", title);
          docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProject({
              title: title,
              category: data.tags || [],
              client: data.clientName || 'Unknown Client',
              year: data.year ? data.year.toString() : 'N/A',
              description: data.overview || '',
              challenge: data.Challenge || '',
              solution: data.Solution || '',
              mainImage: data.photo && data.photo.length > 0 ? data.photo[0] : "/api/placeholder/400/320",
              gallery: data.photo || [],
              videoUrl: data.videoURL || '',
              results: data.ProjectResult || [],
              videoOrientation: data.videoOrientation || 'Landscape'
            });
            return;
          }
        }
        
        setError('Project not found');
      } catch (err) {
        console.error("Error fetching project:", err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, projectTitle]);

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    if (url.includes('drive.google.com/uc?export=view&id=')) {
      return url;
    }
    
    const driveFileRegex = /https:\/\/drive\.google\.com\/file\/d\/(.*?)(?:\/view|\/preview)/;
    const driveMatch = url.match(driveFileRegex);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    
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
    
    return url;
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  };

  const closeImageViewer = () => {
    setViewerOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'auto';
  };

  const goToNextImage = () => {
    if (!project || !project.gallery || project.gallery.length <= 1) return;
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setCurrentImageIndex((prevIndex) => 
      prevIndex === project.gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = () => {
    if (!project || !project.gallery || project.gallery.length <= 1) return;
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? project.gallery.length - 1 : prevIndex - 1
    );
  };

  const zoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.5, 4));
  };

  const zoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.5, 1));
  };

  useEffect(() => {
    if (!viewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeImageViewer();
          break;
        case 'ArrowRight':
          goToNextImage();
          break;
        case 'ArrowLeft':
          goToPrevImage();
          break;
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewerOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanPosition({
        x: panPosition.x + deltaX,
        y: panPosition.y + deltaY
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      setPanPosition({
        x: panPosition.x + deltaX,
        y: panPosition.y + deltaY
      });
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link to="/portfolio" className="text-red-600 hover:text-red-700">
            Return to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Section */}
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src={project.mainImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center">
            <div className="container">
              <Link
                to="/portfolio"
                className="inline-flex items-center text-white mb-6 hover:text-red-500 transition-colors"
              >
                <ArrowLeft className="mr-2" size={20} />
                Back to Portfolio
              </Link>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-white">
                <div className="flex items-center">
                  <User className="mr-2" size={20} />
                  {project.client}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2" size={20} />
                  {project.year}
                </div>
                <div className="flex items-center">
                  <Tag className="mr-2" size={20} />
                  <div className="flex flex-wrap gap-2">
                    {project.category.length > 0 && (
                      project.category.map((tag, index) => (
                        <span key={index} className="bg-red-100/20 text-white text-xs px-2 py-1 rounded border border-white/30">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-16">
          {/* Project Overview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Project Overview</h2>
            <p className="text-gray-700">{project.description}</p>
          </div>

          {/* Three boxes in a row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">The Challenge</h3>
              <p className="text-gray-700">{project.challenge}</p>
            </div>
            
            <div className="bg-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Our Solution</h3>
              <p className="text-gray-700">{project.solution}</p>
            </div>
            
            <div className="bg-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Project Results</h3>
              <ul className="space-y-3">
                {project.results.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2" />
                    <span className="text-gray-700">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Video and Gallery Section */}
          {project.videoUrl && project.gallery.length > 0 ? (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Project Media</h2>
              {project.videoOrientation === 'Portrait' ? (
                <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                  {/* Video */}
                  <div className="flex flex-col items-center mb-8 md:mb-0">
                    <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg w-[320px]">
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-800/10 to-gray-800/30" />
                      <div className="relative mx-auto aspect-[9/16] my-4">
                        {videoError || !isValidEmbedUrl(project.videoUrl) ? (
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center p-6">
                              <Play className="mx-auto mb-4 text-gray-400" size={48} />
                              <p className="text-gray-600 font-medium">Video cannot be displayed</p>
                              <p className="text-gray-500 text-sm mt-2">The video URL may be invalid or unsupported.</p>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            src={getEmbedUrl(project.videoUrl) || undefined}
                            className="absolute inset-0 w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            onError={handleVideoError}
                          ></iframe>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Gallery */}
                  <div>
                    <p className="text-gray-600 mb-6">Click on any image to view in full screen mode</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:overflow-y-auto md:pr-2 md:max-h-[568px]">
                      {project.gallery.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => openImageViewer(index)}
                        >
                          <img
                            src={image}
                            alt={`${project.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="text-white" size={24} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-16">
                    <h3 className="text-2xl font-bold mb-4">Project Video</h3>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {videoError || !isValidEmbedUrl(project.videoUrl) ? (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                          <div className="text-center p-6">
                            <Play className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="text-gray-600 font-medium">Video cannot be displayed</p>
                            <p className="text-gray-500 text-sm mt-2">The video URL may be invalid or unsupported.</p>
                          </div>
                        </div>
                      ) : (
                        <iframe
                          src={getEmbedUrl(project.videoUrl) || undefined}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          onError={handleVideoError}
                        ></iframe>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Project Gallery</h3>
                    <p className="text-gray-600 mb-6">Click on any image to view in full screen mode</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {project.gallery.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => openImageViewer(index)}
                        >
                          <img
                            src={image}
                            alt={`${project.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="text-white" size={24} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {project.videoUrl && (
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8">Project Video</h2>
                  <div className={`relative ${project.videoOrientation === 'Portrait' ? 'mx-auto' : 'aspect-video bg-gray-100 rounded-lg overflow-hidden'}`}>
                    {project.videoOrientation === 'Portrait' && (
                      <div className="flex flex-col items-center">
                        <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg w-[320px]">
                          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/10 to-gray-800/30" />
                          <div className="relative mx-auto aspect-[9/16] my-4">
                            {videoError || !isValidEmbedUrl(project.videoUrl) ? (
                              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                                <div className="text-center p-6">
                                  <Play className="mx-auto mb-4 text-gray-400" size={48} />
                                  <p className="text-gray-600 font-medium">Video cannot be displayed</p>
                                  <p className="text-gray-500 text-sm mt-2">The video URL may be invalid or unsupported.</p>
                                </div>
                              </div>
                            ) : (
                              <iframe
                                src={getEmbedUrl(project.videoUrl) || undefined}
                                className="absolute inset-0 w-full h-full rounded-lg"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                onError={handleVideoError}
                              ></iframe>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {project.videoOrientation === 'Landscape' && (
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {videoError || !isValidEmbedUrl(project.videoUrl) ? (
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center p-6">
                              <Play className="mx-auto mb-4 text-gray-400" size={48} />
                              <p className="text-gray-600 font-medium">Video cannot be displayed</p>
                              <p className="text-gray-500 text-sm mt-2">The video URL may be invalid or unsupported.</p>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            src={getEmbedUrl(project.videoUrl) || undefined}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            onError={handleVideoError}
                          ></iframe>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {project.gallery.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-8">Project Gallery</h2>
                  <p className="text-gray-600 mb-6">Click on any image to view in full screen mode</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.gallery.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openImageViewer(index)}
                      >
                        <img
                          src={image}
                          alt={`${project.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <ZoomIn className="text-white" size={24} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Full Screen Image Viewer */}
        {viewerOpen && project.gallery[currentImageIndex] && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white hover:text-red-500 z-10"
              onClick={closeImageViewer}
            >
              <X size={32} />
            </button>
            
            {project.gallery.length > 1 && (
              <div>
                <button 
                  className="absolute left-4 md:left-8 text-white hover:text-red-500 z-10"
                  onClick={goToPrevImage}
                >
                  <ChevronLeft size={40} />
                </button>
                <button 
                  className="absolute right-4 md:right-8 text-white hover:text-red-500 z-10"
                  onClick={goToNextImage}
                >
                  <ChevronRight size={40} />
                </button>
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
              <button 
                className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-40"
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut size={24} />
              </button>
              <button 
                className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-40"
                onClick={zoomIn}
                disabled={zoomLevel >= 4}
              >
                <ZoomIn size={24} />
              </button>
            </div>
            
            <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {project.gallery.length}
            </div>
            
            <div 
              className="w-full h-full flex items-center justify-center overflow-hidden"
              style={{ cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={project.gallery[currentImageIndex]}
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
