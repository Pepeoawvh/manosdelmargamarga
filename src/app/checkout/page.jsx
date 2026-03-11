"use client"
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import CheckOut from '../components/cart/CheckOut';
import Link from 'next/link';

function CheckoutContent() {
  const { cart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReservation = searchParams.get('type') === 'reservation';
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Redirigir si el carrito está vacío (pero NO si es una reserva)
  useEffect(() => {
    if (mounted && cart.length === 0 && !isReservation) {
      router.push('/catalogo');
    }
  }, [cart, mounted, router, isReservation]);
  
  if (!mounted) return null;
  
  return (
    <div className="px-4 md:px-6 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/catalogo" className="text-[#542e1d] hover:text-[#b3633e] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al catálogo
        </Link>
      </div>
      
      {cart.length > 0 ? (
        <CheckOut isReservation={isReservation} />  // Prop agregada para condicionar OrderSummary
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
          <Link href="/catalogo" className="py-2 px-4 bg-[#542e1d] text-white rounded hover:bg-[#b06441] transition-colors inline-block">
            Ir al catálogo
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="px-4 md:px-6 py-8 md:py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}