'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';

const AddToCartButton = ({ product, quantity = 1, compact = false, className = '', disabled = false }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  // Función para mostrar notificaciones sin dependencia de Chakra UI
  const showNotification = (message, type = 'success') => {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-3 rounded-md shadow-md text-sm font-medium transition-all duration-500 transform translate-y-0 opacity-100 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Animar salida y eliminar después de un tiempo
    setTimeout(() => {
      notification.classList.replace('translate-y-0', 'translate-y-[-20px]');
      notification.classList.replace('opacity-100', 'opacity-0');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2500);
  };

  // Función para manejar la adición al carrito
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Importante: evitar que el clic se propague al componente padre
    
    if (isAdding || disabled) return;
    
    console.log('Añadiendo producto al carrito:', product);
    
    setIsAdding(true);
    
    try {
      // Verificar que el producto tenga id y price
      if (!product || !product.id) {
        console.error('Producto inválido:', product);
        throw new Error('Producto inválido');
      }
      
      // Formatear producto para consistencia
      const productToAdd = {
        id: product.id,
        title: product.title || '',
        price: parseFloat(product.price) || 0,
        image: product.image || '/placeholder.png',
        stock: product.stock || 0,
        sku: product.sku || ''
      };
      
      // Llamar a la función del contexto del carrito
      addToCart({
        product: productToAdd,
        quantity
      });
      
      // Mostrar notificación de éxito
      showNotification(`${product.title} se ha añadido al carrito`, 'success');
      
      console.log('Producto añadido exitosamente');
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      
      // Mostrar notificación de error
      showNotification("No se pudo añadir el producto al carrito", 'error');
    } finally {
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
    }
  };

  // Determinar si el botón debe estar deshabilitado
  const isOutOfStock = product.stock === 0;
  const isButtonDisabled = isAdding || isOutOfStock || disabled;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isButtonDisabled}
      className={`${className} ${isButtonDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-emerald-700'} transition-all duration-200`}
    >
      {isAdding ? (
        // Estado de carga
        <>
          <span className="inline-block animate-pulse">Añadiendo...</span>
        </>
      ) : isOutOfStock ? (
        // Sin stock
        <>
          <span>Agotado</span>
        </>
      ) : compact ? (
        // Versión compacta
        <>
          <span>Añadir</span>
        </>
      ) : (
        // Versión normal
        <>
          <span>Añadir al carrito</span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;