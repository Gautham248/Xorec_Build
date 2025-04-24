import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';
import { FilePlus, Check, ChevronsUpDown } from 'lucide-react';
import { gsap } from 'gsap';

interface ProjectFormData {
  title: string;
  challenge: string;
  solution: string;
  projectResult: string;
  clientName: string;
  overview: string;
  photo: string;
  tags: string[];
  videoURL: string;
  year: string;
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

const UploadProject: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    challenge: '',
    solution: '',
    projectResult: '',
    clientName: '',
    overview: '',
    photo: '',
    tags: [],
    videoURL: '',
    year: ''
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.upload-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.upload-title',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleUpload = async () => {
    const {
      title, challenge, solution, projectResult,
      clientName, overview, photo, tags, videoURL, year
    } = formData;

    if (!title) {
      alert('Title is required');
      return;
    }

    const data = {
      Challenge: challenge,
      Solution: solution,
      ProjectResult: projectResult.split(',').map(item => item.trim()),
      clientName,
      overview,
      photo: photo.split(',').map(link => link.trim()),
      tags: tags,
      videoURL,
      year: parseInt(year) || 0
    };

    try {
      await setDoc(doc(db, 'Projects', title), data);
      alert('Project uploaded successfully!');
      setFormData({
        title: '',
        challenge: '',
        solution: '',
        projectResult: '',
        clientName: '',
        overview: '',
        photo: '',
        tags: [],
        videoURL: '',
        year: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to upload project');
    }
  };

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
            <h1 className="upload-title text-5xl md:text-6xl font-bold mb-6">
              <div className="overflow-hidden">
                <span className="text-accent">Upload</span> <span>Your Project</span>
              </div>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Fill in the details of your project to add it to the database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              { name: 'title', label: 'Title' },
              { name: 'clientName', label: 'Client Name' },
              { name: 'year', label: 'Year' },
              { name: 'videoURL', label: 'Video URL' },
              { name: 'photo', label: 'Photo URLs (comma separated)' },
              { name: 'projectResult', label: 'Project Results (comma separated)' }
            ].map(({ name, label }) => (
              <div key={name} className="flex flex-col">
                <label className="font-medium mb-2 text-gray-800">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name as keyof ProjectFormData] as string}
                  onChange={handleChange}
                  className="border p-3 rounded-md shadow-sm"
                />
              </div>
            ))}

            {/* Tags Dropdown */}
            <div className="flex flex-col">
              <label className="font-medium mb-2 text-gray-800">Tags</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between border p-3 rounded-md shadow-sm bg-white"
                >
                  <span>
                    {formData.tags.length > 0
                      ? formData.tags.join(', ')
                      : 'Select tags...'}
                  </span>
                  <ChevronsUpDown size={16} className="opacity-70" />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              { name: 'challenge', label: 'Challenge' },
              { name: 'solution', label: 'Solution' },
              { name: 'overview', label: 'Overview' }
            ].map(({ name, label }) => (
              <div key={name} className="flex flex-col">
                <label className="font-medium mb-2 text-gray-800">{label}</label>
                <textarea
                  name={name}
                  rows={4}
                  value={formData[name as keyof ProjectFormData] as string}
                  onChange={handleChange}
                  className="border p-3 rounded-md shadow-sm"
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleUpload}
              className="bg-accent text-white px-6 py-3 rounded-lg shadow-md inline-flex items-center gap-2"
            >
              <FilePlus size={18} /> Upload Project
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default UploadProject;