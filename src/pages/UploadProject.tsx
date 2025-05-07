
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';
import {
  FilePlus,
  Check,
  ChevronsUpDown,
  Upload,
  FileText,
  AlertCircle,
  Plus,
  X,
  GripVertical,
  Image,
} from 'lucide-react';
import { gsap } from 'gsap';
import Papa from 'papaparse';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface ProjectFormData {
  title: string;
  challenge: string;
  solution: string;
  projectResult: string[];
  clientName: string;
  overview: string;
  photo: string[];
  tags: string[];
  videoURL: string;
  year: string;
  videoOrientation: 'Landscape' | 'Portrait';
  status: 'active' | 'disabled';
}

interface CSVProjectData {
  'Project Name': string;
  Description: string;
  Challenges: string;
  Solution: string;
  Results: string;
  Year: string;
  'Client Name': string;
  'Video Link': string;
  'Photo Link': string;
  Tags: string;
  'Video Orientation'?: string;
  Status?: string;
}

const TAG_OPTIONS = [
  'Events',
  'Products',
  'Films',
  'Launches',
  'Delivery',
  'Concerts',
  'Aviation',
  'Automotive',
  'Architecture',
];

const REQUIRED_CSV_HEADERS = [
  'Project Name',
  'Description',
  'Challenges',
  'Solution',
  'Results',
  'Year',
  'Client Name',
  'Video Link',
  'Photo Link',
  'Tags',
];

