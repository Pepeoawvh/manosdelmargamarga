// src/components/HeroCarousel.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase/config";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const heights = "h-[340px] sm:h-[420px] md:h-[560px] lg:h-[520px]";

// Función optimizada para generar alt text descriptivo y SEO-friendly
function AltText(slide) {
  // Si hay alt text personalizado, úsalo
  if (slide?.alt) return slide.alt;
  
  // Si hay título y descripción, combínalos con contexto
  if (slide?.title && slide?.description) {
    const combined = `${slide.title} — ${slide.description}`;
    // Asegurarnos de que incluya "papel artesanal" para SEO
    if (!combined.toLowerCase().includes("papel")) {
      return `${combined.slice(0, 120)} - papel artesanal sostenible`;
    }
    return combined.slice(0, 140);
  }
  
  // Si solo hay título, agregar contexto descriptivo
  if (slide?.title) {
    if (!slide.title.toLowerCase().includes("papel")) {
      return `${slide.title} - papel artesanal hecho a mano`;
    }
    return slide.title;
  }
  
  // Fallback descriptivo
  return "Papel artesanal, reciclado y papel semilla sostenible - Manos del Marga Marga";
}

const FullSlide = ({ slide, priority = false }) => {
  // Valores por defecto para retrocompatibilidad
  const layout = slide.layout || {
    horizontalAlign: "left",
    verticalAlign: "center",
    textAlign: "left",
    maxWidth: "2xl",
  };
  
  const styling = slide.styling || {
    titleSize: "large",
    titleColor: "#ffffff",
    descriptionColor: "#ffffff",
    overlayOpacity: 40,
    overlayColor: "black",
  };

  // Mapeo de clases de alineación
  const alignClasses = {
    horizontal: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    vertical: {
      top: "items-start",
      center: "items-center",
      bottom: "items-end",
    },
    text: {
      left: "text-left",
      center: "text-center",
    },
  };

  // Mapeo de anchos máximos
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  // Mapeo de tamaños de título
  const titleSizes = {
    small: "text-xl sm:text-2xl md:text-3xl",
    medium: "text-2xl sm:text-3xl md:text-4xl",
    large: "text-2xl sm:text-3xl md:text-5xl",
    xlarge: "text-3xl sm:text-4xl md:text-6xl",
  };

  // Color del overlay
  const overlayColors = {
    black: "#000000",
    white: "#ffffff",
    green: "#798f38",
  };

  const overlayBg = overlayColors[styling.overlayColor] || overlayColors.black;
  const overlayOpacity = (styling.overlayOpacity || 40) / 100;

  return (
    <div className={`relative w-full ${heights} overflow-hidden`}>
      <Image
        src={slide.imageUrl}
        alt={AltText(slide)}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
      />
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundColor: overlayBg,
          opacity: overlayOpacity
        }}
        aria-hidden="true" 
      />
      <div className={`relative h-full flex ${alignClasses.vertical[layout.verticalAlign]} ${alignClasses.horizontal[layout.horizontalAlign]} px-4 md:px-6 lg:px-8`}>
        <div className={`w-full ${maxWidthClasses[layout.maxWidth] || maxWidthClasses["2xl"]} ${alignClasses.text[layout.textAlign]}`}>
          {slide.title && (
            <h1 
              className={`${titleSizes[styling.titleSize]} font-bold mb-4`}
              style={{ color: styling.titleColor }}
            >
              {slide.title}
            </h1>
          )}
          {slide.description && (
            <p 
              className="text-base sm:text-lg md:text-xl mb-6 md:mb-8"
              style={{ color: styling.descriptionColor }}
            >
              {slide.description}
            </p>
          )}
          <div className={`flex flex-wrap gap-3 md:gap-4 ${layout.textAlign === 'center' ? 'justify-center' : ''}`}>
            {slide.primaryButton?.show && (
              <a
                href={slide.primaryButton.url}
                className="px-5 py-2.5 bg-white text-black font-medium rounded-md hover:bg-opacity-90 text-sm md:text-base transition-all"
                aria-label={slide.primaryButton.text || "Ver más"}
              >
                {slide.primaryButton.text}
              </a>
            )}
            {slide.secondaryButton?.show && (
              <a
                href={slide.secondaryButton.url}
                className="px-5 py-2.5 border-2 border-white text-white font-medium rounded-md hover:bg-white/10 text-sm md:text-base transition-all"
                aria-label={slide.secondaryButton.text || "Ver detalles"}
              >
                {slide.secondaryButton.text}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageOnly = ({ slide, priority = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentImage =
    isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl;

  const objectPosition = isMobile
    ? slide.mobileObjectPosition || slide.objectPosition || "center"
    : slide.objectPosition || "center";

  return (
    <div className={`relative w-full ${heights} overflow-hidden`}>
      <Image
        src={currentImage}
        alt={AltText(slide)}
        fill
        className="object-cover"
        style={{ objectPosition }}
        priority={priority}
        sizes="(max-width: 767px) 100vw, 100vw"
      />
    </div>
  );
};

const ImageText = ({ slide, priority = false }) => {
  // Valores por defecto para retrocompatibilidad
  const layout = slide.layout || {
    horizontalAlign: "left",
    verticalAlign: "center",
    textAlign: "left",
    maxWidth: "2xl",
  };
  
  const styling = slide.styling || {
    titleSize: "large",
    titleColor: "#ffffff",
    descriptionColor: "#ffffff",
    overlayOpacity: 30,
    overlayColor: "black",
  };

  // Mapeo de clases de alineación
  const alignClasses = {
    horizontal: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    vertical: {
      top: "items-start",
      center: "items-center",
      bottom: "items-end",
    },
    text: {
      left: "text-left",
      center: "text-center",
    },
  };

  // Mapeo de anchos máximos
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  // Mapeo de tamaños de título
  const titleSizes = {
    small: "text-xl sm:text-2xl md:text-3xl",
    medium: "text-2xl sm:text-3xl md:text-4xl",
    large: "text-2xl sm:text-3xl md:text-5xl",
    xlarge: "text-3xl sm:text-4xl md:text-6xl",
  };

  // Color del overlay
  const overlayColors = {
    black: "#000000",
    white: "#ffffff",
    green: "#798f38",
  };

  const overlayBg = overlayColors[styling.overlayColor] || overlayColors.black;
  const overlayOpacity = (styling.overlayOpacity || 30) / 100;

  return (
    <div className={`relative w-full ${heights} overflow-hidden`}>
      <Image
        src={slide.imageUrl}
        alt={AltText(slide)}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
      />
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundColor: overlayBg,
          opacity: overlayOpacity
        }}
        aria-hidden="true" 
      />
      <div className={`relative h-full flex ${alignClasses.vertical[layout.verticalAlign]} ${alignClasses.horizontal[layout.horizontalAlign]} px-4 md:px-6 lg:px-8`}>
        <div className={`w-full ${maxWidthClasses[layout.maxWidth] || maxWidthClasses["2xl"]} ${alignClasses.text[layout.textAlign]}`}>
          {slide.title && (
            <h2 
              className={`${titleSizes[styling.titleSize]} font-bold mb-4`}
              style={{ color: styling.titleColor }}
            >
              {slide.title}
            </h2>
          )}
          {slide.description && (
            <p 
              className="text-base sm:text-lg md:text-xl mb-6 md:mb-8"
              style={{ color: styling.descriptionColor }}
            >
              {slide.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(firestoreDB, "carousel-slides"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => {
            const d = doc.data() || {};
            return {
              id: doc.id,
              ...d,
              type: d.type || "image",
              primaryButton: d.primaryButton || { show: false, text: "", url: "" },
              secondaryButton: d.secondaryButton || { show: false, text: "", url: "" },
              visible: d.visible ?? true,
              // Valores por defecto para nuevas opciones de diseño
              layout: d.layout || {
                horizontalAlign: "left",
                verticalAlign: "center",
                textAlign: "left",
                maxWidth: "2xl",
              },
              styling: d.styling || {
                titleSize: "large",
                titleColor: "#ffffff",
                descriptionColor: "#ffffff",
                overlayOpacity: 40,
                overlayColor: "black",
              },
            };
          })
          .filter((s) => s.visible && s.imageUrl);
        setSlides(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching slides:", err);
        setError("No se pudieron cargar las imágenes del carrusel");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const modules = useMemo(() => [Autoplay, Pagination, Navigation], []);

  if (loading) return <div className={`${heights} bg-gray-100 animate-pulse`} />;
  if (error) return <div className={`${heights} bg-gray-100 flex items-center justify-center text-red-500`}>{error}</div>;
  if (slides.length === 0) return <div className={`${heights} bg-gray-100 flex items-center justify-center text-gray-500`}>No hay slides disponibles</div>;

  return (
    <Swiper
      modules={modules}
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{ delay: 6000, disableOnInteraction: true, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }}
      navigation
      aria-label="Carrusel de papel artesanal y reciclado"
      className={`hero-carousel w-full ${heights}`}
    >
      {slides.map((slide, idx) => (
        <SwiperSlide key={slide.id} aria-roledescription="slide" aria-label={`Slide ${idx + 1}`}>
          {slide.type === "full" ? (
            <FullSlide slide={slide} priority={idx === 0} />
          ) : slide.type === "image" ? (
            <ImageOnly slide={slide} priority={idx === 0} />
          ) : (
            <ImageText slide={slide} priority={idx === 0} />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
