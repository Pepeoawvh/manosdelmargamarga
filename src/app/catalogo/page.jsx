"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase/config";
import ProductCard from "../components/product/ProductCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SUBCATEGORIES,
} from "../hooks/shared/useProducts";

// Iconos para categorías
const categoryIcons = {
  "Bolitas de Semilla": "🌱",
  Papeles: "📄",
  Brandeables: "🏷️",
  Celebraciones: "🎉",
  Figuras: "🎭",
  "Hazlo tu mismo": "🛠️",
  Tarjetas: "💌",
  Ofertas: "💸",
};

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategories, setShowCategories] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get("categoria") || "",
    subcategories: [], // ahora es un array para multi-selección
    featured: false,
    inStock: false,
  });

  // Montaje
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const categoria = searchParams.get("categoria") || "";
    setFilters((prev) => ({ ...prev, category: categoria, subcategories: [] }));
  }, [searchParams]);

  // Cargar productos desde Firestore
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
          setLoading(false);
          return;
        }

        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setProducts(data);

        setFeaturedProducts(
          data.filter((p) => p.featured && p.stock > 0).slice(0, 6)
        );
        setOfferProducts(
          data
            .filter((p) => p.categories?.includes("Ofertas") && p.stock > 0)
            .slice(0, 3)
        );
      } catch (err) {
        setLoadingError(`Error al cargar productos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isMounted]);

  // Mostrar categorías si no hay filtros activos
  useEffect(() => {
    if (filters.category || searchTerm) setShowCategories(false);
    else setShowCategories(true);
  }, [filters.category, searchTerm]);

  // Filtrado de productos
  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      !filters.category || product.categories?.includes(filters.category);

    const subcategoryMatch =
      filters.subcategories.length === 0 ||
      filters.subcategories.every((sub) =>
        product.subcategories?.includes(sub)
      );

    const featuredMatch = !filters.featured || product.featured;
    const stockMatch = !filters.inStock || (product.stock && product.stock > 0);
    const searchMatch =
      !searchTerm ||
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      categoryMatch &&
      subcategoryMatch &&
      featuredMatch &&
      stockMatch &&
      searchMatch
    );
  });

  const availableSubcategories = filters.category
    ? PRODUCT_SUBCATEGORIES[filters.category] || []
    : [];

  const clearFilters = () => {
    setFilters({
      category: "",
      subcategories: [],
      featured: false,
      inStock: false,
    });
    setSearchTerm("");
    setShowCategories(true);
  };

  const handleCategorySelect = (category) =>
    setFilters({ ...filters, category, subcategories: [] });
  const handleBackToCategories = () => clearFilters();

  const toggleSubcategory = (sub) => {
    setFilters((prev) => {
      const exists = prev.subcategories.includes(sub);
      return {
        ...prev,
        subcategories: exists
          ? prev.subcategories.filter((s) => s !== sub)
          : [...prev.subcategories, sub],
      };
    });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white ">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-8 bg-gray-200 w-64 mx-auto rounded animate-pulse mb-8"></div>
          <div className="h-4 bg-gray-200 w-1/2 mx-auto rounded animate-pulse mb-12"></div>
          <div className="h-20 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-48  bg-gray-100 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#535550] bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-2">
        {loadingError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{loadingError}</p>
          </div>
        )}

        <div className="pt-4 rounded-lg ">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex w-full mb-2 h-fit ">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                className="border-2 border-[#f2ddd3]"
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#6b554b"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>

            {!showCategories && (
              <Button
                onClick={handleBackToCategories}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-white bg-[#5e8c30] "
              >
                Volver a Categorías
              </Button>
            )}
          </div>
        </div>

        {(filters.category ||
          filters.subcategories.length > 0 ||
          filters.featured ||
          filters.inStock ||
          searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#96bf49] text-white">
                {filters.category}
                <button
                  onClick={() =>
                    setFilters({ ...filters, category: "", subcategories: [] })
                  }
                  className="ml-2 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {filters.subcategories.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#fff9f7] text-[#6b554b]"
              >
                {sub}
                <button
                  onClick={() => toggleSubcategory(sub)}
                  className="ml-2 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Búsqueda: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}

        {availableSubcategories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {availableSubcategories.map((sub) => (
              <Button
                key={sub}
                onClick={() => toggleSubcategory(sub)}
                variant={
                  filters.subcategories.includes(sub) ? "solid" : "outline"
                }
                size="sm"
                className="text-[#5e8c30]"
              >
                {sub}
              </Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6b554b] mb-2"></div>
            <p className="text-[#362b26]">Cargando productos...</p>
          </div>
        ) : showCategories && !searchTerm ? (
          <>
            {products.length === 0 ? (
              <div className=" mx-24 text-center py-8 text-gray-600">
                No hay productos disponibles en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-2 mx-4 md:grid-cols-4 gap-2">
                {PRODUCT_CATEGORIES.map((category) => {
                  const count = products.filter(
                    (p) => p.categories?.includes(category) && p.stock > 0
                  ).length;
                  return (
                    <div
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="bg-[#f1f0e6] hover:bg-[#f8f8f3] rounded-lg shadow-md p-2 flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-[#96bf49]"
                    >
                      <div className="text-xl">
                        {categoryIcons[category] || "📦"}
                      </div>
                      <h3 className="text-md font-medium text-center">
                        {category}
                      </h3>
                      <p className="text-xs text-gray-700 mt-2 text-center">
                        {count} {count === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {(featuredProducts.length > 0 || offerProducts.length > 0) && (
              <div className="mt-6">
                {featuredProducts.length > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-[#5e8c30] flex items-center">
                        <span className="mr-2">★</span> Productos Destacados
                      </h2>
                      <Button
                        onClick={() => handleCategorySelect("Ofertas")}
                        variant="text"
                        size="sm"
                        className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f] focus:!ring-0 active:!bg-[#6aa437]"
                      >
                        Ver todos →
                      </Button>{" "}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {featuredProducts.map((p) => (
                        <ProductCard key={p.id} product={p} showInfo />
                      ))}
                    </div>
                  </>
                )}

                {offerProducts.length > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-4 mt-8">
                      <h2 className="text-2xl font-bold text-red-600 flex items-center">
                        <span className="mr-2">🏷️</span> Ofertas Especiales
                      </h2>
                      <Button
                        onClick={() => handleCategorySelect("Ofertas")}
                        variant="text"
                        size="sm"
                        className="!bg-[#96bf49] !text-white hover:!bg-[#7fb43f] focus:!ring-0 active:!bg-[#6aa437]"
                      >
                        Ver todos →
                      </Button>{" "}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {offerProducts.map((p) => (
                        <ProductCard key={p.id} product={p} showInfo />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No se encontraron productos con los filtros aplicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showInfo />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
