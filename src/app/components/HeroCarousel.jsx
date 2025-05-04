import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { firestoreDB } from '../lib/firebase/config';

// Importar estilos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Componente para slide tipo "full" (imagen + texto + botones)
const FullSlide = ({ slide }) => (
  <div className="relative mt-28 h-[500px] md:h-[600px] lg:h-[700px] w-full">
    <div 
      className="absolute inset-0 bg-cover bg-center" 
      style={{ backgroundImage: `url(${slide.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
    </div>
    <div className="relative h-full flex items-center">
      <div className="container mx-auto px-4 md:px-6 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">{slide.description}</p>
        <div className="flex flex-wrap gap-4">
          {slide.primaryButton.show && (
            <a 
              href={slide.primaryButton.url} 
              className="px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-opacity-90"
            >
              {slide.primaryButton.text}
            </a>
          )}
          {slide.secondaryButton.show && (
            <a 
              href={slide.secondaryButton.url} 
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10"
            >
              {slide.secondaryButton.text}
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Componente para slide tipo "image" (solo imagen)
const ImageSlide = ({ slide }) => (
  <div className="relative mt-28 h-[500px] md:h-[600px] lg:h-[700px] w-full">
    <img 
      src={slide.imageUrl} 
      alt="Slide" 
      className="w-full h-full object-cover" 
    />
  </div>
);

// Componente para slide tipo "imageText" (imagen + texto)
const ImageTextSlide = ({ slide }) => (
  <div className="relative mt-28 h-[500px] md:h-[600px] lg:h-[700px] w-full">
    <div 
      className="absolute inset-0 bg-cover bg-center" 
      style={{ backgroundImage: `url(${slide.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
    </div>
    <div className="relative h-full flex items-center">
      <div className="container mx-auto px-4 md:px-6 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">{slide.description}</p>
      </div>
    </div>
  </div>
);

// Componente principal HeroCarousel
export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Añadir estado de error

  useEffect(() => {
    try {
      // Simplificar la consulta inicialmente para diagnosticar
      const q = query(
        collection(firestoreDB, 'carousel-slides'),
        orderBy('order', 'asc')
        // Eliminar el filtro 'where' temporalmente
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Slides obtenidos:', snapshot.docs.length); // Logging para debug
        
        const slidesData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Slide data:', data); // Verificar estructura
          return {
            id: doc.id,
            ...data,
            // Asegurar que estos campos existan para evitar errores
            primaryButton: data.primaryButton || { show: false, text: '', url: '' },
            secondaryButton: data.secondaryButton || { show: false, text: '', url: '' }
          };
        });
        
        // Filtrar por active aquí, si es necesario
        const activeSlides = slidesData.filter(slide => slide.active !== false);
        console.log('Slides activos:', activeSlides.length);
        
        setSlides(activeSlides);
        setLoading(false);
      }, (error) => {
        console.error("Error cargando slides:", error);
        setError(error.message);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error en el hook de carrusel:", error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  // Mostrar mensaje de error si hay algún problema
  if (error) {
    console.error("Error renderizando carousel:", error);
    return (
      <div className="h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">Error cargando carrusel</p>
      </div>
    );
  }

  if (loading) {
    return <div className="h-[500px] bg-gray-100 animate-pulse"></div>;
  }

  if (slides.length === 0) {
    return (
      <div className="h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No hay slides disponibles</p>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      navigation
      className="hero-carousel"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          {slide.type === 'full' ? (
            <FullSlide slide={slide} />
          ) : slide.type === 'image' ? (
            <ImageSlide slide={slide} />
          ) : (
            <ImageTextSlide slide={slide} />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}