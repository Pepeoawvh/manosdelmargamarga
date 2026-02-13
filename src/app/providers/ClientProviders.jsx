'use client'
import { useState, useEffect, Suspense } from 'react';
import { CartProvider } from '../context/CartContext';
import ShoppingCart from '../components/cart/ShoppingCart';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WspButton from '../components/WspButton';

export default function ClientProviders({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <CartProvider>
      <div className="relative z-10">
        <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
          <Navbar />
        </Suspense>
        <main className="text-[#768651] md:max-w-6xl md:mx-auto md:px-4">
          {children}
        </main>
        <Footer />
        {isMounted && <WspButton />}
      </div>
      {isMounted && <ShoppingCart />}
    </CartProvider>
  );
}