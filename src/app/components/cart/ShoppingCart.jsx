  'use client'
  import { useEffect, useRef } from 'react';
  import { useRouter } from 'next/navigation';
  import { useCart } from '../../context/CartContext';
  import CartItem from './CartItem';
  import Link from 'next/link';

  const WSP_NUMBER = '+56322121504';

  const buildQuoteCartUrl = (cart) => {
    const lines = [
      '\u00a1Hola! Quisiera cotizar los siguientes productos de Manos del Marga Marga:',
      '',
      ...cart.map((item, i) => {
        const slug = item.slug || item.id || '';
        const url = slug ? `https://www.manosdelmargamarga.cl/producto/${slug}` : '';
        return `${i + 1}. *${item.title}*${url ? ` \u2014 ${url}` : ''}`;
      }),
      '',
      '\u00bfPodr\u00edan informarme disponibilidad y precios? \u00a1Gracias!',
    ];
    return `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

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
    // Verificar si hay productos cotizables
    const hasCotizableItems = cart.some(item => item.cotizable);
    // Verificar si TODOS los productos son cotizables
    const allCotizable = cart.length > 0 && cart.every(item => item.cotizable);
    
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

                {/* Mensaje si hay productos cotizables */}
                {hasCotizableItems && (
                  <div className="text-xs text-[#5e8c30] font-medium">
                    * Tienes productos a pedido en tu carrito. Usa el botón de cotizar para consultarlos.
                  </div>
                )}
                
                <div className="space-y-2">
                  {/* Condicional para "Iniciar Compra": solo disponible si no hay productos sin stock ni cotizables */}
                  {!hasOutOfStockItems && !hasCotizableItems ? (
                    <Link
                      href="/checkout"
                      className="block w-full py-2 px-4 bg-[#9bb158] text-white text-center text-sm font-medium rounded hover:bg-[#b4cf66] transition-colors"
                      onClick={closeCart}
                    >
                      Iniciar Compra
                    </Link>
                  ) : !hasCotizableItems ? (
                    <button
                      disabled
                      className="block w-full py-2 px-4 bg-gray-400 text-gray-600 text-center text-sm font-medium rounded cursor-not-allowed"
                    >
                      Iniciar Compra (No disponible)
                    </button>
                  ) : null}

                  {/* Botón cotizar: aparece si hay al menos un producto cotizable */}
                  {hasCotizableItems && (
                    <a
                      href={buildQuoteCartUrl(cart.filter(i => i.cotizable))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeCart}
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#5e8c30] text-white text-center text-sm font-medium rounded hover:bg-[#4a7326] transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {allCotizable ? 'Cotizar por WhatsApp' : 'Cotizar productos a pedido'}
                    </a>
                  )}

                  {/* Mostrar botón de reservar carrito solo si todos los productos son reservables */}
                  {allReservable && (
                    <button
                      onClick={handleReserveCart}
                      className="block w-full py-2 px-4 bg-[#5e8c30] text-white text-center text-sm font-medium rounded hover:bg-[#4a7326] transition-colors"
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