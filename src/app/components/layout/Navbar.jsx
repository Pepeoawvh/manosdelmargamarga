"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CartButton from "../cart/CartButton";
import { FiSearch } from "react-icons/fi";
import { PRODUCT_CATEGORIES } from "../../hooks/shared/useProducts"; 

const ANNOUNCE_REAPPEAR_MINUTES = 10;
const SCROLL_CLOSE_DELAY_MS = 5000;
const ANNOUNCE_ANIM_MS = 300;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Estado "base" que indica si la barra debería mostrarse (lógica)
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  // Estados para manejar animación y montaje
  const [announceMounted, setAnnounceMounted] = useState(false);
  const [announceActive, setAnnounceActive] = useState(false);

  // refs para timeouts / listeners seguros
  const scrollCloseTimeoutRef = useRef(null);
  const announceUnmountTimeoutRef = useRef(null);

  // refs para click-outside
  const navRef = useRef(null);
  const dropdownRefs = useRef({});

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tutorialSlugMap = {
    "¿Como plantar?": "como-plantar",
    "¿Cómo funciona un pedido?": "como-trabajamos",
    "Ayuda para diseñadores": "protocolo-grafico",
  };

  const menuItems = [
     {
    name: "Tienda",
    path: "/catalogo",
    color: "yellow",
    submenu: PRODUCT_CATEGORIES, // Usar categorías dinámicas
  },
    { name: "Nosotras", path: "/nosotras", color: "pink" },
    { name: "Sostenible", path: "/sostenible", color: "green" },
    {
      name: "Tutoriales",
      path: "/tutoriales",
      color: "blue",
      submenu: [
        "¿Cómo plantar?",
        "Ayuda para diseñadores",
        "¿Cómo funciona un pedido?",
      ],
    },
    { name: "Contacto", path: "/contacto", color: "gray" },
  ];

  const getActiveColorClass = (color) => {
    const colorClasses = {
      yellow: "bg-yellow-50 text-yellow-700",
      pink: "bg-pink-50 text-pink-700",
      green: "bg-green-50 text-green-700",
      blue: "bg-sky-50 text-sky-700",
      gray: "bg-gray-50 text-gray-700",
    };
    return colorClasses[color] || colorClasses.gray;
  };

  const getHoverColorClass = (color) => {
    const colorClasses = {
      yellow: "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50",
      pink: "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
      green: "text-gray-700 hover:text-green-600 hover:bg-green-50",
      blue: "text-gray-700 hover:text-sky-600 hover:bg-sky-50",
      gray: "text-gray-700 hover:text-gray-600 hover:bg-gray-50",
    };
    return colorClasses[color] || colorClasses.gray;
  };

  const slugify = (str) => {
    if (!str) return "";
    if (tutorialSlugMap[str]) return tutorialSlugMap[str];
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  // ---------- CLICK OUTSIDE para cerrar dropdowns/menus ----------
  useEffect(() => {
    function handleClickOutside(event) {
      if (!navRef.current) return;
      if (!navRef.current.contains(event.target)) {
        setActiveDropdown("");
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- SCROLL: isScrolled + cierre anuncio por scroll ----------
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setIsScrolled(y > 10);

      // si el usuario scrollea hacia abajo y la barra está visible -> iniciar cierre en 1s
      if (y > 50 && showAnnouncement && !scrollCloseTimeoutRef.current) {
        scrollCloseTimeoutRef.current = setTimeout(() => {
          closeAnnouncement(true); // guarda timestamp
          scrollCloseTimeoutRef.current = null;
        }, SCROLL_CLOSE_DELAY_MS);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollCloseTimeoutRef.current) {
        clearTimeout(scrollCloseTimeoutRef.current);
        scrollCloseTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnnouncement]); // solo necesitamos re-subscribe si cambia la visibilidad deseada

  // ---------- RESET MENU cuando cambian ruta/params ----------
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown("");
  }, [pathname, searchParams]);

  // ---------- LÓGICA: comprobar localStorage al montar para decidir mostrar ----------
  useEffect(() => {
    try {
      const lastClosed = localStorage.getItem("announcementClosedAt");
      if (lastClosed) {
        const closedAt = parseInt(lastClosed, 10);
        if (!isNaN(closedAt)) {
          const minutesDiff = (Date.now() - closedAt) / (1000 * 60);
          if (minutesDiff >= ANNOUNCE_REAPPEAR_MINUTES) {
            localStorage.removeItem("announcementClosedAt");
            setShowAnnouncement(true);
          } else {
            setShowAnnouncement(false);
          }
        } else {
          // dato corrupto -> mostrar y limpiar
          localStorage.removeItem("announcementClosedAt");
          setShowAnnouncement(true);
        }
      } else {
        // nunca cerrado -> mostrar
        setShowAnnouncement(true);
      }
    } catch (e) {
      // en caso de fallo con storage, mostramos por seguridad
      setShowAnnouncement(true);
    }
  }, []);

  // ---------- manejar mount/animación cuando cambia showAnnouncement ----------
  useEffect(() => {
    if (showAnnouncement) {
      // montar y animar entrada
      setAnnounceMounted(true);
      // forzar paint para que la transición CSS pueda animar del estado inicial al activo
      requestAnimationFrame(() => {
        setAnnounceActive(true);
      });
    } else {
      // animar salida y desmontar después de la duración
      setAnnounceActive(false);
      if (announceUnmountTimeoutRef.current) {
        clearTimeout(announceUnmountTimeoutRef.current);
      }
      announceUnmountTimeoutRef.current = setTimeout(() => {
        setAnnounceMounted(false);
        announceUnmountTimeoutRef.current = null;
      }, ANNOUNCE_ANIM_MS);
    }
    return () => {
      if (announceUnmountTimeoutRef.current) {
        clearTimeout(announceUnmountTimeoutRef.current);
        announceUnmountTimeoutRef.current = null;
      }
    };
  }, [showAnnouncement]);

  // ---------- cerrar anuncio (con animación). saveTimestamp=true guarda en localStorage ----------
  const closeAnnouncement = (saveTimestamp = true) => {
    // primero desactivar (lanza animación de salida)
    setShowAnnouncement(false);
    // guardar timestamp ahora mismo o en el desmontaje, guardamos aquí:
    if (saveTimestamp) {
      try {
        localStorage.setItem("announcementClosedAt", Date.now().toString());
      } catch (e) {
        // fail silently si storage no disponible
      }
    }
    // limpiar timeouts de scroll si existen
    if (scrollCloseTimeoutRef.current) {
      clearTimeout(scrollCloseTimeoutRef.current);
      scrollCloseTimeoutRef.current = null;
    }
  };

  // ---------- manejo clicks del menú ----------
  const handleMenuItemClick = async (item, subItem = null) => {
    if (subItem) {
      if (item.name === "Tienda") {
        const newPath = `${item.path}?categoria=${encodeURIComponent(subItem)}`;
        await router.push(newPath);
      } else if (item.name === "Tutoriales") {
        const slug = slugify(subItem);
        await router.push(`${item.path}/${slug}`);
      } else {
        const slug = slugify(subItem);
        await router.push(`${item.path}/${slug}`);
      }
      setActiveDropdown("");
      setIsMenuOpen(false);
    } else if (!item.submenu) {
      await router.push(item.path);
      setIsMenuOpen(false);
      setActiveDropdown("");
    } else {
      setActiveDropdown((prev) => (prev === item.name ? "" : item.name));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const renderSubmenuInline = (item) => {
    if (!item.submenu || activeDropdown !== item.name) return null;
    return (
      <div
        className="absolute left-0 top-full mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
        style={{ zIndex: 60 }}
      >
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
    );
  };

  const renderSubmenuMobile = (item) => {
    if (!item.submenu || activeDropdown !== item.name) return null;
    return (
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
    );
  };

  // ---------- RENDER ----------
  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-white/90 backdrop-blur-sm py-3"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Vista Desktop */}
          <div className="hidden md:block">
            {/* Modo normal (sin scroll) - 2 filas */}
            <div className={`${!isScrolled ? "block" : "hidden"} space-y-4`}>
              {/* Primera fila - Logo centrado */}
              <div className="flex justify-center">
                <Link href="/" className="flex-shrink-0">
                  <Image src="/images/logos/mmm.png" alt="Manos del Marga Marga" width={200} height={40} className="h-14 w-auto" />
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-l-md focus:inline-none focus:ring-1 focus:ring-gray-200"
                    />
                    <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200">
                      <FiSearch size={20} />
                    </button>
                  </div>
                </form>

                <div className="flex items-center space-x-4 mx-4">
                  {menuItems.map((item) => (
                    <div key={item.name} className="relative group" ref={(el) => (dropdownRefs.current[item.name] = el)}>
                      {item.name === "Tienda" ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => router.push(item.path)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, zIndex: 70 }}
                          >
                            {item.name}
                          </button>

                          <button
                            onClick={() => setActiveDropdown((prev) => (prev === item.name ? "" : item.name))}
                            className={`px-2 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              activeDropdown === item.name ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, zIndex: 70 }}
                            aria-label="Abrir submenú Tienda"
                          >
                            <svg className={`ml-0 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {renderSubmenuInline(item)}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleMenuItemClick(item)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                          >
                            {item.name}
                            {item.submenu && (
                              <svg className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {renderSubmenuInline(item)}
                        </>
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
            <div className={`${isScrolled ? "block" : "hidden"}`}>
              <div className="flex items-center justify-between">
                <Link href="/" className="flex-shrink-0">
                  <Image src="/images/logos/mmm.png" alt="Manos del Marga Marga" width={120} height={24} className="h-8 w-auto" />
                </Link>

                <div className="flex items-center space-x-4 mx-4">
                  <form onSubmit={handleSearch} className="flex">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 px-3 py-1 text-sm border border-gray-300 rounded-l-md focus:inline-none focus:ring-1 focus:ring-gray-200"
                    />
                    <button type="submit" className="px-3 py-1 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200">
                      <FiSearch size={16} />
                    </button>
                  </form>

                  {menuItems.map((item) => (
                    <div key={item.name} className="relative group" ref={(el) => (dropdownRefs.current[item.name] = el)}>
                      {item.name === "Tienda" ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => router.push(item.path)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, zIndex: 70 }}
                          >
                            {item.name}
                          </button>

                          <button
                            onClick={() => setActiveDropdown((prev) => (prev === item.name ? "" : item.name))}
                            className={`px-2 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              activeDropdown === item.name ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, zIndex: 70 }}
                            aria-label="Abrir submenú Tienda"
                          >
                            <svg className={`ml-0 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {renderSubmenuInline(item)}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleMenuItemClick(item)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                          >
                            {item.name}
                            {item.submenu && (
                              <svg className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {renderSubmenuInline(item)}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-shrink-0">
                  <CartButton />
                </div>
              </div>
            </div>
          </div>

          {/* Vista Móvil */}
          <div className="md:hidden flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logos/mmm.png" alt="Manos del Marga Marga" width={150} height={30} className="h-10 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              <CartButton />
              <button onClick={() => setIsMenuOpen((prev) => !prev)} className="p-2 text-gray-600 hover:text-gray-900" aria-label="Abrir menu">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[32rem] opacity-100 visible mt-2" : "max-h-0 opacity-0 invisible"}`}>
            <div className="bg-white border rounded-lg shadow-lg">
              <form onSubmit={handleSearch} className="p-4 border-b">
                <div className="flex">
                  <input type="text" placeholder="Buscar en catálogo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
                  <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200">
                    <FiSearch size={20} />
                  </button>
                </div>
              </form>

              {menuItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        setActiveDropdown((prev) => (prev === item.name ? "" : item.name));
                      } else {
                        handleMenuItemClick(item);
                      }
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)}`}
                  >
                    {item.name}
                    {item.submenu && (
                      <svg className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {renderSubmenuMobile(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Barra de anuncio (montada/animada) */}
      {announceMounted && (
        <div
          aria-live="polite"
          className={`fixed left-0 right-0 bg-[#c97e5b] text-white py-2 px-4 z-40`}
          style={{ top: isScrolled ? "56px" : "140px" }}
        >
          <div
            className={`max-w-6xl mx-auto px-4 flex justify-center items-center transition-transform transition-opacity duration-300 ease-out transform ${
              announceActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            <p className="text-sm font-medium">
              ¿Necesitas cotización para Agencia, Fondos, Institución o Empresa? Haz click en botón WhatsApp.
            </p>
            <button
              onClick={() => closeAnnouncement(true)}
              className="ml-4 p-1 hover:bg-emerald-600 rounded-full transition-colors"
              aria-label="Cerrar anuncio"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};  

export default Navbar;
