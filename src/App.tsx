import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Services from '@/pages/Services';
import Portfolio from '@/pages/Portfolio';
import Contact from '@/pages/Contact';
import ProjectDetail from '@/pages/ProjectDetail';
import PortfolioManagement from '@/pages/PortfolioManagement';
import UploadProject from '@/pages/UploadProject';
import ProjectEdit from '@/pages/ProjectEdit';
import Clients from '@/pages/Clients';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-black">
        <Header />
        <main>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload-project" element={<UploadProject />} />
        <Route path="/portfolio-management" element={<PortfolioManagement />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:projectId" element={<ProjectDetail />} />
        <Route path="/portfolio/edit/:projectId" element={<ProjectEdit />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;