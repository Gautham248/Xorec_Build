import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Page Not Found</h2>
        <p className="text-neutral-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;