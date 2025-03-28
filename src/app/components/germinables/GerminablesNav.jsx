'use client'
import { useState, useEffect } from 'react';

const GerminablesNav = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSticky, setIsSticky] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 400) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Ajuste para el encabezado fijo
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActiveTab(id);
  };
  
  return (
    <nav className={`bg-white py-4 select-none z-20 ${isSticky ? 'sticky top-0 shadow-md' : ''}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center md:justify-start space-x-2 md:space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-200">
          <button 
            onClick={() => scrollToSection('overview')} 
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'overview' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            ¿Qué son?
          </button>
          <button 
            onClick={() => scrollToSection('benefits')} 
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'benefits' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            Beneficios
          </button>
          <button 
            onClick={() => scrollToSection('products')} 
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'products' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            Modelos
          </button>
          <button 
            onClick={() => scrollToSection('process')} 
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'process' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            Proceso
          </button>
          <button 
            onClick={() => scrollToSection('faq')} 
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'faq' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-600'}`}
          >
            Preguntas frecuentes
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GerminablesNav;