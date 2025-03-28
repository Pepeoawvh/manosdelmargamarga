'use client'
import { useCart } from '../../context/CartContext';

const CartButton = () => {
  const { openCart, itemCount } = useCart();
  
  return (
    <button 
      onClick={openCart}
      className="relative p-2 text-gray-800 hover:text-emerald-600 transition-colors"
      aria-label="Ver carrito de compras"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-emerald-600 rounded-full">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;