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

function AltText(slide) {
  if (slide?.alt) return slide.alt;
  if (slide?.title && slide?.description) return `${slide.title} — ${slide.description}`.slice(0, 140);
  if (slide?.title) return slide.title;
  return "Papel artesanal y reciclado de Manos del Marga Marga";
}

const FullSlide = ({ slide, priority = false }) => (
  <div className={`relative w-full ${heights} overflow-hidden`}>
    <Image
      src={slide.imageUrl}
      alt={AltText(slide)}
      fill
      className="object-cover"
      priority={priority}
      sizes="100vw"
    />
    <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
    <div className="relative h-full flex items-center">
      <div className="container mx-auto px-4 md:px-6 text-white">
        {slide.title && (
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{slide.title}</h1>
        )}
        {slide.description && (
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl">{slide.description}</p>
        )}
        <div className="flex flex-wrap gap-3 md:gap-4">
          {slide.primaryButton?.show && (
            <a
              href={slide.primaryButton.url}
              className="px-5 py-2.5 bg-white text-black font-medium rounded-md hover:bg-opacity-90 text-sm md:text-base"
              aria-label={slide.primaryButton.text || "Ver más"}
            >
              {slide.primaryButton.text}
            </a>
          )}
          {slide.secondaryButton?.show && (
            <a
              href={slide.secondaryButton.url}
              className="px-5 py-2.5 border border-white text-white font-medium rounded-md hover:bg-white/10 text-sm md:text-base"
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

const ImageOnly = ({ slide, priority = false }) => (
  <div className={`relative w-full ${heights} overflow-hidden`}>
    <Image
      src={slide.imageUrl}
      alt={AltText(slide)}
      fill
      className="object-cover"
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      sizes="100vw"
    />
  </div>
);

const ImageText = ({ slide, priority = false }) => (
  <div className={`relative w-full ${heights} overflow-hidden`}>
    <Image
      src={slide.imageUrl}
      alt={AltText(slide)}
      fill
      className="object-cover"
      priority={priority}
      sizes="100vw"
    />
    <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
    <div className="relative h-full flex items-center">
      <div className="container mx-auto px-4 md:px-6 text-white">
        {slide.title && (
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
        )}
        {slide.description && (
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl">{slide.description}</p>
        )}
      </div>
    </div>
  </div>
);

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
