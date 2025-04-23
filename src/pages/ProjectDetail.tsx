import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Award, Calendar, User, Tag } from 'lucide-react';

// This would typically come from an API or database
const projectsData = {
  'ferrari-f8-tributo-launch': {
    title: "Ferrari F8 Tributo Launch",
    category: "Automotive",
    client: "Ferrari",
    year: "2023",
    description: "An immersive launch campaign that showcased the Ferrari F8 Tributo's revolutionary design and performance capabilities. The project involved multiple shooting locations across Italy, including the iconic Fiorano Circuit.",
    challenge: "Capture the essence of Ferrari's most powerful V8 supercar while maintaining the brand's luxury appeal and racing heritage.",
    solution: "We utilized cutting-edge camera technology and innovative shooting techniques to highlight the car's aerodynamic design and performance capabilities. The campaign included both static and dynamic shots, with particular emphasis on the vehicle's distinctive features.",
    mainImage: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    ],
    videoUrl: "https://player.vimeo.com/video/123456789",
    awards: ["Cannes Lions Gold", "Clio Award"],
    results: [
      "Over 50 million views across platforms",
      "200% increase in test drive requests",
      "Featured in top automotive publications"
    ]
  },
  'emirates-first-class': {
    title: "Emirates First Class Experience",
    category: "Travel",
    client: "Emirates",
    year: "2023",
    description: "A luxurious showcase of Emirates' first-class cabin experience, highlighting the unparalleled comfort and service that defines the airline's premium offering.",
    challenge: "Demonstrate the exclusive nature and attention to detail of Emirates' first-class service while capturing the emotional appeal of luxury travel.",
    solution: "Created a cinematic narrative that follows a passenger's journey, utilizing intimate camera work and sophisticated lighting to showcase the premium cabin's features.",
    mainImage: "https://images.unsplash.com/photo-1540339832862-474599807836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    ],
    videoUrl: "https://player.vimeo.com/video/123456789",
    awards: ["Webby Award"],
    results: [
      "40% increase in first-class bookings",
      "95% positive social media sentiment",
      "3 industry awards for creative excellence"
    ]
  }
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const project = projectsData[projectId as keyof typeof projectsData];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                  {project.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-16">
          {/* Project Overview - Now full width */}
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
            
            {/* Project Results - Awards removed */}
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

          {/* Video Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Project Video</h2>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={project.videoUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Gallery Section */}
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

          {/* Awards Section - Moved to its own section if needed */}
          {/* {project.awards && project.awards.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8">Awards</h2>
              <div className="flex flex-wrap gap-6">
                {project.awards.map((award, index) => (
                  <div key={index} className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-lg">
                    <Award className="text-red-600 mr-2" size={20} />
                    {award}
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;