'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, query } from 'firebase/firestore';
import { firestoreDB } from '../lib/firebase/config';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Link from 'next/link';
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from '../hooks/shared/useProducts';

// Imágenes e iconos para las categorías
const categoryIcons = {
  "Bolitas de Semilla": "🌱",
  "Papeles": "📄",
  "Brandeables": "🏷️",
  "Celebraciones": "🎉",
  "Figuras": "🎭",
  "Hazlo tu mismo": "🛠️",
  "Tarjetas": "💌",
  "Ofertas": "🏷️"
};

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategories, setShowCategories] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loadingError, setLoadingError] = useState(null);
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('categoria') || '',
    subcategory: '',
    featured: false,
    inStock: false
  });

  // Control de montaje para evitar errores de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

useEffect(() => {
  const categoria = searchParams.get('categoria') || '';
  setFilters((prev) => ({
    ...prev,
    category: categoria,
    subcategory: '' // limpiar subcategoría si cambia categoría
  }));
}, [searchParams]);

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!firestoreDB) {
          setLoadingError('Error de conexión a la base de datos');
          setLoading(false);
          return;
        }
        const productosRef = collection(firestoreDB, 'productosmmm');
        const q = query(productosRef);
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const productsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            ...data
          });
        });
        setProducts(productsData);

        // Destacados y ofertas SOLO con stock > 0
        const featured = productsData.filter(product => product.featured && product.stock > 0);
        setFeaturedProducts(featured.slice(0, 6));
        const offers = productsData.filter(product => 
          product.categories && 
          product.categories.includes('Ofertas') && 
          product.stock > 0
        );
        setOfferProducts(offers.slice(0, 3));
      } catch (error) {
        setLoadingError(`Error al cargar productos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchProducts();
    }
  }, [isMounted]);

  // Efecto para mostrar productos cuando hay una categoría seleccionada
  useEffect(() => {
    if (filters.category) {
      setShowCategories(false);
    }
  }, [filters.category]);

  // Aplicar filtros a los productos
  const filteredProducts = products.filter(product => {
    // Filtrar por categoría
    const categoryMatch = !filters.category || 
      (product.categories && product.categories.includes(filters.category));
    
    // Filtrar por subcategoría
    const subcategoryMatch = !filters.subcategory || 
      (product.subcategories && product.subcategories.includes(filters.subcategory));
    
    // Filtrar por destacados
    const featuredMatch = !filters.featured || product.featured === true;
    
    // SIEMPRE filtrar por stock > 0 (fix principal)
    const stockMatch = product.stock && product.stock > 0;
    
    // Filtrar por término de búsqueda
    const searchMatch = !searchTerm || 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && subcategoryMatch && featuredMatch && stockMatch && searchMatch;
  });

  // Obtener subcategorías disponibles según la categoría seleccionada
  const availableSubcategories = () => {
    if (!filters.category) return [];
    if (PRODUCT_SUBCATEGORIES[filters.category]) {
      return PRODUCT_SUBCATEGORIES[filters.category];
    }
    const subcategories = new Set();
    products.forEach(product => {
      if (product.categories && product.categories.includes(filters.category) && product.subcategories) {
        product.subcategories.forEach(sub => subcategories.add(sub));
      }
    });
    return Array.from(subcategories);
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      featured: false,
      inStock: false
    });
    setSearchTerm('');
    setShowCategories(true);
  };

  // Manejar selección de categoría
  const handleCategorySelect = (category) => {
    setFilters({
      ...filters,
      category: category,
      subcategory: ''
    });
    setShowCategories(false);
  };

  // Volver a la vista de categorías
  const handleBackToCategories = () => {
    clearFilters();
    setShowCategories(true);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-8 bg-gray-200 w-64 mx-auto rounded animate-pulse mb-8"></div>
          <div className="h-4 bg-gray-200 w-1/2 mx-auto rounded animate-pulse mb-12"></div>
          <div className="h-20 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-emerald-800 bg-gray-50 pt-12">
      <main className="max-w-6xl mx-auto px-4 py-2">
        <h1 className="text-4xl font-bold text-center">Nuestros Productos</h1>
        <p className="text-center mt-4 text-gray-600 mb-8">
          Explora nuestra colección de productos artesanales en papel reciclado
        </p>

        {loadingError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{loadingError}</p>
            <p className="text-red-500 text-sm mt-1">Intenta recargar la página o contacta con soporte.</p>
          </div>
        )}

        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) {
                    setShowCategories(false);
                  } else if (!filters.category) {
                    setShowCategories(true);
                  }
                }}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            {!showCategories && (
              <Button 
                onClick={handleBackToCategories}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Volver a Categorías
              </Button>
            )}
          </div>
        </div>

        {(filters.category || filters.subcategory || filters.featured || filters.inStock || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                {filters.category}
                <button
                  onClick={() => {
                    setFilters({...filters, category: '', subcategory: ''});
                    setShowCategories(true);
                  }}
                  className="ml-2 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.subcategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
                {filters.subcategory}
                <button
                  onClick={() => setFilters({...filters, subcategory: ''})}
                  className="ml-2 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Búsqueda: {searchTerm}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    if (!filters.category) setShowCategories(true);
                  }}
                  className="ml-2 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-2"></div>
            <p className="text-emerald-700">Cargando productos...</p>
          </div>
        ) : showCategories && !searchTerm ? (
          <>
            {/* PRIMERO: Categorías */}
            <h2 className="text-2xl font-bold mb-6 text-center text-emerald-800">
              Nuestras Categorías
            </h2>
            
            {products.length === 0 && !loading && !loadingError ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No hay productos disponibles en este momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {PRODUCT_CATEGORIES.map((category) => {
                  const count = products.filter(p => 
                    p.categories && 
                    p.categories.includes(category) && 
                    p.stock > 0
                  ).length;
                  
                  return (
                    <div 
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-emerald-500"
                    >
                      <div className="text-4xl mb-3">{categoryIcons[category] || '📦'}</div>
                      <h3 className="text-lg font-medium text-center">{category}</h3>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {count} {count === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* SEGUNDO: Destacados y Ofertas */}
            {(featuredProducts.length > 0 || offerProducts.length > 0) && (
              <div className="mt-8">
                {featuredProducts.length > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-emerald-700 flex items-center">
                        <span className="mr-2">★</span> Productos Destacados
                      </h2>
                      <Button 
                        onClick={() => {
                          setFilters({...filters, featured: true});
                          setShowCategories(false);
                        }}
                        variant="text"
                        size="sm"
                      >
                        Ver todos <span className="ml-1">→</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {featuredProducts.slice(0, 3).map((product) => (
                        <ProductCard 
                          key={product.id}
                          product={product}
                          showInfo={true}
                        />
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
                        onClick={() => handleCategorySelect('Ofertas')}
                        variant="text"
                        size="sm"
                      >
                        Ver todas <span className="ml-1">→</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {offerProducts.map((product) => (
                        <ProductCard 
                          key={product.id}
                          product={product}
                          showInfo={true}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Vista de productos filtrados */}
            {filters.category && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    {categoryIcons[filters.category] || '📦'} {filters.category}
                  </h2>
                  
                  {/* Filtros adicionales en vista de productos */}
                  <div className="flex items-center gap-3">
                    {availableSubcategories().length > 0 && (
                      <div className="flex items-center">
                        <select
                          value={filters.subcategory}
                          onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                          className="text-sm border rounded p-1 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Todos los tipos</option>
                          {availableSubcategories().map(subcategory => (
                            <option key={subcategory} value={subcategory}>
                              {subcategory}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={filters.inStock}
                        onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Productos */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    showInfo={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-gray-600">
                  No se encontraron productos con los filtros seleccionados
                </p>
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}