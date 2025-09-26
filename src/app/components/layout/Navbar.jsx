"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CartButton from "../cart/CartButton";
import { FiSearch } from "react-icons/fi";

/**
 * Navbar completo corregido:
 * - Cierra dropdowns al click fuera (navRef)
 * - Submenús posicionados con top-full para no montarse encima
 * - slugify() que normaliza y quita tildes (y un slugMap para excepciones)
 * - Mantiene estructura desktop / compact / mobile similar al original
 */

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Referencia al nav (para detectar clicks fuera de TODO el navbar)
  const navRef = useRef(null);
  // refs para cada menú (útiles si quieres posicionar dinámicamente)
  const dropdownRefs = useRef({});

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Map puntual para slugs donde quieras forzar algo distinto (opcional)
  const tutorialSlugMap = {
    "¿Como plantar?": "como-plantar",
    "¿Cómo funciona un pedido?": "como-funciona-un-pedido",
    "Ayuda para diseñadores": "ayuda-para-disenadores",
  };

  const menuItems = [
    {
      name: "Tienda",
      path: "/catalogo",
      color: "yellow",
      submenu: [
        "Regalos Corporativos",
        "Papelería Germinable",
        "Papel con Semillas",
        "Celebraciones",
        "Materiales y Herramientas",
        "Ofertas",
        "Eventos",
      ],
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

  // slugify robusto: normaliza, quita tildes, caracteres no-alfanum y espacios -> guiones
  const slugify = (str) => {
    if (!str) return "";
    // Primero intentamos el mapa de excepciones
    if (tutorialSlugMap[str]) return tutorialSlugMap[str];

    return str
      .toLowerCase()
      .normalize("NFD") // separa las letras y los acentos
      .replace(/[\u0300-\u036f]/g, "") // remueve acentos
      .replace(/[¿?¡!]/g, "") // remover signos especiales en español
      .replace(/[^a-z0-9\s-]/g, "") // quitar otros caracteres no permitidos
      .trim()
      .replace(/\s+/g, "-"); // espacios por guion
  };

  // 1) Cerrar dropdown / menu al hacer click fuera del nav
  useEffect(() => {
    function handleClickOutside(event) {
      // Si navRef no existe, no hacemos nada
      if (!navRef.current) return;

      if (!navRef.current.contains(event.target)) {
        setActiveDropdown("");
        setIsMenuOpen(false); // también cerramos el menú móvil si fuera el caso
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2) Scroll para cambiar estado comprimido
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3) Resetear open/active en cambios de ruta/params
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown("");
  }, [pathname, searchParams]);

  // Manejo click en item / subitem
  const handleMenuItemClick = async (item, subItem = null) => {
    if (subItem) {
      if (item.name === "Tienda") {
        // ir al catálogo con query param
        const newPath = `${item.path}?categoria=${encodeURIComponent(subItem)}`;
        await router.push(newPath);
      } else if (item.name === "Tutoriales") {
        // usar slugify o map de excepciones
        const slug = slugify(subItem);
        await router.push(`${item.path}/${slug}`);
      } else {
        // por si hay otro menú con submenu (genérico)
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
      // toggle del dropdown
      setActiveDropdown((prev) => (prev === item.name ? "" : item.name));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCloseAnnouncement = () => setShowAnnouncement(false);

  /**
   * Render de submenú: lo dejamos como `absolute` dentro del wrapper relativo.
   * - usamos top-full para que siempre quede por debajo del botón
   * - z-index controlado desde nav para evitar montarse "por encima" del comprimido
   */
  const renderSubmenuInline = (item) => {
    if (!item.submenu) return null;

    // Si el dropdown está abierto, mostrar el submenú
    if (activeDropdown === item.name) {
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
                className={`block w-full text-left px-4 py-2 text-sm ${getHoverColorClass(
                  item.color
                )}`}
              >
                {subItem}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  /**
   * Versión para mobile donde el submenu queda dentro del panel colapsable
   * (evita posicionamientos `fixed` que puedan superponerse)
   */
  const renderSubmenuMobile = (item) => {
    if (!item.submenu) return null;
    if (activeDropdown !== item.name) return null;

    return (
      <div className="bg-gray-50">
        {item.submenu.map((subItem) => (
          <button
            key={subItem}
            onClick={() => handleMenuItemClick(item, subItem)}
            className={`block w-full text-left px-8 py-2 text-sm ${getHoverColorClass(
              item.color
            )}`}
          >
            {subItem}
          </button>
        ))}
      </div>
    );
  };

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
                    <div
                      key={item.name}
                      className="relative group"
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                    >
                      {item.name === "Tienda" ? (
                        <div className="flex items-center">
                          {/* Botón palabra "Tienda" */}
                          <button
                            onClick={() => router.push(item.path)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                              zIndex: 70,
                            }}
                          >
                            {item.name}
                          </button>

                          {/* Botón flecha que abre el submenu */}
                          <button
                            onClick={() => setActiveDropdown((prev) => (prev === item.name ? "" : item.name))}
                            className={`px-2 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              activeDropdown === item.name ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              zIndex: 70,
                            }}
                            aria-label="Abrir submenú Tienda"
                          >
                            <svg
                              className={`ml-0 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Submenú */}
                          {/* Usamos posicionamiento absoluto relativo al wrapper y top-full para que "caiga" debajo */}
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
                              <svg
                                className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {/* Submenú */}
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
                    <div
                      key={item.name}
                      className="relative group"
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                    >
                      {item.name === "Tienda" ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => router.push(item.path)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                              zIndex: 70,
                            }}
                          >
                            {item.name}
                          </button>

                          <button
                            onClick={() => setActiveDropdown((prev) => (prev === item.name ? "" : item.name))}
                            className={`px-2 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              activeDropdown === item.name ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              zIndex: 70,
                            }}
                            aria-label="Abrir submenú Tienda"
                          >
                            <svg
                              className={`ml-0 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Submenú */}
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
                              <svg
                                className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
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
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label="Abrir menu"
              >
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
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? "max-h-[32rem] opacity-100 visible mt-2" : "max-h-0 opacity-0 invisible"
            }`}
          >
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
                    onClick={() => {
                      // en móvil el toggle abre el submenu (si tiene) o va a la ruta
                      if (item.submenu) {
                        setActiveDropdown((prev) => (prev === item.name ? "" : item.name));
                      } else {
                        handleMenuItemClick(item);
                      }
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
                      pathname === item.path ? getActiveColorClass(item.color) : getHoverColorClass(item.color)
                    }`}
                  >
                    {item.name}
                    {item.submenu && (
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
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

      {/* Barra de anuncio */}
      {showAnnouncement && (
        <div
          className={`fixed left-0 right-0 bg-emerald-700 text-white py-2 px-4 transition-all duration-300 z-40 ${
            isScrolled ? "top-[56px]" : "top-[140px]"
          }`}
        >
          <div className="max-w-6xl text-center mx-auto px-4 flex justify-center items-center">
            <p className="text-sm font-medium">
              ¿Necesitas cotización para Agencia, Fondos, Institución o Empresa? Haz click en botón WhatsApp.
            </p>
            <button
              onClick={handleCloseAnnouncement}
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
