'use client'
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB } from '../../../lib/firebase/config';
import AddToCartButton from '../cart/AddToCartButton';
import Image from 'next/image';
import Link from 'next/link';

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const docRef = doc(firestoreDB, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          setProduct(productData);
          
          // Después podríamos cargar productos relacionados
          // por categoría o subcategoría
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col space-y-4 w-full max-w-3xl">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-600">{error || 'No se pudo cargar el producto'}</p>
        <Link href="/catalogo" className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
          Ver todos los productos
        </Link>
      </div>
    );
  }

  // Preparar imágenes (imagen principal + adicionales si existen)
  const images = [product.image];
  if (product.additionalImages && Array.isArray(product.additionalImages)) {
    images.push(...product.additionalImages);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-6">
        {/* Columna de imágenes */}
        <div>
          <div className="relative h-[400px] mb-4 border rounded overflow-hidden bg-gray-50">
            <Image
              src={images[activeImage]}
              alt={product.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          
          {/* Miniaturas de imágenes adicionales */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-16 w-16 border-2 rounded overflow-hidden flex-shrink-0 ${
                    activeImage === idx ? 'border-emerald-500' : 'border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Vista ${idx + 1} - ${product.title}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Columna de información */}
        <div className="flex flex-col">
          {/* Encabezado */}
          <div className="mb-4">
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categories.map((category) => (
                  <Link 
                    key={category}
                    href={`/catalogo?categoria=${category}`}
                    className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
            {product.subtitle && (
              <p className="text-emerald-600 italic mt-1">{product.subtitle}</p>
            )}
          </div>
          
          {/* Precio y stock */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold text-emerald-700">${parseInt(product.price).toLocaleString()}</span>
              {product.oldPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${parseInt(product.oldPrice).toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="text-sm">
              {product.stock > 0 ? (
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {product.stock > 10 ? 'En stock' : `¡Solo quedan ${product.stock}!`}
                </span>
              ) : (
                <span className="text-red-600 font-medium">Agotado</span>
              )}
            </div>
          </div>
          
          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
            <div className="text-gray-600 whitespace-pre-line">
              {product.description}
            </div>
          </div>
          
          {/* Características adicionales si existen */}
          {product.subcategories && product.subcategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Características</h3>
              <ul className="list-disc pl-5 text-gray-600 text-sm">
                {product.subcategories.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Añadir al carrito */}
          <div className="mt-auto">
            <AddToCartButton product={product} className="w-full" />
          </div>
        </div>
      </div>
      
      {/* Área de detalles adicionales */}
      <div className="border-t p-4 md:p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Información adicional</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Detalles del producto</h3>
            <table className="w-full text-sm">
              <tbody>
                {product.dimensions && (
                  <tr className="border-b">
                    <td className="py-2 font-medium text-gray-600">Dimensiones</td>
                    <td className="py-2 text-gray-600">{product.dimensions}</td>
                  </tr>
                )}
                {product.material && (
                  <tr className="border-b">
                    <td className="py-2 font-medium text-gray-600">Material</td>
                    <td className="py-2 text-gray-600">{product.material}</td>
                  </tr>
                )}
                {product.subcategories && product.subcategories.length > 0 && (
                  <tr className="border-b">
                    <td className="py-2 font-medium text-gray-600">Tipo</td>
                    <td className="py-2 text-gray-600">{product.subcategories.join(', ')}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 font-medium text-gray-600">SKU</td>
                  <td className="py-2 text-gray-600">{product.id?.substring(0, 8) || 'No disponible'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Envío y entrega</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Envío a todo Chile</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>3-5 días hábiles para entrega</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Compras seguras con WebPay</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;