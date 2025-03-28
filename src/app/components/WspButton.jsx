"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const WspButton = () => {
  // Estado para controlar si estamos en el cliente
  const [isMounted, setIsMounted] = useState(false);
  
  // Solo renderizar después de que el componente se monte en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Actualizado para Manos del Marga Marga
  const message = encodeURIComponent(
    "Hola, me interesa obtener más información sobre productos de papel reciclado."
  );
  const whatsappUrl = `https://wa.me/+56322121504?text=${message}`;
  
  // No renderizar nada durante SSR
  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link 
        href={whatsappUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-110"
      >
        <Image 
          src="/images/icons/wspicon.svg" 
          alt="Contáctanos por WhatsApp" 
          width={32} 
          height={32}
          priority
        />
      </Link>
    </div>
  );
};

export default WspButton;