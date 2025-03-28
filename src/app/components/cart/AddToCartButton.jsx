'use client'
import { useState } from 'react';
import { useCart } from '../../context/CartContext';

const AddToCartButton = ({ product, className = '', showQuantity = true, compact = false, hideText = false }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  
  const incrementQuantity = () => {
    // Limitar la cantidad máxima según el stock disponible
    setQuantity(prev => {
      const maxAvailable = product.stock || 999;
      return Math.min(maxAvailable, prev + 1);
    });
  };
  
  // Verificar si hay stock disponible
  const isOutOfStock = product.stock === 0;

  if (compact) {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 ${className}`}
        title={isOutOfStock ? "Agotado" : "Añadir al carrito"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Icono de carrito con + */}
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2 2h1.5L5 14h13.9c.4 0 .7-.3.8-.6l1.5-8.4c.1-.6-.3-1-.9-1H5.5" />
          {/* El símbolo + en la parte superior del carrito */}
          <path d="M16 8h4" />
          <path d="M18 6v4" />
        </svg>
      </button>
    );
  }
  
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {showQuantity && (
        <div className="flex items-center">
          <button
            onClick={decrementQuantity}
            className="p-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            disabled={quantity <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="mx-3 text-sm font-medium">{quantity}</span>
          
          <button
            onClick={incrementQuantity}
            className="p-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            disabled={product.stock !== undefined && quantity >= product.stock}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          {product.stock !== undefined && (
            <span className="ml-2 text-xs text-gray-500">
              {product.stock > 0 ? `(${product.stock} disponibles)` : '(Agotado)'}
            </span>
          )}
        </div>
      )}
      
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="py-2 px-4 w-full rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Icono de carrito con + */}
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2 2h1.5L5 14h13.9c.4 0 .7-.3.8-.6l1.5-8.4c.1-.6-.3-1-.9-1H5.5" />
          {/* El símbolo + en la parte superior del carrito */}
          <path d="M16 8h4" />
          <path d="M18 6v4" />
        </svg>
        {hideText ? '' : (isOutOfStock ? 'Agotado' : 'Añadir al carrito')}
      </button>
    </div>
  );
};

export default AddToCartButton;