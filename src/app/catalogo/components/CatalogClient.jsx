"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/ui/Button";
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, CATEGORY_ALIASES } from "../../hooks/shared/useProducts";

const matchesCategory = (product, category) => {
  if (!category) return true;
  const aliases = CATEGORY_ALIASES[category] || [];
  return product.categories?.includes(category) || aliases.some((a) => product.categories?.includes(a));
};

const DESTACADOS_LIMIT = 16;
const OFERTAS_LIMIT = 3;
const OTROS_LIMIT = 6;
const OTROS_ROTATE_MS = 180000;

function pickRandom(array, n) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function CatalogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vistaAll = searchParams.get("vista") === "todo";

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [othersPool, setOthersPool] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [sortConfig, setSortConfig] = useState({});

  const [filters, setFilters] = useState({
    category: searchParams.get("categoria") || "",
    subcategories: [],
    featured: searchParams.get("destacados") === "1",
    inStock: false,
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const loadSortConfig = async () => {
      try {
        const snap = await getDoc(doc(firestoreDB, 'config', 'catalogSort'));
        if (snap.exists()) setSortConfig(snap.data().sections || {});
      } catch (e) {}
    };
    loadSortConfig();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchProducts = async () => {
      try {
        if (!firestoreDB) {
          setLoadingError("Error de conexión a la base de datos");
          setLoading(false);
          return;
        }

        const productosRef = collection(firestoreDB, "productosmmm");
        const q = query(productosRef);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setProducts([]);
          setFeaturedProducts([]);
          setOfferProducts([]);
          setOthersPool([]);
          setOtherProducts([]);
          setLoading(false);
          return;
        }

        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.getTime?.() ?? 0;
            const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.getTime?.() ?? 0;
            return tb - ta;
          });
        setProducts(data);

        const featured = data.filter((p) => p.featured && Number(p.stock) > 0).slice(0, DESTACADOS_LIMIT);
        setFeaturedProducts(featured);

        const offersAll = data.filter((p) => p.categories?.includes("Ofertas") && Number(p.stock) > 0);
        setOfferProducts(offersAll.slice(0, OFERTAS_LIMIT));

        const baseOthers = data.filter((p) => Number(p.stock) > 0 && !p.featured && !(p.categories?.includes("Ofertas")));
        setOthersPool(baseOthers);
        setOtherProducts(pickRandom(baseOthers, OTROS_LIMIT));
      } catch (err) {
        setLoadingError(`Error al cargar productos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isMounted]);

  useEffect(() => {
    if (othersPool.length === 0) return;
    const timer = setInterval(() => setOtherProducts(pickRandom(othersPool, OTROS_LIMIT)), OTROS_ROTATE_MS);
    return () => clearInterval(timer);
  }, [othersPool]);

  const filteredProducts = products.filter((product) => {
    const categoryMatch = !filters.category || matchesCategory(product, filters.category);
    const subcategoryMatch =
      filters.subcategories.length === 0 ||
      filters.subcategories.every((sub) => product.subcategories?.includes(sub));
    const featuredMatch = !filters.featured || product.featured;
    const stockMatch = !filters.inStock || (product.stock && product.stock > 0);
    return categoryMatch && subcategoryMatch && featuredMatch && stockMatch;
  });

  const availableSubcategories = filters.category ? PRODUCT_SUBCATEGORIES[filters.category] || [] : [];

  const clearFilters = () => {
    setFilters({ category: "", subcategories: [], featured: false, inStock: false });
    setShowCategories(true);
  };

  const handleCategorySelect = (category) => {
    setFilters({ category, subcategories: [], featured: false, inStock: false });
    setShowCategories(false);
    router.push(`/catalogo?categoria=${encodeURIComponent(category)}`);
  };

  const handleBackToCategories = () => {
    clearFilters();
    router.push("/catalogo");
  };

  const toggleSubcategory = (sub) => {
    setFilters((prev) => {
      const exists = prev.subcategories.includes(sub);
      return { ...prev, subcategories: exists ? prev.subcategories.filter((s) => s !== sub) : [...prev.subcategories, sub] };
    });
  };

  const applySort = (items, sectionKey) => {
    const conf = sortConfig[sectionKey] || {};
    const type = conf.type || 'fecha_desc';
    const getTime = (p) => p.createdAt?.toMillis?.() ?? p.createdAt?.getTime?.() ?? 0;
    if (type === 'fecha_asc') return [...items].sort((a, b) => getTime(a) - getTime(b));
    if (type === 'precio_desc') return [...items].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    if (type === 'precio_asc') return [...items].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (type === 'masVendidos') {
      const ranking = conf.salesRanking || [];
      return [...items].sort((a, b) => {
        const ia = ranking.indexOf(a.id), ib = ranking.indexOf(b.id);
        if (ia === -1 && ib === -1) return getTime(b) - getTime(a);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    if (type === 'manual') {
      const order = conf.manualOrder || [];
      return [...items].sort((a, b) => {
        const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
        if (ia === -1 && ib === -1) return getTime(b) - getTime(a);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    // fecha_desc (default)
    return [...items].sort((a, b) => getTime(b) - getTime(a));
  };

  // "otros" section: if a custom sort is configured, derive from full pool instead of random
  const sortedOtherProducts = (() => {
    const conf = sortConfig['otros'] || {};
    if (conf.type && conf.type !== 'fecha_desc') {
      return applySort(othersPool.filter((p) => Number(p.stock) > 0), 'otros').slice(0, OTROS_LIMIT);
    }
    return otherProducts; // random rotation
  })();

  // Destacados: lógica columnar — cada columna sigue un criterio distinto
  // Col 1: más vendidos  |  Col 2: más recientes  |  Col 3: categoría config  |  Col 4: categoría config
  const getFeaturedColumnar = () => {
    if (!featuredProducts.length) return [];
    const conf = sortConfig['Destacados'] || {};
    const pool = featuredProducts;
    const ROWS = 4;
    const getTime = (p) => p.createdAt?.toMillis?.() ?? p.createdAt?.getTime?.() ?? 0;
    const exclude = (arr, used) => arr.filter((p) => !used.has(p.id));

    const used = new Set();

    // Columna 1 — más vendidos
    const ranking = conf.salesRanking || [];
    const col1 = [...pool].sort((a, b) => {
      const ia = ranking.indexOf(a.id), ib = ranking.indexOf(b.id);
      if (ia === -1 && ib === -1) return getTime(b) - getTime(a);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }).slice(0, ROWS);
    col1.forEach((p) => used.add(p.id));

    // Columna 2 — más recientes (excluye col1)
    const col2 = exclude([...pool].sort((a, b) => getTime(b) - getTime(a)), used).slice(0, ROWS);
    col2.forEach((p) => used.add(p.id));

    // Columna 3 — categoría elegida en admin (excluye col1+col2)
    const col3Cat = conf.col3Category;
    const col3 = exclude(
      (col3Cat ? [...pool].filter((p) => matchesCategory(p, col3Cat)) : [...pool])
        .sort((a, b) => getTime(b) - getTime(a)),
      used
    ).slice(0, ROWS);
    col3.forEach((p) => used.add(p.id));

    // Columna 4 — categoría elegida en admin (excluye col1+col2+col3)
    const col4Cat = conf.col4Category;
    const col4 = exclude(
      (col4Cat ? [...pool].filter((p) => matchesCategory(p, col4Cat)) : [...pool])
        .sort((a, b) => getTime(b) - getTime(a)),
      used
    ).slice(0, ROWS);

    // Intercalar por filas: [c1[0], c2[0], c3[0], c4[0], c1[1], ...]
    const result = [];
    for (let i = 0; i < ROWS; i++) {
      if (col1[i]) result.push(col1[i]);
      if (col2[i]) result.push(col2[i]);
      if (col3[i]) result.push(col3[i]);
      if (col4[i]) result.push(col4[i]);
    }
    return result;
  };

  const breadcrumbJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Catálogo", item: "https://www.manosdelmargamarga.cl/catalogo" },
      ...(filters.category ? [{
        "@type": "ListItem", position: 2, name: String(filters.category),
        item: `https://www.manosdelmargamarga.cl/catalogo?categoria=${encodeURIComponent(filters.category)}`
      }] : []),
      ...(filters.featured ? [{
        "@type": "ListItem", position: 2, name: "Destacados",
        item: "https://www.manosdelmargamarga.cl/catalogo?destacados=1"
      }] : []),
    ],
  }).replace(/</g, "\\u003c");

  const itemListJson = (!showCategories && filteredProducts.length > 0)
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: filteredProducts.slice(0, 12).map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `https://www.manosdelmargamarga.cl/producto/${p.slug || p.id}`,
          name: p.title,
        })),
      }).replace(/</g, "\\u003c")
    : null;

  return (
    <div className="min-h-screen text-[#535550] mt-4 pt-4 px-4 md:px-6 bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJson }} />
      {itemListJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJson }} />}

      {!showCategories && !vistaAll && (
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-700">
            {filters.featured ? "Productos destacados" : filters.category || "Catálogo"}
          </h1>
          <Button onClick={handleBackToCategories} variant="solid" size="sm" className="bg-[#5e8c30] text-white hover:bg-[#4c7628]">
            Volver a Categorías
          </Button>
        </div>
      )}

      {loading ? (
        <section className="py-8 text-center" aria-busy="true" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 mb-2"></div>
          <p className="text-[#362b26]">Cargando productos...</p>
        </section>
      ) : showCategories ? (
        <>
          <header className="sr-only"><h1>Catálogo: categorías, destacados, ofertas y otros productos</h1></header>

          {/* Vista móvil compacta: 3 columnas, botones tipo chip sin icono;
              En desktop (md+), 4 columnas, tamaños mayores */}
          <section
            className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-2"
            aria-label="Listas de categorías"
          >
            {PRODUCT_CATEGORIES.filter((category) => category !== "Ofertas").map((category) => {
              const count = products.filter((p) => matchesCategory(p, category) && Number(p.stock) > 0).length;
              const selected = filters.category === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  onKeyDown={(e) => e.key === "Enter" && handleCategorySelect(category)}
                  aria-label={`Ver ${count} ${count === 1 ? "producto" : "productos"} en ${category}`}
                  aria-current={selected ? "true" : undefined}
                  className={`
                    group w-full rounded-lg
                    ${selected ? "bg-gray-300 text-gray-800" : "bg-gray-100 text-gray-600"}
                    px-2 py-2 text-xs font-medium shadow-sm
                    hover:bg-gray-200 hover:text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-[#96bf49]
                    transition
                    md:px-3 md:py-3 md:text-sm
                  `}
                >
                  <span className="block truncate text-center">{category}</span>
                  <span className="mt-1 hidden md:block text-xs text-gray-600">
                    {count} {count === 1 ? "producto" : "productos"}
                  </span>
                </button>
              );
            })}
          </section>

          {(featuredProducts.length > 0 || offerProducts.length > 0 || otherProducts.length > 0) && (
            <div className="mt-6">
              {featuredProducts.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-700">
                      Productos destacados
                    </h2>
                    <Button
                      onClick={() => { setFilters({ category: "", subcategories: [], featured: true, inStock: false }); setShowCategories(false); router.push("/catalogo?destacados=1"); }}
                      variant="text" size="sm" className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f]"
                      aria-label="Ver todos los productos destacados" title="Ver todos los destacados"
                    >
                      Ver todos
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    {getFeaturedColumnar().map((p) => (
                      <div key={p.id} className="min-h-[360px]"><ProductCard product={p} showInfo /></div>
                    ))}
                  </div>
                </>
              )}

              {offerProducts.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4 mt-8">
                    <h2 className="text-2xl font-bold text-gray-700">
                      Ofertas especiales
                    </h2>
                    <Button
                      onClick={() => { setFilters({ category: "Ofertas", subcategories: [], featured: false, inStock: false }); setShowCategories(false); router.push("/catalogo?categoria=Ofertas"); }}
                      variant="text" size="sm" className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f]"
                      aria-label="Ver todas las ofertas" title="Ver todas las ofertas"
                    >
                      Ver todos
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    {applySort(offerProducts, 'Ofertas').map((p) => (
                      <div key={p.id} className="min-h-[360px]"><ProductCard product={p} showInfo /></div>
                    ))}
                  </div>
                </>
              )}

              {sortedOtherProducts.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4 mt-8">
                    <h2 className="text-2xl font-bold text-gray-700">
                      Otros productos
                    </h2>
                    <Button
                      onClick={() => { router.push("/catalogo?vista=todo"); }}
                      variant="text" size="sm" className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f]"
                      aria-label="Ver todo el catálogo" title="Ver todo el catálogo"
                    >
                      Ver todos
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedOtherProducts.map((p) => (
                      <div key={p.id} className="min-h-[360px]"><ProductCard product={p} showInfo /></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : vistaAll ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-700">Todo el catálogo</h1>
            <Button onClick={handleBackToCategories} variant="solid" size="sm" className="bg-[#5e8c30] text-white hover:bg-[#4c7628]">
              Volver a Categorías
            </Button>
          </div>
          {PRODUCT_CATEGORIES.map((category) => {
            const categoryProducts = applySort(
              products.filter((p) => matchesCategory(p, category) && Number(p.stock) > 0),
              category
            );
            if (categoryProducts.length === 0) return null;
            return (
              <section key={category} className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-700">{category}</h2>
                  <Button
                    onClick={() => handleCategorySelect(category)}
                    variant="text" size="sm" className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f]"
                    aria-label={`Ver solo ${category}`}
                  >
                    Ver solo {category}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {categoryProducts.map((p) => (
                    <div key={p.id} className="min-h-[360px]">
                      <ProductCard product={p} showInfo />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      ) : (
        <>
          {availableSubcategories.length > 0 && (
            <nav className="mb-4 flex flex-wrap gap-2" aria-label={`Subcategorías de ${filters.category}`}>
              {availableSubcategories.map((sub) => (
                <Button
                  key={sub}
                  onClick={() => toggleSubcategory(sub)}
                  variant={filters.subcategories.includes(sub) ? "solid" : "outline"}
                  size="sm"
                  className="text-[#5e8c30]"
                  aria-pressed={filters.subcategories.includes(sub)}
                >
                  {sub}
                </Button>
              ))}
            </nav>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" aria-label="Resultados filtrados del catálogo">
            {applySort(filteredProducts, filters.featured ? 'Destacados' : filters.category || '').map((product) => (
              <div key={product.id} className="min-h-[360px]">
                <ProductCard product={product} showInfo />
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
