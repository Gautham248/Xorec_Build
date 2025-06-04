import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Calendar, User, Tag, ZoomIn } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [videoError, setVideoError] = useState(false);

  const projectTitle = location.state?.projectTitle as string | undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      const titleCandidates = [
        projectTitle,
        projectId?.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        projectId?.replace(/-/g, ' '),
        projectId?.replace(/-/g, ' ').toUpperCase(),
        projectId?.charAt(0).toUpperCase() + projectId?.slice(1).replace(/-/g, ' ')
      ].filter(Boolean);

      for (const title of titleCandidates) {
        const ref = doc(db, 'Projects', title!);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProject({
            title: title!,
            category: data.tags || [],
            client: data.clientName || 'Unknown Client',
            year: data.year?.toString() || 'N/A',
            description: data.overview || '',
            challenge: data.Challenge || '',
            solution: data.Solution || '',
            mainImage: data.photo?.[0] || '/api/placeholder/400/320',
            gallery: data.photo || [],
            videoUrl: data.videoURL || '',
            results: data.ProjectResult || [],
            videoOrientation: data.videoOrientation || 'Landscape'
          });
          return;
        }
      }
    };
    fetchProject();
  }, [projectId, projectTitle]);

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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || zoomLevel === 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPanPosition(pos => ({
      x: pos.x + clientX - dragStart.x,
      y: pos.y + clientY - dragStart.y
    }));
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => setIsDragging(false);

    const getGridColumns = () => {
    const sections = [
      project.challenge,
      project.solution,
      project.results.length > 0
    ].filter(Boolean).length;

    switch (sections) {
      case 3:
        return 'md:grid-cols-3';
      case 2:
        return 'md:grid-cols-2';
      default:
        return '';
    }
  };

  if (!project) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="pt-20 bg-white">
      <div className="relative h-[60vh] overflow-hidden">
        <img src={project.mainImage} className="w-full h-full object-cover" alt={project.title} />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center p-6">
          <div>
            <Link to="/portfolio" className="text-white flex items-center mb-4"><ArrowLeft className="mr-2" />Back</Link>
            <h1 className="text-4xl font-bold text-white">{project.title}</h1>
            <div className="flex gap-6 mt-4 text-white">
              <span><User className="inline mr-1" />{project.client}</span>
              <span><Calendar className="inline mr-1" />{project.year}</span>
              <span><Tag className="inline mr-1" />{project.category.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12">
        {project.description && (
          <p className="mb-8 text-gray-700">{project.description}</p>
        )}

        {(project.challenge || project.solution || project.results.length > 0) && (
          <div className={`grid grid-cols-1 ${getGridColumns()} gap-6 mb-16`}>
            {project.challenge && (
              <div className="bg-gray-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">The Challenge</h3>
                <p className="text-gray-700">{project.challenge}</p>
              </div>
            )}
            
            {project.solution && (
              <div className="bg-gray-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Our Solution</h3>
                <p className="text-gray-700">{project.solution}</p>
              </div>
            )}
            
            {project.results.length > 0 && (
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
            )}
          </div>
        )}

        {project.videoUrl && project.videoOrientation === 'Portrait' && project.gallery.length > 0 ? (
          <div className="mb-16 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4 mx-auto w-full max-w-[320px]">
              <h2 className="text-2xl font-bold mb-4">Project Video</h2>
              <div className="relative overflow-hidden rounded-lg aspect-[9/16] max-h-[480px]">
                <iframe
                  src={project.videoUrl}
                  title={`${project.title} Video`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:max-h-[480px] md:overflow-y-auto md:pr-4">
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
                      src={`${image}?tr=w-400`}
                      data-full={image}
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
            {project.videoUrl && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Project Video</h2>
                <div className="relative overflow-hidden rounded-lg aspect-video max-w-4xl mx-auto max-h-[600px]">
                  <iframe
                    src={project.videoUrl}
                    title={`${project.title} Video`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {project.gallery.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                        src={`${image}?tr=w-400`}
                        data-full={image}
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

      <Lightbox
        open={viewerOpen}
        close={closeImageViewer}
        slides={project.gallery.map(image => ({ src: image.split('?')[0] }))}
        index={currentImageIndex}
      />
    </div>
  );
};

export default ProjectDetail;