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
import { firestoreDB } from "../../lib/firebase/config";

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
  const inputRef = useRef(null);
  const panelRef = useRef(null);

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
      submenu: PRODUCT_CATEGORIES,
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
      yellow: "text-gray-700 hover:text-[#969e9d] hover:bg-[#eff2d5]",
      pink: "text-gray-700 hover:text-pink-600 hover:bg-pink-50",
      green: "text-gray-700 hover:text-[#5e8c30] hover:bg-[#ecf7cd]",
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

  // CLICK OUTSIDE seguro (no interfiere con links)
  useEffect(() => {
    function handleClickOutside(event) {
      if (!navRef.current) return;

      // Ignorar clicks dentro del panel o del input
      if (
        (panelRef.current && panelRef.current.contains(event.target)) ||
        (inputRef.current && inputRef.current.contains(event.target))
      ) {
        return;
      }

      // Cerrar dropdowns/menú si el click fue fuera del navbar
      if (!navRef.current.contains(event.target)) {
        setActiveDropdown("");
        setIsMenuOpen(false);
      }

      // Cerrar panel si fue fuera del input y del panel
      if (
        panelRef.current &&
        inputRef.current &&
        !panelRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setOpenSearchPanel(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []); // [attached_file:27][attached_file:28]

  // SCROLL + cierre de anuncio por scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setIsScrolled(y > 10);
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
  }, [showAnnouncement]); // [attached_file:27]

  // Reset menú cuando cambian ruta/params
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown("");
  }, [pathname, searchParams]); // [attached_file:27]

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
  }, []); // [attached_file:27]

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
  }, [showAnnouncement]); // [attached_file:27]

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

  // Menú
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

  // BÚSQUEDA
  useEffect(() => {
    setOpenSearchPanel(Boolean(searchQuery.trim()));
  }, [searchQuery]); // [attached_file:27]

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
  }, []); // [attached_file:27]

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpenSearchPanel(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []); // [attached_file:27]

  const filteredResults = filterCatalog(catalogProducts, { term: searchQuery });
  const MAX_ROWS = 6;
  const topResults = filteredResults.slice(0, MAX_ROWS);

  const handleFocusSearch = () => {
    inputRef.current?.focus();
    if (searchQuery.trim()) setOpenSearchPanel(true);
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
  };

  const renderSubmenuMobile = (item) => {
    if (!item.submenu || activeDropdown !== item.name) return null;
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
          isScrolled
            ? "bg-white shadow-md py-2"
            : "bg-white/90 backdrop-blur-sm py-3"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Desktop */}
          <div className="hidden md:block">
            {/* Sin scroll */}
            <div className={`${!isScrolled ? "block" : "hidden"} space-y-4`}>
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

              <div className="flex items-center justify-between">
                {/* Buscador con panel */}
                <div className="relative flex-1 max-w-xs">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar en catálogo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setOpenSearchPanel(true)}
                        className="w-full px-4 py-2 border border-gray-200 text-[#6b554b] rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-200"
                        aria-label="Buscar"
                      />
                      <button
                        type="button"
                        onClick={handleFocusSearch}
                        className="px-4 py-2 bg-[#eff2d5] text-gray-600 rounded-r-md hover:bg-[#ebf8ca]"
                        aria-label="Abrir búsqueda"
                      >
                        <FiSearch size={20} />
                      </button>
                    </div>
                  </form>

                  {openSearchPanel && (
                    <div
                      ref={panelRef}
                      className="absolute left-0 right-0 mt-2 rounded-lg border bg-white shadow-xl overflow-hidden z-[80] pointer-events-auto"
                      role="dialog"
                      aria-label="Resultados de búsqueda"
                    >
                      {catalogLoading ? (
                        <div className="p-3 text-sm text-gray-500">
                          Cargando…
                        </div>
                      ) : catalogError ? (
                        <div className="p-3 text-sm text-red-600">
                          {String(catalogError)}
                        </div>
                      ) : topResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">
                          Sin resultados
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
                              >
                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                                  <Image
                                    src={
                                      p.images?.[0] ||
                                      p.image ||
                                      "/images/placeholder.png"
                                    }
                                    alt={p.title || "Producto"}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
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
                      {item.name === "Tienda" ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => router.push(item.path)}
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
                          >
                            {item.name}
                          </button>

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
                            aria-label="Abrir submenú Tienda"
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
                        <>
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

            {/* Con scroll */}
            <div className={`${isScrolled ? "block" : "hidden"}`}>
              <div className="flex items-center justify-between">
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/images/logos/mmm.png"
                    alt="Manos del Marga Marga"
                    width={120}
                    height={24}
                    className="h-8 w-auto"
                  />
                </Link>

                <div className="flex items-center space-x-4 mx-4">
                  <div className="relative">
                    <form onSubmit={(e) => e.preventDefault()} className="flex">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setOpenSearchPanel(true)}
                        className="w-48 px-3 py-1 text-sm border text-[#6a554c] border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleFocusSearch}
                        className="px-3 py-1 bg-[#eff2d5] text-gray-600 rounded-r-md hover:bg-[#ebf8ca]"
                        aria-label="Abrir búsqueda"
                      >
                        <FiSearch size={16} />
                      </button>
                    </form>

                    {openSearchPanel && (
                      <div
                        ref={panelRef}
                        className="absolute left-0 right-0 mt-2 rounded-lg border bg-white shadow-xl overflow-hidden z-[80] pointer-events-auto"
                        role="dialog"
                        aria-label="Resultados de búsqueda"
                      >
                        {catalogLoading ? (
                          <div className="p-3 text-sm text-gray-500">
                            Cargando…
                          </div>
                        ) : catalogError ? (
                          <div className="p-3 text-sm text-red-600">
                            {String(catalogError)}
                          </div>
                        ) : topResults.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">
                            Sin resultados
                          </div>
                        ) : (
                          <ul className="max-h-96 overflow-auto divide-y">
                            {topResults.map((p) => (
                              <li key={p.id}>
                                <Link
                                  href={`/producto/${p.id}`}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setOpenSearchPanel(false)}
                                >
                                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                                    <Image
                                      src={
                                        p.images?.[0] ||
                                        p.image ||
                                        "/images/placeholder.png"
                                      }
                                      alt={p.title || "Producto"}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
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
                            >
                              Ver todos los resultados ({filteredResults.length}
                              )
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
                      {item.name === "Tienda" ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => router.push(item.path)}
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
                          >
                            {item.name}
                          </button>

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
                            aria-label="Abrir submenú Tienda"
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
                        <>
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

          {/* Móvil */}
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
          >
            <div className="bg-white border rounded-lg shadow-lg">
              <div className="relative p-4 border-b">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="flex">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar en catálogo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setOpenSearchPanel(true)}
                      className="w-full px-4 py-2 border border-gray-300 text-[#6a554c]  rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                      type="button"
                      onClick={handleFocusSearch}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                      aria-label="Abrir búsqueda"
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
                  >
                    {catalogLoading ? (
                      <div className="p-3 text-sm text-gray-500">Cargando…</div>
                    ) : catalogError ? (
                      <div className="p-3 text-sm text-red-900">
                        {String(catalogError)}
                      </div>
                    ) : topResults.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        Sin resultados
                      </div>
                    ) : (
                      <ul className="max-h-96 overflow-auto divide-y">
                        {topResults.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/producto/${p.id}`}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setOpenSearchPanel(false)}
                            >
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                                <Image
                                  src={
                                    p.images?.[0] ||
                                    p.image ||
                                    "/images/placeholder.png"
                                  }
                                  alt={p.title || "Producto"}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
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
          aria-live="polite"
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