const UploadProject: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvData, setCsvData] = useState<CSVProjectData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    challenge: '',
    solution: '',
    projectResult: [''],
    clientName: '',
    overview: '',
    photo: [''],
    tags: [],
    videoURL: '',
    year: '',
    videoOrientation: 'Landscape',
    status: 'active',
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
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index: number, value: string, field: 'photo' | 'projectResult') => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddItem = (field: 'photo' | 'projectResult') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleRemoveItem = (index: number, field: 'photo' | 'projectResult') => {
    setFormData((prev) => {
      if (prev[field].length <= 1) {
        return {
          ...prev,
          [field]: [''],
        };
      }
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const onDragEndPhotos = (result: DropResult) => {
    if (!result.destination) return;

    setFormData((prev) => {
      const newPhotos = [...prev.photo];
      const [reorderedItem] = newPhotos.splice(result.source.index, 1);
      newPhotos.splice(result.destination!.index, 0, reorderedItem);
      return { ...prev, photo: newPhotos };
    });
  };

  const onDragEndResults = (result: DropResult) => {
    if (!result.destination) return;

    setFormData((prev) => {
      const newResults = [...prev.projectResult];
      const [reorderedItem] = newResults.splice(result.source.index, 1);
      newResults.splice(result.destination!.index, 0, reorderedItem);
      return { ...prev, projectResult: newResults };
    });
  };

  const validateCSVHeaders = (headers: string[]): boolean => {
    return REQUIRED_CSV_HEADERS.every((header) => headers.includes(header));
  };

  const convertVideoUrl = (url: string): string => {
    if (!url || url === 'NIL' || url.trim() === '') return '';

    // YouTube URL conversion
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo URL conversion
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:video\/|))([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Google Drive URL conversion
    const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)(?:\/view|\/preview|\?usp=sharing)?/;
    const driveMatch = url.match(driveRegex);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // If URL is already an embed URL, return as is
    if (url.includes('/embed/') || url.includes('/video/')) {
      return url;
    }

    return url;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError('No file selected');
      return;
    }

    Papa.parse<CSVProjectData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        if (!validateCSVHeaders(headers)) {
          setError('Invalid CSV format. Required headers: ' + REQUIRED_CSV_HEADERS.join(', '));
          setCsvData([]);
          if (csvInputRef.current) csvInputRef.current.value = '';
          return;
        }

        const data = results.data;
        if (data.length === 0) {
          setError('CSV file contains no valid project data');
          setCsvData([]);
          if (csvInputRef.current) csvInputRef.current.value = '';
          return;
        }

        // Validate and normalize status field
        const normalizedData = data.map((project) => ({
          ...project,
          Status: project.Status && ['active', 'disabled'].includes(project.Status.toLowerCase())
            ? project.Status.toLowerCase()
            : 'active',
        }));

        setCsvData(normalizedData);
        setError(null);

        // Preview the first record
        if (normalizedData.length > 0) {
          const videoOrientation = normalizedData[0]['Video Orientation'] === 'Portrait' ? 'Portrait' : 'Landscape';
          const status = normalizedData[0].Status && ['active', 'disabled'].includes(normalizedData[0].Status)
            ? normalizedData[0].Status as 'active' | 'disabled'
            : 'active';
          setFormData({
            title: normalizedData[0]['Project Name'] || '',
            challenge: normalizedData[0]['Challenges'] || '',
            solution: normalizedData[0]['Solution'] || '',
            projectResult: normalizedData[0]['Results']
              ? normalizedData[0]['Results'].split(',').map((item) => item.trim())
              : [''],
            clientName: normalizedData[0]['Client Name'] || '',
            overview: normalizedData[0]['Description'] || '',
            photo:
              normalizedData[0]['Photo Link'] && normalizedData[0]['Photo Link'] !== 'NIL'
                ? normalizedData[0]['Photo Link'].split(',').map((link) => link.trim())
                : [''],
            tags:
              normalizedData[0]['Tags'] && normalizedData[0]['Tags'] !== 'NIL'
                ? normalizedData[0]['Tags'].split(',').map((tag) => tag.trim())
                : [],
            videoURL: convertVideoUrl(normalizedData[0]['Video Link']),
            year: normalizedData[0]['Year'] || '',
            videoOrientation,
            status,
          });
        }
      },
      error: (err) => {
        setError('Failed to parse CSV file: ' + err.message);
        setCsvData([]);
        if (csvInputRef.current) csvInputRef.current.value = '';
      },
    });
  };

  const checkProjectExists = async (projectName: string): Promise<boolean> => {
    const docRef = doc(db, 'Projects', projectName);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };

  const validateSingleProject = (data: ProjectFormData): string | null => {
    if (!data.title) return 'Title is required';
    if (!data.clientName) return 'Client Name is required';
    if (!data.year) return 'Year is required';
    if (!/^\d{4}$/.test(data.year)) return 'Year must be a valid 4-digit number';
    return null;
  };

  const handleUploadSingle = async () => {
    const validationError = validateSingleProject(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const exists = await checkProjectExists(formData.title);
      if (exists) {
        setError(`Project "${formData.title}" already exists in the database`);
        return;
      }

      const data = {
        Challenge: formData.challenge,
        Solution: formData.solution,
        ProjectResult: formData.projectResult.filter((item) => item.trim() !== ''),
        clientName: formData.clientName,
        overview: formData.overview,
        photo: formData.photo.filter((link) => link.trim() !== ''),
        tags: formData.tags,
        videoURL: convertVideoUrl(formData.videoURL),
        year: parseInt(formData.year) || 0,
        videoOrientation: formData.videoOrientation,
        status: formData.status,
      };

      await setDoc(doc(db, 'Projects', formData.title), data);
      setSuccessMessage('Project uploaded successfully!');
      setFormData({
        title: '',
        challenge: '',
        solution: '',
        projectResult: [''],
        clientName: '',
        overview: '',
        photo: [''],
        tags: [],
        videoURL: '',
        year: '',
        videoOrientation: 'Landscape',
        status: 'active',
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload project');
    }
  };

  const handleBulkUpload = async () => {
    if (!csvData.length) {
      setError('No CSV data to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const batch = writeBatch(db);
      let totalUploaded = 0;
      let skippedProjects: string[] = [];

      for (const project of csvData) {
        if (!project['Project Name']) continue;

        const exists = await checkProjectExists(project['Project Name']);
        if (exists) {
          skippedProjects.push(project['Project Name']);
          continue;
        }

        const projectRef = doc(db, 'Projects', project['Project Name']);
        const videoOrientation =
          project['Video Orientation'] === 'Portrait' ? 'Portrait' : 'Landscape';
        const status = project.Status && ['active', 'disabled'].includes(project.Status.toLowerCase())
          ? project.Status.toLowerCase() as 'active' | 'disabled'
          : 'active';

        const projectData = {
          Challenge: project['Challenges'] || '',
          Solution: project['Solution'] || '',
          ProjectResult: project['Results']
            ? project['Results'].split(',').map((item) => item.trim())
            : [],
          clientName: project['Client Name'] || '',
          overview: project['Description'] || '',
          photo:
            project['Photo Link'] && project['Photo Link'] !== 'NIL'
              ? project['Photo Link'].split(',').map((link) => link.trim())
              : [],
          tags:
            project['Tags'] && project['Tags'] !== 'NIL'
              ? project['Tags'].split(',').map((tag) => tag.trim())
              : [],
          videoURL: convertVideoUrl(project['Video Link']),
          year: parseInt(project['Year']) || 0,
          videoOrientation,
          status,
        };

        batch.set(projectRef, projectData);
        totalUploaded++;

        setUploadProgress(Math.floor((totalUploaded / csvData.length) * 100));
      }

      if (totalUploaded === 0) {
        setError(
          'No new projects to upload. All projects already exist: ' +
            skippedProjects.join(', ')
        );
        setIsUploading(false);
        setCsvData([]);
        if (csvInputRef.current) csvInputRef.current.value = '';
        return;
      }

      await batch.commit();
      let message = `Successfully uploaded ${totalUploaded} project${totalUploaded > 1 ? 's' : ''}!`;
      if (skippedProjects.length > 0) {
        message += ` Skipped ${skippedProjects.length} existing project${skippedProjects.length > 1 ? 's' : ''}: ${skippedProjects.join(', ')}`;
      }
      setSuccessMessage(message);
      setCsvData([]);
      setUploadProgress(0);
      if (csvInputRef.current) csvInputRef.current.value = '';
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Bulk upload error:', err);
      setError('Failed to upload projects');
    } finally {
      setIsUploading(false);
    }
  };

  const resetCsvInput = () => {
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
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
              Fill in the details of your project to add it to the database or bulk upload from CSV.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <Check size={18} />
              {successMessage}
            </div>
          )}

          {/* CSV Bulk Upload Section */}
          <div className="mb-16 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Bulk Upload Projects</h2>
            <p className="mb-4 text-gray-700">
              Upload multiple projects at once using a CSV file. The CSV must include the following
              headers: {REQUIRED_CSV_HEADERS.join(', ')}. Optional columns: "Video Orientation" (Landscape or Portrait), "Status" (active or disabled).
            </p>

            <div className="mb-6">
              <label htmlFor="csv-upload" className="block font-medium mb-2 text-gray-800">
                CSV File
              </label>
              <div className="flex items-center gap-4">
                <label
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  aria-label="Select CSV file for bulk upload"
                >
                  <FileText size={18} />
                  <span>Select CSV File</span>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    ref={csvInputRef}
                    onChange={handleCSVUpload}
                    className="hidden"
                    aria-describedby={error ? 'csv-error' : undefined}
                  />
                </label>
                {csvData.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {csvData.length} projects found in CSV
                  </span>
                )}
              </div>
            </div>

            {csvData.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-800">Ready to Upload</h3>
                <ul className="mb-4 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-md p-2">
                  {csvData.map((project, index) => (
                    <li
                      key={index}
                      className="text-sm py-1 border-b border-gray-100 last:border-0"
                    >
                      {project['Project Name']} - {project['Client Name'] || 'No Client'} ({project.Status || 'active'})
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                  className="bg-accent text-white px-6 py-3 rounded-lg shadow-md inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Upload ${csvData.length} projects`}
                >
                  <Upload size={18} /> Upload {csvData.length} Projects
                </button>

                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-accent h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Or Upload Single Project</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              { name: 'title', label: 'Title', required: true },
              { name: 'clientName', label: 'Client Name', required: true },
              { name: 'year', label: 'Year', required: true },
              { name: 'videoURL', label: 'Video URL' },
            ].map(({ name, label, required }) => (
              <div key={name} className="flex flex-col">
                <label htmlFor={name} className="font-medium mb-2 text-gray-800">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  id={name}
                  type="text"
                  name={name}
                  value={formData[name as keyof ProjectFormData] as string}
                  onChange={handleChange}
                  className="border p-3 rounded-md shadow-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                  required={required}
                  aria-required={required}
                  aria-describedby={error && name === 'title' ? 'form-error' : undefined}
                />
              </div>
            ))}

            {/* Video Orientation Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="videoOrientation" className="font-medium mb-2 text-gray-800">
                Video Orientation
              </label>
              <select
                id="videoOrientation"
                name="videoOrientation"
                value={formData.videoOrientation}
                onChange={handleChange}
                className="border p-3 rounded-md shadow-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                aria-label="Select video orientation"
              >
                <option value="Landscape">Landscape</option>
                <option value="Portrait">Portrait</option>
              </select>
            </div>

            {/* Tags Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="tags" className="font-medium mb-2 text-gray-800">
                Tags
              </label>
              <div className="relative">
                <button
                  id="tags"
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between border p-3 rounded-md shadow-sm bg-white focus:ring-2 focus:ring-accent focus:outline-none"
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  aria-label="Select project tags"
                >
                  <span>
                    {formData.tags.length > 0 ? formData.tags.join(', ') : 'Select tags...'}
                  </span>
                  <ChevronsUpDown size={16} className="opacity-70" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border"
                    role="listbox"
                  >
                    <div className="max-h-60 overflow-auto p-1">
                      {TAG_OPTIONS.map((tag) => (
                        <div
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded hover:bg-gray-100 ${
                            formData.tags.includes(tag) ? 'bg-gray-100' : ''
                          }`}
                          role="option"
                          aria-selected={formData.tags.includes(tag)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleTagToggle(tag);
                              e.preventDefault();
                            }
                          }}
                        >
                          <div
                            className="flex-shrink-0 h-4 w-4 border rounded flex items-center justify-center"
                            aria-hidden="true"
                          >
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

          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-lg font-medium text-gray-800">
                  Project Results (Drag to reorder)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddItem('projectResult')}
                  className="flex items-center gap-1 text-accent hover:text-accent/80 text-sm"
                  aria-label="Add new project result"
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
                      role="list"
                      aria-label="Project results list"
                    >
                      {formData.projectResult.map((result, index) => (
                        <Draggable
                          key={`result-${index}`}
                          draggableId={`result-${index}`}
                          index={index}
                          isDragDisabled={formData.projectResult.length <= 1}
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
                              } ${formData.projectResult.length <= 1 ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                              role="listitem"
                              aria-label={`Project result ${index + 1}`}
                            >
                              <GripVertical
                                size={20}
                                className={`text-gray-400 flex-shrink-0 mt-3 ${formData.projectResult.length <= 1 ? 'opacity-50' : ''}`}
                                aria-hidden="true"
                              />
                              <input
                                type="text"
                                value={result}
                                onChange={(e) => handleArrayChange(index, e.target.value, 'projectResult')}
                                placeholder="Enter a project result"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                aria-label={`Project result ${index + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index, 'projectResult')}
                                className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label={`Remove project result ${index + 1}`}
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
              <div className="flex justify-between items-center">
                <label className="block text-lg font-medium text-gray-800">
                  Photo Gallery (Drag to reorder)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddItem('photo')}
                  className="flex items-center gap-1 text-accent hover:text-accent/80 text-sm"
                  aria-label="Add new photo"
                >
                  <Plus size={16} />
                  Add Photo
                </button>
              </div>

              <DragDropContext onDragEnd={onDragEndPhotos}>
                <Droppable droppableId="photos">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
                      role="list"
                      aria-label="Photo gallery list"
                    >
                      {formData.photo.map((photo, index) => (
                        <Draggable
                          key={`photo-${index}`}
                          draggableId={`photo-${index}`}
                          index={index}
                          isDragDisabled={formData.photo.length <= 1}
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
                              } ${formData.photo.length <= 1 ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                              role="listitem"
                              aria-label={`Photo ${index + 1}`}
                            >
                              <div className="col-span-3 flex items-center gap-2">
                                <GripVertical
                                  size={20}
                                  className={`text-gray-400 flex-shrink-0 ${formData.photo.length <= 1 ? 'opacity-50' : ''}`}
                                  aria-hidden="true"
                                />
                                <input
                                  type="text"
                                  value={photo}
                                  onChange={(e) => handleArrayChange(index, e.target.value, 'photo')}
                                  placeholder="Enter photo URL"
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                                  aria-label={`Photo URL ${index + 1}`}
                                />
                              </div>
                              <div className="flex gap-2">
                                <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={`Preview of photo ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          'https://via.placeholder.com/200';
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
                                  aria-label={`Remove photo ${index + 1}`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {[
                { name: 'challenge', label: 'Challenge' },
                { name: 'solution', label: 'Solution' },
                { name: 'overview', label: 'Overview' },
              ].map(({ name, label }) => (
                <div key={name} className="flex flex-col">
                  <label htmlFor={name} className="font-medium mb-2 text-gray-800">
                    {label}
                  </label>
                  <textarea
                    id={name}
                    name={name}
                    rows={4}
                    value={formData[name as keyof ProjectFormData] as string}
                    onChange={handleChange}
                    className="border p-3 rounded-md shadow-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                    aria-label={label}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleUploadSingle}
              className="bg-accent text-white mt-5 px-6 py-3 rounded-lg shadow-md inline-flex items-center gap-2 hover:bg-accent/90 focus:ring-2 focus:ring-accent focus:outline-none"
              aria-label="Upload single project"
            >
              <FilePlus size={18} /> Upload Single Project
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default UploadProject;
