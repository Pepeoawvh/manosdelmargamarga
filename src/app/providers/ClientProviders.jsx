'use client'
import { useState, useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import ShoppingCart from '../components/cart/ShoppingCart';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WspButton from '../components/WspButton';

export default function ClientProviders({ children }) {
  // Estado para controlar si el componente está montado
  // Esto evita problemas de hidratación
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // No renderizar nada durante SSR
  if (!isMounted) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="h-16 bg-white shadow-sm"></div>
        <main className="text-emerald-800 md:max-w-6xl md:mx-auto md:px-4 py-8">
          {/* Esqueleto de carga */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 max-w-md mx-auto mb-8 rounded"></div>
            <div className="h-64 bg-gray-100 rounded-lg mb-8"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="relative z-10">
        <Navbar />
        <main className="text-emerald-800 md:max-w-6xl md:mx-auto md:px-4 pt-16">
          {children}
        </main>
        <Footer />
        <WspButton />
      </div>
      <ShoppingCart />
    </CartProvider>
  );
}