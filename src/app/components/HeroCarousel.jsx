'use client'
import { useState, useEffect } from 'react';
import Slide1 from './slides/Slide1';
import Slide2 from './slides/Slide2';
import Slide3 from './slides/Slide3';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      Component: Slide1,
      props: {
        title: "Invitaciones de Boda Virtuales",
        description: "Diseños modernos y ecológicos para tu día especial",
        imageUrl: "/images/backgrounds/Herobg.svg",
        buttons: [
          {
            text: "Ver Catálogo",
            href: "/ecoproducts",
            variant: "primary"
          },
          {
            text: "Contactar",
            href: "/contact",
            variant: "outline"
          }
        ]
      }
    },
    {
Component: Slide2,
  props: {
    imageUrl: "/images/backgrounds/Digitales.svg",
    mobileImageUrl: "/images/backgrounds/DigitalesSF.svg", 
    overlayPosition: "left",
    overlayGradient: "from-emerald-800/20 to-transparent",
    desktopObjectFit: "contain",
    desktopObjectPosition: "center", // Centrado para pantallas grandes
    mobileObjectFit: "contain",
    mobileObjectPosition: "center", // Centrado para móviles
  }
    },
    {
      Component: Slide3,
      props: {
        imageUrl: "/images/backgrounds/Desktop-Image3.svg",
        mobileImageUrl: "/images/backgrounds/Valores.png", // Imagen específica para móvil
        card: {
          title: "",
          description: "",
          position: "right",
          backgroundColor: "bg-white/80",
          textColor: "text-emerald-800"
        }
      }
    }
  ];

  // Manejo automático del cambio de slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 9000); // Tiempo entre cambios de slide

    return () => clearInterval(timer);
  }, []);

  // Funciones para navegación manual
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Contenedor principal de slides con transición suavizada */}
      <div 
        className="flex transition-transform duration-1000 ease-out" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map(({ Component, props }, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <Component {...props} />
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full transition-colors"
        aria-label="Anterior"
      >
        <svg 
          className="w-6 h-6 text-emerald-800" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full transition-colors"
        aria-label="Siguiente"
      >
        <svg 
          className="w-6 h-6 text-emerald-800" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Indicadores de posición */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index 
                ? 'bg-emerald-800' 
                : 'bg-white hover:bg-emerald-800/50'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;