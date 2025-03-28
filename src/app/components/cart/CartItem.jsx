'use client'
import { useCart } from '../../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleQuantityChange = (change) => {
    // No permitir cantidades menores a 1
    if (item.quantity + change < 1) return;
    
    // No permitir exceder el stock disponible
    if (item.stock !== undefined && item.quantity + change > item.stock) return;
    
    updateQuantity(item.id, item.quantity + change);
  };
  
  const subtotal = item.price * item.quantity;
  
  return (
    <div className="flex border rounded-md p-2 hover:bg-gray-50">
      {/* Imagen del producto */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            width={64}
            height={64}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Información y controles */}
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-sm font-medium text-gray-900">
          <Link 
            href={`/product/${item.id}`} 
            className="hover:text-emerald-600 transition-colors"
          >
            {item.title}
          </Link>
          <p className="ml-2 text-emerald-700">${subtotal.toLocaleString()}</p>
        </div>
        
        {item.subcategories && item.subcategories.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{item.subcategories.join(', ')}</p>
        )}
        
        <div className="flex items-center justify-between flex-1 text-xs mt-2">
          {/* Control de cantidad */}
          <div className="flex items-center border rounded">
            <button 
              onClick={() => handleQuantityChange(-1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-2">{item.quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              disabled={item.stock !== undefined && item.quantity >= item.stock}
            >
              +
            </button>
          </div>
          
          {/* Botón eliminar */}
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;