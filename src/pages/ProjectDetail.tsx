import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Award, Calendar, User, Tag } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(false);
  
  // Get the project title if it was passed via location state
  const projectTitle = location.state?.projectTitle;

  // Function to validate if a URL is a proper embed URL
  const isValidEmbedUrl = (url) => {
    if (!url) return false;
    
    // Check for common video embed patterns
    const patterns = [
      /^https:\/\/www\.youtube\.com\/embed\//,
      /^https:\/\/player\.vimeo\.com\/video\//,
      /^https:\/\/fast\.wistia\.net\/embed\/iframe\//,
      /^https:\/\/www\.dailymotion\.com\/embed\/video\//,
      /^https:\/\/drive\.google\.com\/uc\?export=view&id=.*/,  // Google Drive direct view format
      /^https:\/\/drive\.google\.com\/file\/d\/.*\/preview/     // Google Drive preview format
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        let docSnap = null;
        
        // First, try to use the project title passed from portfolio page
        if (projectTitle) {
          const docRef = doc(db, "Projects", projectTitle);
          docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProject({
              title: projectTitle,
              category: data.tags || [], // Store all tags as an array
              client: data.clientName || 'Unknown Client',
              year: data.year ? data.year.toString() : 'N/A',
              description: data.overview || '',
              challenge: data.Challenge || '',
              solution: data.Solution || '',
              mainImage: data.photo && data.photo.length > 0 ? data.photo[0] : "/api/placeholder/400/320",
              gallery: data.photo || [],
              videoUrl: data.videoURL || '',
              results: data.ProjectResult || []
            });
            
            return; // Exit early if we found the project
          }
        }
        
        // If we don't have the title or it didn't work, try to convert projectId to a title
        // Convert kebab-case back to potential title formats
        const potentialTitles = [
          // Try direct conversion to title case
          projectId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          // Try with spaces
          projectId.replace(/-/g, ' '),
          // Try capitalized
          projectId.replace(/-/g, ' ').toUpperCase(),
          // Try capitalized first letter
          projectId.charAt(0).toUpperCase() + projectId.slice(1).replace(/-/g, ' '),
          // Try as is
          projectId
        ];
        
        // Try each potential title format
        for (const title of potentialTitles) {
          const docRef = doc(db, "Projects", title);
          docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProject({
              title: title,
              category: data.tags || [], // Store all tags as an array
              client: data.clientName || 'Unknown Client',
              year: data.year ? data.year.toString() : 'N/A',
              description: data.overview || '',
              challenge: data.Challenge || '',
              solution: data.Solution || '',
              mainImage: data.photo && data.photo.length > 0 ? data.photo[0] : "/api/placeholder/400/320",
              gallery: data.photo || [],
              videoUrl: data.videoURL || '',
              results: data.ProjectResult || []
            });
            
            return; // Exit if we found a match
          }
        }
        
        // If we get here, we couldn't find the project
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

  // Function to try converting a normal video URL to an embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Google Drive - direct view format
    if (url.includes('drive.google.com/uc?export=view&id=')) {
      return url; // Already in embed format
    }
    
    // Extract ID from Google Drive file URLs and convert to direct view format
    const driveFileRegex = /https:\/\/drive\.google\.com\/file\/d\/(.*?)(?:\/view|\/preview)/;
    const driveMatch = url.match(driveFileRegex);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    
    // YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:video\/|))(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Return the original URL if no conversion is possible
    return url;
  };

  const handleVideoError = () => {
    setVideoError(true);
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
                    {project.category && (
                      Array.isArray(project.category) ? 
                        project.category.map((tag, index) => (
                          <span key={index} className="bg-red-100/20 text-white text-xs px-2 py-1 rounded border border-white/30">
                            {tag}
                          </span>
                        )) : 
                        <span className="bg-red-100/20 text-white text-xs px-2 py-1 rounded border border-white/30">
                          {project.category}
                        </span>
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
            {/* The Challenge */}
            <div className="bg-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">The Challenge</h3>
              <p className="text-gray-700">{project.challenge}</p>
            </div>
            
            {/* Our Solution */}
            <div className="bg-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Our Solution</h3>
              <p className="text-gray-700">{project.solution}</p>
            </div>
            
            {/* Project Results */}
            <div className="bg-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Project Results</h3>
              <ul className="space-y-3">
                {project.results && project.results.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2" />
                    <span className="text-gray-700">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Video Section - Only show if videoUrl exists, with proper error handling */}
          {project.videoUrl && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Project Video</h2>
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
                    src={getEmbedUrl(project.videoUrl)}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    onError={handleVideoError}
                  ></iframe>
                )}
              </div>
            </div>
          )}

          {/* Gallery Section - Only show if there are images */}
          {project.gallery && project.gallery.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Project Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.gallery.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;