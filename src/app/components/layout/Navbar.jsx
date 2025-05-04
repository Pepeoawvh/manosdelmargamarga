'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CartButton from '../cart/CartButton';
import { FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const menuItems = [
    {
      name: 'Tienda',
      path: '/catalogo',
      color: 'yellow',
      submenu: [
        "Regalos Corporativos",
        "Papelería Germinable",
        "Papel con Semillas",
        "Celebraciones",
        "Materiales y Herramientas",
        "Ofertas",
        "Celebraciones",
        "Eventos"
      ]
    },
    { 
      name: 'Nosotras', 
      path: '/nosotras',
      color: 'pink'
    },
    { 
      name: 'Sostenible', 
      path: '/sostenible',
      color: 'green'
    },
    {
      name: 'Tutoriales',
      path: '/tutoriales',
      color: 'blue',
      submenu: [
        "¿Cómo plantar?",
        "Ayuda para diseñadores",
        "¿Cómo funciona un pedido?"
      ]
    },
    { 
      name: 'Contacto', 
      path: '/contacto',
      color: 'gray'
    }
  ];

  const getActiveColorClass = (color) => {
    const colorClasses = {
      yellow: 'bg-yellow-50 text-yellow-700',
      pink: 'bg-pink-50 text-pink-700',
      green: 'bg-green-50 text-green-700',
      blue: 'bg-sky-50 text-sky-700',
      gray: 'bg-gray-50 text-gray-700'
    };
    return colorClasses[color] || colorClasses.gray;
  };

  const getHoverColorClass = (color) => {
    const colorClasses = {
      yellow: 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50',
      pink: 'text-gray-700 hover:text-pink-600 hover:bg-pink-50',
      green: 'text-gray-700 hover:text-green-600 hover:bg-green-50',
      blue: 'text-gray-700 hover:text-sky-600 hover:bg-sky-50',
      gray: 'text-gray-700 hover:text-gray-600 hover:bg-gray-50'
    };
    return colorClasses[color] || colorClasses.gray;
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown('');
  }, [pathname, searchParams]);

  const handleMenuItemClick = async (item, subItem = null) => {
    if (subItem) {
      const newPath = `${item.path}?categoria=${encodeURIComponent(subItem)}`;
      if (pathname === item.path) {
        window.location.href = newPath;
      } else {
        await router.push(newPath);
      }
      setActiveDropdown('');
      setIsMenuOpen(false);
    } else if (!item.submenu) {
      await router.push(item.path);
      setIsMenuOpen(false);
    } else {
      setActiveDropdown(activeDropdown === item.name ? '' : item.name);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-3'
      }`}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Vista Desktop */}
          <div className="hidden md:block">
            {/* Modo normal (sin scroll) - 2 filas */}
            <div className={`${!isScrolled ? 'block' : 'hidden'} space-y-4`}>
              {/* Primera fila - Logo centrado */}
              <div className="flex justify-center">
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/images/logos/mmm.png"
                    alt="Manos del Marga Marga"
                    width={200}
                    height={40}
                    className="h-14 w-auto"
                  />
                </Link>
              </div>

              {/* Segunda fila - Barra de búsqueda, menú y carrito */}
              <div className="flex items-center justify-between">
                <form onSubmit={handleSearch} className="flex-1 max-w-xs">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Buscar en catálogo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                    >
                      <FiSearch size={20} />
                    </button>
                  </div>
                </form>

                <div className="flex items-center space-x-4 mx-4">
                  {menuItems.map((item) => (
                    <div key={item.name} className="relative group">
                      <button
                        onClick={() => handleMenuItemClick(item)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                          pathname === item.path
                            ? getActiveColorClass(item.color)
                            : getHoverColorClass(item.color)
                        }`}
                      >
                        {item.name}
                        {item.submenu && (
                          <svg
                            className={`ml-1 h-4 w-4 transition-transform ${
                              activeDropdown === item.name ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {item.submenu && activeDropdown === item.name && (
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            {item.submenu.map((subItem) => (
                              <button
                                key={subItem}
                                onClick={() => handleMenuItemClick(item, subItem)}
                                className={`block w-full text-left px-4 py-2 text-sm ${getHoverColorClass(item.color)}`}
                              >
                                {subItem}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-shrink-0">
                  <CartButton />
                </div>
              </div>
            </div>

            {/* Modo compacto (con scroll) - 1 fila */}
            <div className={`${isScrolled ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between">
                {/* Logo pequeño */}
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/images/logos/mmm.png"
                    alt="Manos del Marga Marga"
                    width={120}
                    height={24}
                    className="h-8 w-auto"
                  />
                </Link>

                {/* Contenedor central - Búsqueda y menú */}
                <div className="flex items-center space-x-4 mx-4">
                  <form onSubmit={handleSearch} className="flex">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 px-3 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                    >
                      <FiSearch size={16} />
                    </button>
                  </form>

                  {menuItems.map((item) => (
                    <div key={item.name} className="relative group">
                      <button
                        onClick={() => handleMenuItemClick(item)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                          pathname === item.path
                            ? getActiveColorClass(item.color)
                            : getHoverColorClass(item.color)
                        }`}
                      >
                        {item.name}
                        {item.submenu && (
                          <svg
                            className={`ml-1 h-4 w-4 transition-transform ${
                              activeDropdown === item.name ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {item.submenu && activeDropdown === item.name && (
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            {item.submenu.map((subItem) => (
                              <button
                                key={subItem}
                                onClick={() => handleMenuItemClick(item, subItem)}
                                className={`block w-full text-left px-4 py-2 text-sm ${getHoverColorClass(item.color)}`}
                              >
                                {subItem}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Carrito */}
                <div className="flex-shrink-0">
                  <CartButton />
                </div>
              </div>
            </div>
          </div>

          {/* Vista Móvil */}
          <div className="md:hidden flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logos/mmm.png"
                alt="Manos del Marga Marga"
                width={150}
                height={30}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <CartButton />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Menú móvil desplegable */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[32rem] opacity-100 visible mt-2' : 'max-h-0 opacity-0 invisible'
          }`}>
            <div className="bg-white border rounded-lg shadow-lg">
              <form onSubmit={handleSearch} className="p-4 border-b">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Buscar en catálogo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                  >
                    <FiSearch size={20} />
                  </button>
                </div>
              </form>
              {menuItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
                      pathname === item.path
                        ? getActiveColorClass(item.color)
                        : getHoverColorClass(item.color)
                    }`}
                  >
                    {item.name}
                    {item.submenu && (
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {item.submenu && activeDropdown === item.name && (
                    <div className="bg-gray-50">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem}
                          onClick={() => handleMenuItemClick(item, subItem)}
                          className={`block w-full text-left px-8 py-2 text-sm ${getHoverColorClass(item.color)}`}
                        >
                          {subItem}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Barra de anuncio */}
      {showAnnouncement && (
        <div className={`fixed left-0 right-0 bg-emerald-700 text-white py-2 px-4 transition-all duration-300 z-30 ${
          isScrolled ? 'top-[56px]' : 'top-[140px]'
        }`}>
          <div className="max-w-6xl text-center mx-auto px-4 flex justify-center items-center">
            <p className="text-sm font-medium">
              ¿Necesitas cotización para Agencia, Fondos, Institución o Empresa? Haz click en botón WhatsApp.
            </p>
            <button 
              onClick={handleCloseAnnouncement}
              className="ml-4 p-1 hover:bg-emerald-600 rounded-full transition-colors"
              aria-label="Cerrar anuncio"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;