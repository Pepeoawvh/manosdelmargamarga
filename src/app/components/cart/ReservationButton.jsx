'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';

const ReservationButton = ({ product, className = '', disabled = false }) => {
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-3 rounded-md shadow-md text-md font-medium transition-all duration-500 transform translate-y-0 opacity-100 ${
      type === 'success' ? 'bg-[#bbbbbbff] text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.replace('translate-y-0', 'translate-y-[-20px]');
      notification.classList.replace('opacity-100', 'opacity-0');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2500);
  };

  // Función para agregar al carrito
  const handleAddToReservationCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || disabled) return;

    console.log('Agregando producto al carrito de reserva:', product);

    try {
      // Validar que el producto sea válido
      if (!product || !product.id) {
        console.error('Producto inválido:', product);
        throw new Error('Producto inválido');
      }

      // Agregar al carrito (con flag de reserva para omitir validación de stock)
      setIsProcessing(true);
      addToCart(product, { isReservation: true });  // Nuevo: pasar flag
      
      // Mostrar notificación de éxito
      showNotification(`"${product.title}" agregado a tu carrito de reserva`, 'success');
      
      // Reset del estado
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      showNotification('No se pudo agregar el producto', 'error');
      setIsProcessing(false);
    }
  };

  const isOutOfStock = product.stock === 0;
  // Cambiar: No deshabilitar por stock, solo por procesamiento o disabled prop
  const isButtonDisabled = isProcessing || disabled;

  return (
    <button
      onClick={handleAddToReservationCart}
      disabled={isButtonDisabled}
      className={`inline-flex items-center justify-center text-md text-white rounded-md transition-all duration-200 ${
        isButtonDisabled ? 'opacity-60 cursor-not-allowed bg-gray-400' : 'hover:bg-[#6b5447] bg-[#9f9f9f]'
      } w-full ${className}`}
    >
      {isProcessing ? (
        <span className="inline-block animate-pulse">Agregando...</span>
      ) : (
        <div className="w-full p-2 text-white rounded-xl text-sm">
          {/* Cambiar: Mostrar texto adaptado si no hay stock, pero permitir la acción */}
          <span>{isOutOfStock ? 'Reservar (sin stock)' : 'Agregar a Reserva'}</span>
        </div>
      )}
    </button>
  );
};

export default ReservationButton;