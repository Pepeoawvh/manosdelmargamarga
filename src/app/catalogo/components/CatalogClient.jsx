"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/ui/Button";
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from "../../hooks/shared/useProducts";

const DESTACADOS_LIMIT = 6;
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

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [othersPool, setOthersPool] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showCategories, setShowCategories] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get("categoria") || "",
    subcategories: [],
    featured: searchParams.get("destacados") === "1",
    inStock: false,
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const categoria = searchParams.get("categoria") || "";
    const isFeatured = searchParams.get("destacados") === "1";
    setFilters((prev) => ({ ...prev, category: categoria, subcategories: [], featured: isFeatured }));
  }, [searchParams]);

  useEffect(() => {
    if (filters.category || filters.subcategories.length > 0 || filters.featured || filters.inStock) {
      setShowCategories(false);
    } else {
      setShowCategories(true);
    }
  }, [filters]);

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

        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    const categoryMatch = !filters.category || product.categories?.includes(filters.category);
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

      {!showCategories && (
        <div className="flex justify-end mb-3">
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
            {PRODUCT_CATEGORIES.map((category) => {
              const count = products.filter((p) => p.categories?.includes(category) && Number(p.stock) > 0).length;
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
                    {featuredProducts.map((p) => (
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
                    {offerProducts.map((p) => (
                      <div key={p.id} className="min-h-[360px]"><ProductCard product={p} showInfo /></div>
                    ))}
                  </div>
                </>
              )}

              {otherProducts.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4 mt-8">
                    <h2 className="text-2xl font-bold text-gray-700">
                      Otros productos
                    </h2>
                    <Button
                      onClick={() => { clearFilters(); setShowCategories(false); router.push("/catalogo"); }}
                      variant="text" size="sm" className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f]"
                      aria-label="Ver todo el catálogo" title="Ver todo el catálogo"
                    >
                      Ver todos
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {otherProducts.map((p) => (
                      <div key={p.id} className="min-h-[360px]"><ProductCard product={p} showInfo /></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
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
            {filteredProducts.map((product) => (
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
