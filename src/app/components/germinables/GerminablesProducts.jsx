'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestoreDB } from '../../lib/firebase/config';
import { ephesis } from '../../ui/fonts';
import ProductCard from '../product/ProductCard'; // Importar ProductCard

const GerminablesProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('todos');
  
  const categories = [
    { id: 'todos', name: 'Todos los modelos' },
    { id: 'rustico', name: 'Estilo rústico' },
    { id: 'elegante', name: 'Elegante' },
    { id: 'minimalista', name: 'Minimalista' },
    { id: 'floral', name: 'Floral' },
  ];
  
  useEffect(() => {
    const fetchGerminableProducts = async () => {
      try {
        const productsQuery = query(
          collection(firestoreDB, 'ecoproductos'),
          where('productType', '==', 'Invitación Germinable')
        );
        
        const querySnapshot = await getDocs(productsQuery);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          category: doc.data().style || 'otros' // Usamos el campo 'style' como categoría
        }));
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching germinable products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGerminableProducts();
  }, []);
  
  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(product => product.category.toLowerCase() === activeCategory);

  return (
    <section id="products" className="select-none py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-6">
            Nuestros modelos <span className={`${ephesis.className} text-4xl md:text-5xl`}>germinables</span>
          </h2>
          <p className="text-lg text-emerald-700">
            Con más de 400 diseños realizados, estas son algunas de nuestras creaciones más populares.
            Cada una puede adaptarse completamente a tu estilo y necesidades.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === category.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              } transition-colors`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-emerald-600">Cargando productos germinables...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                showInfo={true} // Mostrar información detallada
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-emerald-700">
              Estamos en proceso de creación de nuevos modelos germinables. ¡Vuelve pronto para descubrirlos!
            </p>
          </div>
        )}
        
        <div className="mt-16 text-center">
          <p className="text-emerald-700 text-lg mb-6">
            ¿No encuentras lo que buscas? Podemos crear un diseño totalmente personalizado para ti.
          </p>
          <Link 
            href="/contact?product=germinable_custom" 
            className="inline-block px-8 py-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Solicitar diseño personalizado
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GerminablesProducts;