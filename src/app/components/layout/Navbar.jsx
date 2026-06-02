"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CartButton from "../cart/CartButton";
import { FiSearch } from "react-icons/fi";
import { PRODUCT_CATEGORIES } from "../../hooks/shared/useProducts";

// Firestore
import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";

const ANNOUNCE_REAPPEAR_MINUTES = 10;
const SCROLL_CLOSE_DELAY_MS = 5000;
const ANNOUNCE_ANIM_MS = 300;

function filterCatalog(
  products,
  {
    term = "",
    category = "",
    subcategories = [],
    featured = false,
    inStock = false,
  }
) {
  const searchTerm = term?.toLowerCase() || "";
  return products.filter((product) => {
    const categoryMatch = !category || product.categories?.includes(category);
    const subcategoryMatch =
      subcategories.length === 0 ||
      subcategories.every((sub) => product.subcategories?.includes(sub));
    const featuredMatch = !featured || product.featured;
    const stockMatch = !inStock || (product.stock && product.stock > 0);
    const searchMatch =
      !searchTerm ||
      product.title?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm);
    return (
      categoryMatch &&
      subcategoryMatch &&
      featuredMatch &&
      stockMatch &&
      searchMatch
    );
  });
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Búsqueda
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [openSearchPanel, setOpenSearchPanel] = useState(false);
  // Refs separados: desktop expandido, desktop condensado, móvil
  const inputRefDesktop1 = useRef(null);
  const inputRefDesktop2 = useRef(null);
  const inputRef = useRef(null); // móvil
  const panelRefDesktop1 = useRef(null);
  const panelRefDesktop2 = useRef(null);
  const panelRef = useRef(null); // móvil

  // Anuncio
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announceMounted, setAnnounceMounted] = useState(false);
  const [announceActive, setAnnounceActive] = useState(false);

  const scrollCloseTimeoutRef = useRef(null);
  const announceUnmountTimeoutRef = useRef(null);

  // Refs generales
  const navRef = useRef(null);
  const dropdownRefs = useRef({});

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mapeo actualizado de tutoriales a URLs directas
  const tutorialUrlMap = {
    "¿Como plantar?": "/como-plantar-papel-germinable-manos-del-marga-marga",
    "¿Cómo funciona un pedido?": "/tutoriales/como-trabajamos",
    "Ayuda para diseñadores": "/tutoriales/protocolo-grafico",
  };

  const menuItems = [
    {
      name: "Tienda",
      path: "/catalogo",
      color: "gray",
      submenu: PRODUCT_CATEGORIES,
    },
    // { name: "Nosotras", path: "/nosotras", color: "pink" },
    // { name: "Sostenible", path: "/sostenible", color: "green" },
    {
      name: "Tutoriales",
      path: "/tutoriales",
      color: "gray",
      submenu: [
        "¿Cómo plantar papel germinable manos del marga marga?",
        "Ayuda para diseñadores",
        "¿Cómo funciona un pedido?",
      ],
    },
    { name: "Contacto", path: "/contacto", color: "gray" },
    { name: "Ofertas", path: "/catalogo?categoria=Ofertas", color: "orange" },
  ];

  const getActiveColorClass = (color) => {
    const colorClasses = {
      yellow: "bg-yellow-50 text-yellow-700",
      pink: "bg-pink-50 text-pink-700",
      green: "bg-green-50 text-green-700",
      blue: "bg-sky-50 text-sky-700",
      gray: "bg-gray-50 text-gray-700",
      orange: "bg-orange-50 text-orange-600",
    };
    return colorClasses[color] || colorClasses.gray;
  };

  const getHoverColorClass = (color) => {
    const colorClasses = {
      yellow: "text-gray-700 hover:text-[#969e9d] hover:bg-[#eff2d5]",
      pink: "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
      green: "text-gray-700 hover:text-[#5e8c30] hover:bg-[#ecf7cd]",
      blue: "text-gray-700 hover:text-sky-600 hover:bg-sky-50",
      gray: "text-gray-700 hover:text-gray-600 hover:bg-gray-50",
      orange: "text-orange-500 font-semibold hover:text-orange-600 hover:bg-orange-50",
    };
    return colorClasses[color] || colorClasses.gray;
  };

  const slugify = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  // CLICK OUTSIDE seguro (no interfiere con links)
  useEffect(() => {
    function handleClickOutside(event) {
      if (!navRef.current) return;

      const allPanelRefs = [panelRefDesktop1, panelRefDesktop2, panelRef];
      const allInputRefs = [inputRefDesktop1, inputRefDesktop2, inputRef];

      const clickedInsidePanel = allPanelRefs.some(
        (r) => r.current && r.current.contains(event.target)
      );
      const clickedInsideInput = allInputRefs.some(
        (r) => r.current && r.current.contains(event.target)
      );

      // Ignorar clicks dentro de algún panel o input
      if (clickedInsidePanel || clickedInsideInput) return;

      // Cerrar dropdowns/menú si el click fue fuera del navbar
      if (!navRef.current.contains(event.target)) {
        setActiveDropdown("");
        setIsMenuOpen(false);
      }

      // Cerrar panel si fue fuera de todos los inputs y paneles
      if (!clickedInsidePanel && !clickedInsideInput) {
        setOpenSearchPanel(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // SCROLL + cierre de anuncio por scroll
  useEffect(() => {
    // Histeresis amplia para evitar el bucle causado por el propio cambio
    // de altura del navbar al condensarse/expandirse
    const SCROLL_ON = 100;  // umbral para condensar
    const SCROLL_OFF = 70;  // umbral para expandir 
    const onScroll = () => {
      const y = window.scrollY || 0;
      setIsScrolled((prev) => {
        if (!prev && y > SCROLL_ON) return true;
        if (prev && y < SCROLL_OFF) return false;
        return prev;
      });
      if (y > 50 && showAnnouncement && !scrollCloseTimeoutRef.current) {
        scrollCloseTimeoutRef.current = setTimeout(() => {
          closeAnnouncement(true);
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
  }, [showAnnouncement]);

  // Reset menú cuando cambian ruta/params
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown("");
  }, [pathname, searchParams]);

  // Anuncio: mostrar según localStorage
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
          localStorage.removeItem("announcementClosedAt");
          setShowAnnouncement(true);
        }
      } else {
        setShowAnnouncement(true);
      }
    } catch {
      setShowAnnouncement(true);
    }
  }, []);

  // Animación de anuncio
  useEffect(() => {
    if (showAnnouncement) {
      setAnnounceMounted(true);
      requestAnimationFrame(() => setAnnounceActive(true));
    } else {
      setAnnounceActive(false);
      if (announceUnmountTimeoutRef.current)
        clearTimeout(announceUnmountTimeoutRef.current);
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

  const closeAnnouncement = (saveTimestamp = true) => {
    setShowAnnouncement(false);
    if (saveTimestamp) {
      try {
        localStorage.setItem("announcementClosedAt", Date.now().toString());
      } catch {}
    }
    if (scrollCloseTimeoutRef.current) {
      clearTimeout(scrollCloseTimeoutRef.current);
      scrollCloseTimeoutRef.current = null;
    }
  };

  // Menú - CORREGIDO
  const handleMenuItemClick = async (item, subItem = null) => {
    if (subItem) {
      if (item.name === "Tienda") {
        const newPath = `${item.path}?categoria=${encodeURIComponent(subItem)}`;
        await router.push(newPath);
      } else if (item.name === "Tutoriales") {
        // Usar el mapeo directo para tutoriales - URL COMPLETA
        const url = tutorialUrlMap[subItem];
        if (url) {
          await router.push(url);
        } else {
          // Fallback por si acaso
          const slug = slugify(subItem);
          await router.push(`/${slug}`);
        }
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

  // BÚSQUEDA
  useEffect(() => {
    setOpenSearchPanel(Boolean(searchQuery.trim()));
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        setCatalogLoading(true);
        setCatalogError(null);
        const productosRef = collection(firestoreDB, "productosmmm");
        const q = query(productosRef);
        const snapshot = await getDocs(q);
        if (!mounted) return;
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setCatalogProducts(data);
      } catch (err) {
        setCatalogError(err?.message || "Error al cargar productos");
      } finally {
        if (mounted) setCatalogLoading(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpenSearchPanel(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredResults = filterCatalog(catalogProducts, { term: searchQuery });
  const MAX_ROWS = 6;
  const topResults = filteredResults.slice(0, MAX_ROWS);

  const handleFocusSearch = (inputRefTarget) => {
    inputRefTarget?.current?.focus();
    if (searchQuery.trim()) setOpenSearchPanel(true);
  };

  const renderSubmenuInline = (item) => {
    if (!item.submenu || activeDropdown !== item.name) return null;
    return (
      <div
        className="absolute left-0 top-full mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
        style={{ zIndex: 60 }}
        role="menu"
        aria-label={`Submenú de ${item.name}`}
      >
        <div className="py-1">
          {item.submenu.map((subItem) => (
            <button
              key={subItem}
              onClick={() => handleMenuItemClick(item, subItem)}
              className={`block w-full text-left px-4 py-2 text-sm ${getHoverColorClass(
                item.color
              )}`}
              role="menuitem"
              title={`Ver ${subItem} - Manos del Marga Marga`}
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
      <div className="bg-gray-50" role="menu" aria-label={`Submenú de ${item.name}`}>
        {item.name === "Tienda" && (
          <button
            onClick={async () => {
              await router.push(item.path);
              setIsMenuOpen(false);
              setActiveDropdown("");
            }}
            className={`block w-full text-left px-8 py-2 text-sm font-medium border-b border-gray-200 ${getHoverColorClass(item.color)}`}
            role="menuitem"
            title="Ver todas las categorías - Manos del Marga Marga"
          >
            Ver todas las categorías
          </button>
        )}
        {item.submenu.map((subItem) => (
          <button
            key={subItem}
            onClick={() => handleMenuItemClick(item, subItem)}
            className={`block w-full text-left px-8 py-2 text-sm ${getHoverColorClass(
              item.color
            )}`}
            role="menuitem"
            title={`Ver ${subItem} - Manos del Marga Marga`}
          >
            {subItem}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Schema Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Manos del Marga Marga",
            "url": "https://www.manosdelmargamarga.cl",
            "logo": "https://www.manosdelmargamarga.cl/images/logos/mmm.png",
            "description": "Taller de papel artesanal germinable y productos sostenibles. Calidad y servicio en todo Chile.",
            "sameAs": [],
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.manosdelmargamarga.cl/catalogo?query={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* Spacer mobile: altura fija, el navbar no cambia en mobile */}
      <div aria-hidden="true" className="block md:hidden h-16" />

      {/* Spacer desktop: altura variable según scroll */}
      <div
        aria-hidden="true"
        style={{ height: isScrolled ? "56px" : "140px" }}
        className="hidden md:block transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      />

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 w-full z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-[padding,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] py-3 ${
          isScrolled
            ? "bg-white shadow-md md:py-2"
            : "bg-white/90 backdrop-blur-sm md:py-4"
        }`}
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Desktop */}
          <div className="hidden md:block">
            {/* Sin scroll */}
            <div className={`space-y-4 transition-[opacity,max-height,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isScrolled ? "opacity-100 max-h-[200px] translate-y-0" : "opacity-0 max-h-0 -translate-y-2 overflow-hidden"}`}>
              <div className="flex justify-center">
                <Link 
                  href="/" 
                  className="flex-shrink-0"
                  aria-label="Inicio - Manos del Marga Marga"
                  title="Ir al inicio - Manos del Marga Marga"
                >
                  <Image
                    src="/images/logos/mmm.png"
                    alt="Manos del Marga Marga - Taller de papel artesanal germinable y productos sostenibles"
                    width={200}
                    height={40}
                    className="h-14 w-auto"
                    priority
                    loading="eager"
                  />
                </Link>
              </div>

              <div className="flex items-center justify-between">
                {/* Buscador con panel */}
                <div className="relative flex-1 max-w-xs">
                  <form onSubmit={(e) => e.preventDefault()} role="search">
                    <div className="flex">
                      <input
                        ref={inputRefDesktop1}
                        type="search"
                        name="q"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setOpenSearchPanel(true)}
                        className="w-full px-4 py-2 border border-gray-200 text-[#6b554b] rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-200"
                        aria-label="Buscar productos en Manos del Marga Marga"
                        aria-describedby="search-help"
                      />
                      <button
                        type="button"
                        onClick={() => handleFocusSearch(inputRefDesktop1)}
                        className="px-4 py-2 bg-[#eff2d5] text-gray-600 rounded-r-md hover:bg-[#ebf8ca]"
                        aria-label="Ejecutar búsqueda"
                        title="Buscar en catálogo"
                      >
                        <FiSearch size={20} />
                      </button>
                    </div>
                  </form>
                  <span id="search-help" className="sr-only">
                    Busca entre nuestro catálogo
                  </span>

                  {openSearchPanel && (
                    <div
                      ref={panelRefDesktop1}
                      className="absolute left-0 right-0 mt-2 rounded-lg border bg-white shadow-xl overflow-hidden z-[80] pointer-events-auto"
                      role="dialog"
                      aria-label="Resultados de búsqueda"
                      aria-live="polite"
                    >
                      {catalogLoading ? (
                        <div className="p-3 text-sm text-gray-500">
                          Cargando productos...
                        </div>
                      ) : catalogError ? (
                        <div className="p-3 text-sm text-red-600">
                          {String(catalogError)}
                        </div>
                      ) : topResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          No encontramos productos que coincidan con tu búsqueda
                        </div>
                      ) : (
                        <ul className="max-h-96 overflow-auto divide-y">
                          {topResults.map((p) => (
                            <li key={p.id}>
                              <Link
                                href={`/producto/${p.id}`}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => setOpenSearchPanel(false)}
                                onMouseUp={() => {
                                  const href = `/producto/${p.id}`;
                                  setTimeout(() => {
                                    const now =
                                      window.location.pathname +
                                      window.location.search +
                                      window.location.hash;
                                    if (!now.endsWith(`/producto/${p.id}`)) {
                                      router.push(href);
                                    }
                                  }, 0);
                                }}
                                title={`Ver ${p.title} - Manos del Marga Marga`}
                              >
                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                                  <Image
                                    src={
                                      p.images?.[0] ||
                                      p.image ||
                                      "/images/placeholder.png"
                                    }
                                    alt={p.title ? `${p.title} - Producto Manos del Marga Marga` : "Producto Manos del Marga Marga"}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm  text-gray-700 font-medium">
                                    {p.title}
                                  </div>
                                  <div className="text-xs text-gray-500 line-clamp-1">
                                    {p.description}
                                  </div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {filteredResults.length > MAX_ROWS && (
                        <div className="p-2 border-t bg-gray-50">
                          <Link
                            href={`/catalogo?query=${encodeURIComponent(
                              searchQuery
                            )}`}
                            className="block text-center text-sm text-[#6a554c] hover:underline"
                            onClick={() => setOpenSearchPanel(false)}
                            title="Ver todos los resultados de búsqueda"
                          >
                            Ver todos los resultados ({filteredResults.length})
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 mx-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.name}
                      className="relative group"
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                    >
                      {/* Items con submenu dividido (Tienda y Tutoriales) */}
                      {(item.name === "Tienda" || item.name === "Tutoriales") ? (
                        <div className="flex items-center">
                          <Link
                            href={item.path}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path
                                ? getActiveColorClass(item.color)
                                : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                              zIndex: 70,
                            }}
                            aria-current={pathname === item.path ? "page" : undefined}
                            title={`Ir a ${item.name} - Manos del Marga Marga`}
                          >
                            {item.name}
                          </Link>

                          <button
                            onClick={() =>
                              setActiveDropdown((prev) =>
                                prev === item.name ? "" : item.name
                              )
                            }
                            className={`px-2 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              activeDropdown === item.name
                                ? getActiveColorClass(item.color)
                                : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              zIndex: 70,
                            }}
                            aria-label={`Abrir categorías de ${item.name}`}
                            aria-expanded={activeDropdown === item.name}
                          >
                            <svg
                              className={`ml-0 h-4 w-4 transition-transform ${
                                activeDropdown === item.name ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {renderSubmenuInline(item)}
                        </div>
                      ) : (
                        /* Items sin submenu o con submenu simple */
                        <>
                          <Link
                            href={item.path}
                            onClick={() => handleMenuItemClick(item)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path
                                ? getActiveColorClass(item.color)
                                : getHoverColorClass(item.color)
                            }`}
                            aria-current={pathname === item.path ? "page" : undefined}
                            title={`Ir a ${item.name} - Manos del Marga Marga`}
                          >
                            {item.name}
                            {item.submenu && (
                              <svg
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  activeDropdown === item.name
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </Link>

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

            {/* Con scroll */}
            <div className={`transition-[opacity,max-height,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isScrolled ? "opacity-100 max-h-[80px] translate-y-0" : "opacity-0 max-h-0 translate-y-2 overflow-hidden"}`}>
              <div className="flex items-center justify-between">
                <Link 
                  href="/" 
                  className="flex-shrink-0"
                  aria-label="Inicio - Manos del Marga Marga"
                  title="Ir al inicio - Manos del Marga Marga"
                >
                  <Image
                    src="/images/logos/mmm.png"
                    alt="Manos del Marga Marga - Taller de papel artesanal germinable y productos sostenibles"
                    width={120}
                    height={24}
                    className="h-8 w-auto"
                    priority
                    loading="eager"
                  />
                </Link>

                <div className="flex items-center space-x-4 mx-4">
                  <div className="relative">
                    <form onSubmit={(e) => e.preventDefault()} role="search">
                      <div className="flex">
                        <input
                          ref={inputRefDesktop2}
                          type="search"
                          name="q"
                          placeholder="Buscar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchQuery && setOpenSearchPanel(true)}
                          className="w-48 px-3 py-1 text-sm border text-[#6a554c] border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-200"
                          aria-label="Buscar productos en Manos del Marga Marga"
                        />
                        <button
                          type="button"
                          onClick={() => handleFocusSearch(inputRefDesktop2)}
                          className="px-3 py-1 bg-[#eff2d5] text-gray-600 rounded-r-md hover:bg-[#ebf8ca]"
                          aria-label="Ejecutar búsqueda"
                          title="Buscar en catálogo"
                        >
                          <FiSearch size={16} />
                        </button>
                      </div>
                    </form>

                    {openSearchPanel && (
                      <div
                        ref={panelRefDesktop2}
                        className="absolute left-0 right-0 mt-2 rounded-lg border bg-white shadow-xl overflow-hidden z-[80] pointer-events-auto"
                        role="dialog"
                        aria-label="Resultados de búsqueda"
                        aria-live="polite"
                      >
                        {catalogLoading ? (
                          <div className="p-3 text-sm text-gray-500">
                            Cargando productos...
                          </div>
                        ) : catalogError ? (
                          <div className="p-3 text-sm text-red-600">
                            {String(catalogError)}
                          </div>
                        ) : topResults.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">
                            No encontramos productos que coincidan con tu búsqueda
                          </div>
                        ) : (
                          <ul className="max-h-96 overflow-auto divide-y">
                            {topResults.map((p) => (
                              <li key={p.id}>
                                <Link
                                  href={`/producto/${p.id}`}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setOpenSearchPanel(false)}
                                  title={`Ver ${p.title} - Manos del Marga Marga`}
                                >
                                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                                    <Image
                                      src={
                                        p.images?.[0] ||
                                        p.image ||
                                        "/images/placeholder.png"
                                      }
                                      alt={p.title ? `${p.title} - Producto Manos del Marga Marga` : "Producto Manos del Marga Marga"}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-700">
                                      {p.title}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {p.description}
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {filteredResults.length > MAX_ROWS && (
                          <div className="p-2 border-t bg-gray-50">
                            <Link
                              href={`/catalogo?query=${encodeURIComponent(
                                searchQuery
                              )}`}
                              className="block text-center text-sm text-[#6a554c] hover:underline"
                              onClick={() => setOpenSearchPanel(false)}
                              title="Ver todos los resultados de búsqueda"
                            >
                              Ver todos los resultados ({filteredResults.length})
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {menuItems.map((item) => (
                    <div
                      key={item.name}
                      className="relative group"
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                    >
                      {/* Items con submenu dividido (Tienda y Tutoriales) */}
                      {(item.name === "Tienda" || item.name === "Tutoriales") ? (
                        <div className="flex items-center">
                          <Link
                            href={item.path}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path
                                ? getActiveColorClass(item.color)
                                : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                              zIndex: 70,
                            }}
                            aria-current={pathname === item.path ? "page" : undefined}
                            title={`Ir a ${item.name} - Manos del Marga Marga`}
                          >
                            {item.name}
                          </Link>

                          <button
                            onClick={() =>
                              setActiveDropdown((prev) =>
                                prev === item.name ? "" : item.name
                              )
                            }
                            className={`px-2 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              activeDropdown === item.name
                                ? getActiveColorClass(item.color)
                                : getHoverColorClass(item.color)
                            }`}
                            style={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              zIndex: 70,
                            }}
                            aria-label={`Abrir categorías de ${item.name}`}
                            aria-expanded={activeDropdown === item.name}
                          >
                            <svg
                              className={`ml-0 h-4 w-4 transition-transform ${
                                activeDropdown === item.name ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {renderSubmenuInline(item)}
                        </div>
                      ) : (
                        /* Items sin submenu o con submenu simple */
                        <>
                          <Link
                            href={item.path}
                            onClick={() => handleMenuItemClick(item)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                              pathname === item.path
                                ? getActiveColorClass(item.color)
                                : getHoverColorClass(item.color)
                            }`}
                            aria-current={pathname === item.path ? "page" : undefined}
                            title={`Ir a ${item.name} - Manos del Marga Marga`}
                          >
                            {item.name}
                            {item.submenu && (
                              <svg
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  activeDropdown === item.name
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </Link>

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

          {/* Móvil */}
          <div className="md:hidden flex items-center justify-between">
            <Link 
              href="/" 
              className="flex-shrink-0"
              aria-label="Inicio - Manos del Marga Marga"
              title="Ir al inicio - Manos del Marga Marga"
            >
              <Image
                src="/images/logos/mmm.png"
                alt="Manos del Marga Marga - Taller de papel artesanal y productos sostenibles"
                width={150}
                height={30}
                className="h-10 w-auto"
                priority
                loading="eager"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <CartButton />
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "max-h-[32rem] opacity-100 visible mt-2"
                : "max-h-0 opacity-0 invisible"
            }`}
            role="menu"
            aria-hidden={!isMenuOpen}
          >
            <div className="bg-white border rounded-lg shadow-lg">
              <div className="relative p-4 border-b">
                <form onSubmit={(e) => e.preventDefault()} role="search">
                  <div className="flex">
                    <input
                      ref={inputRef}
                      type="search"
                      name="q"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setOpenSearchPanel(true)}
                      className="w-full px-4 py-2 border border-gray-300 text-[#6a554c]  rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      aria-label="Buscar productos en Manos del Marga Marga"
                    />
                    <button
                      type="button"
                      onClick={() => handleFocusSearch(inputRef)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                      aria-label="Ejecutar búsqueda"
                      title="Buscar en catálogo"
                    >
                      <FiSearch size={20} />
                    </button>
                  </div>
                </form>

                {openSearchPanel && (
                  <div
                    ref={panelRef}
                    className="absolute left-4 right-4 mt-2 rounded-lg border bg-white shadow-xl overflow-hidden z-[80] pointer-events-auto"
                    role="dialog"
                    aria-label="Resultados de búsqueda"
                    aria-live="polite"
                  >
                    {catalogLoading ? (
                      <div className="p-3 text-sm text-gray-500">Cargando productos...</div>
                    ) : catalogError ? (
                      <div className="p-3 text-sm text-red-900">
                        {String(catalogError)}
                      </div>
                    ) : topResults.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        No encontramos productos que coincidan con tu búsqueda
                      </div>
                    ) : (
                      <ul className="max-h-96 overflow-auto divide-y">
                        {topResults.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/producto/${p.id}`}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setOpenSearchPanel(false)}
                              title={`Ver ${p.title} - Manos del Marga Marga`}
                            >
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                                <Image
                                  src={
                                    p.images?.[0] ||
                                    p.image ||
                                    "/images/placeholder.png"
                                  }
                                  alt={p.title ? `${p.title} - Producto Manos del Marga Marga` : "Producto Manos del Marga Marga"}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">
                                  {p.title}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {p.description}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {filteredResults.length > MAX_ROWS && (
                      <div className="p-2 border-t bg-gray-50">
                        <Link
                          href={`/catalogo?query=${encodeURIComponent(
                            searchQuery
                          )}`}
                          className="block text-center text-sm text-sky-700 hover:underline"
                          onClick={() => setOpenSearchPanel(false)}
                          title="Ver todos los resultados de búsqueda"
                        >
                          Ver todos los resultados ({filteredResults.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {menuItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        setActiveDropdown((prev) =>
                          prev === item.name ? "" : item.name
                        );
                      } else {
                        handleMenuItemClick(item);
                      }
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
                      pathname === item.path
                        ? getActiveColorClass(item.color)
                        : getHoverColorClass(item.color)
                    }`}
                    aria-expanded={activeDropdown === item.name}
                    title={`Ir a ${item.name} - Manos del Marga Marga`}
                  >
                    {item.name}
                    {item.submenu && (
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
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

      {/* Anuncio */}
      {announceMounted && (
        <div
          role="complementary"
          aria-label="Anuncio especial para empresas"
          className={`fixed left-0 right-0 bg-[#5c7a0b] text-white py-2 px-4 z-40`}
          style={{ top: isScrolled ? "56px" : "140px" }}
        >
          <div
            className={`max-w-6xl mx-auto px-4 flex justify-center items-center transition-transform transition-opacity duration-300 ease-out transform ${
              announceActive
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            }`}
          >
            <p className="text-sm font-medium">
              ¿Necesitas cotización para Agencia, Fondos, Institución o Empresa?
              Haz click en botón WhatsApp.
            </p>
            <button
              onClick={() => closeAnnouncement(true)}
              className="ml-4 p-1 hover:bg-[#7bb93e] rounded-full transition-colors"
              aria-label="Cerrar anuncio"
              title="Cerrar este anuncio"
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