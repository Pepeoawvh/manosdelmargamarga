'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CartButton from '../cart/CartButton';
import { FiSearch } from 'react-icons/fi'; // Ícono de lupa

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-3'
    }`}>
      <div className="grid grid-cols-1 justify-items-center max-w-6xl mx-auto px-4">
        {/* Primera fila: barra de búsqueda, logo y botón del carrito */}
        <div className="flex items-center justify-between">
          {/* Barra de búsqueda */}C
          <form
            onSubmit={handleSearch}
            className="flex items-center flex-1 max-w-xs"
          >
            <input
              type="text"
              placeholder="Buscar en catálogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=" w-full h-9 px-4 py-2 bg-gray-200 text-emerald-600 rounded-l-md focus:outline-none "
            />
            <button
              type="submit"
              className="px-3 py-2 bg-gray-200 text-emerald-600 rounded-r-md hover:bg-gray-200 flex items-center justify-center"
            >
              <FiSearch size={20} />
            </button>
          </form>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mx-4">
            <Image
              src="/images/logos/mmm.png"
              alt="Manos del Marga Marga"
              width={200}
              height={40}
              className="h-14 w-auto"
            />
          </Link>

          {/* Botón del carrito */}
          <div className="flex-shrink-0">
            <CartButton />
          </div>
        </div>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center space-x-4 mt-4">
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
              
              {/* Dropdown para desktop */}
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

        {/* Menú móvil */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[32rem] opacity-100 visible mt-2' : 'max-h-0 opacity-0 invisible'
        }`}>
          <div className="flex flex-col py-2 bg-white border rounded-lg shadow-lg">
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
                
                {/* Submenú móvil */}
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
  );
};

export default Navbar;