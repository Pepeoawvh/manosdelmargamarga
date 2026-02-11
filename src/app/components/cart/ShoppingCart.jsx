  'use client'
  import { useEffect, useRef } from 'react';
  import { useRouter } from 'next/navigation';
  import { useCart } from '../../context/CartContext';
  import CartItem from './CartItem';
  import Link from 'next/link';

  const ShoppingCart = () => {
    const router = useRouter();
    const { 
      cart, 
      isCartOpen, 
      closeCart, 
      clearCart, 
      subtotal,
      itemCount
    } = useCart();
    
    const cartRef = useRef(null);
    
    // Verificar si hay productos sin stock (stock === 0)
    const hasOutOfStockItems = cart.some(item => item.stock === 0);
    // Verificar si todos los productos son reservables
    const allReservable = cart.length > 0 && cart.every(item => item.reservable);
    
    // Función para ir a reservar carrito
    const handleReserveCart = () => {
      closeCart();
      router.push('/checkout?type=reservation');
    };
    
    // Cerrar carrito con la tecla ESC
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') closeCart();
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [closeCart]);
    
    // Cerrar carrito cuando se hace clic fuera
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (cartRef.current && !cartRef.current.contains(e.target)) {
          closeCart();
        }
      };
      
      if (isCartOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'hidden'; // Evitar scroll de página
      } else {
        document.body.style.overflow = ''; // Restaurar scroll
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = ''; // Asegurar que el scroll se restaure
      };
    }, [isCartOpen, closeCart]);

    if (!isCartOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay semi-transparente */}
        <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        {/* Panel deslizable */}
        <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
          <div 
            ref={cartRef}
            className="w-full transform transition-transform duration-300 bg-white h-full flex flex-col shadow-xl"
          >
            {/* Cabecera */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Tu Carrito ({itemCount})</h2>
              <button 
                onClick={closeCart}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="Cerrar carrito"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del carrito */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-gray-600 font-medium">Tu carrito está vacío</h3>
                  <p className="mt-2 text-sm text-gray-500">Parece que aún no has añadido ningún producto a tu carrito.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer con resumen y acciones */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-[#84a229]">${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  * Los impuestos y costos de envío se calcularán en el checkout
                </div>
                
                {/* Mensaje si hay productos sin stock */}
                {hasOutOfStockItems && (
                  <div className="text-xs text-red-500">
                    * Algunos productos no están disponibles. Solo puedes reservarlos.
                  </div>
                )}
                
                <div className="space-y-2">
                  {/* Condicional para "Iniciar Compra": solo disponible si no hay productos sin stock */}
                  {!hasOutOfStockItems ? (
                    <Link
                      href="/checkout"
                      className="block w-full py-2 px-4 bg-[#9bb158] text-white text-center text-sm font-medium rounded hover:bg-[#b4cf66] transition-colors"
                      onClick={closeCart}
                    >
                      Iniciar Compra
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="block w-full py-2 px-4 bg-gray-400 text-gray-600 text-center text-sm font-medium rounded cursor-not-allowed"
                    >
                      Iniciar Compra (No disponible)
                    </button>
                  )}

                  {/* Mostrar botón de reservar carrito solo si todos los productos son reservables */}
                  {allReservable && (
                    <button
                      onClick={handleReserveCart}
                      className="block w-full py-2 px-4 bg-[#8f5f49] text-white text-center text-sm font-medium rounded hover:bg-[#7ecd07] transition-colors"
                    >
                      Reservar Carrito
                    </button>
                  )}

                  <button
                    onClick={clearCart}
                    className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default ShoppingCart;