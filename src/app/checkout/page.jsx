'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import CheckOut from '../components/cart/CheckOut';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (mounted && cart.length === 0) {
      router.push('/catalogo');
    }
  }, [cart, mounted, router]);
  
  if (!mounted) return null;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/catalogo" className="text-emerald-600 hover:text-emerald-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al catálogo
        </Link>
      </div>
      
      {cart.length > 0 ? (
        <CheckOut />
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 inline-block p-3 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">
            No hay productos en tu carrito para completar la compra.
          </p>
          <Link href="/catalogo" className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors inline-block">
            Ir al catálogo
          </Link>
        </div>
      )}
    </div>
  );
}