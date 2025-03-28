'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CartButton from '../cart/CartButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // Detectar scroll para cambiar estilo
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Cerrar menú al cambiar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-3'
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 relative z-10">
            <Image
              src="/images/logos/mmm.png"
              alt="Manos del Marga Marga"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          
          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/catalogo" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/catalogo' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Productos
            </Link>
            <Link 
              href="/servicios" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/servicios' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Servicios
            </Link>
            <Link 
              href="/nosotros" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/nosotros' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Nosotros
            </Link>
            <Link 
              href="/contacto" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/contacto' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Contacto
            </Link>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center">
            <CartButton />
            
            {/* Botón de menú móvil */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 ml-2 text-gray-500 rounded-md md:hidden focus:outline-none"
              aria-label="Abrir menú de navegación"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Menú móvil */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-60 opacity-100 visible mt-2' 
            : 'max-h-0 opacity-0 invisible'
        }`}>
          <div className="flex flex-col py-2 bg-white border rounded-lg shadow-lg">
            <Link 
              href="/catalogo" 
              className={`px-4 py-2 text-sm ${
                pathname === '/catalogo' 
                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Productos
            </Link>
            <Link 
              href="/servicios" 
              className={`px-4 py-2 text-sm ${
                pathname === '/servicios' 
                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Servicios
            </Link>
            <Link 
              href="/nosotros" 
              className={`px-4 py-2 text-sm ${
                pathname === '/nosotros' 
                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Nosotros
            </Link>
            <Link 
              href="/contacto" 
              className={`px-4 py-2 text-sm ${
                pathname === '/contacto' 
                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contacto
            </Link>
            
            {/* Enlaces a categorías en móvil */}
            <hr className="my-2 border-gray-100" />
            <p className="px-4 py-1 text-xs text-gray-500 font-medium">Categorías</p>
            {[
              "Bolitas de Semilla",
              "Papeles",
              "Brandeables",
              "Celebraciones",
              "Figuras",
              "Tarjetas"
            ].map(category => (
              <Link 
                key={category}
                href={`/catalogo?categoria=${encodeURIComponent(category)}`} 
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;