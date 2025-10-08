// src/components/HeroCarousel.jsx
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase/config";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Componentes para cada tipo de slide
const FullSlide = ({ slide }) => (
  <div className="relative h-auto md:h-[600px] lg:h-[500px] w-full overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center md:h-full h-auto"
      style={{
        backgroundImage: `url(${slide.imageUrl})`,
        aspectRatio: "16/9",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
    </div>
    <div className="relative h-full flex items-center py-12 md:py-0">
      <div className="container mx-auto px-4 md:px-6 text-white">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
          {slide.title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl">
          {slide.description}
        </p>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {slide.primaryButton?.show && (
            <a
              href={slide.primaryButton.url}
              className="px-5 py-2.5 bg-white text-black font-medium rounded-md hover:bg-opacity-90 text-sm md:text-base"
            >
              {slide.primaryButton.text}
            </a>
          )}
          {slide.secondaryButton?.show && (
            <a
              href={slide.secondaryButton.url}
              className="px-5 py-2.5 border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 text-sm md:text-base"
            >
              {slide.secondaryButton.text}
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ImageSlide = ({ slide }) => (
  <div className="relative  h-auto md:h-[600px] lg:h-[500px] w-full overflow-hidden">
    <img
      src={slide.imageUrl}
      alt={slide.title || "Slide"}
      className="w-full h-auto md:h-full object-cover"
      loading="lazy"
    />
  </div>
);

const ImageTextSlide = ({ slide }) => (
  <div className="relative mt-20 h-auto md:h-[600px] lg:h-[500px] w-full overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center md:h-full h-auto"
      style={{
        backgroundImage: `url(${slide.imageUrl})`,
        aspectRatio: "16/9",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
    </div>
    <div className="relative h-full flex items-center py-12 md:py-0">
      <div className="container mx-auto px-4 md:px-6 text-white">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
          {slide.title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl">
          {slide.description}
        </p>
      </div>
    </div>
  </div>
);

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(firestoreDB, "carousel-slides"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slidesData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              type: data.type || "image",
              primaryButton: data.primaryButton || {
                show: false,
                text: "",
                url: "",
              },
              secondaryButton: data.secondaryButton || {
                show: false,
                text: "",
                url: "",
              },
              visible: data.visible ?? true,
            };
          })
          .filter((slide) => slide.visible);

        setSlides(slidesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching slides:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading)
    return <div className="h-[400px] bg-gray-100 animate-pulse"></div>;
  if (error)
    return (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  if (slides.length === 0)
    return (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center text-gray-500">
        No hay slides disponibles
      </div>
    );

  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      className="hero-carousel h-auto md:h-[600px] lg:h-[500px]"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          {slide.type === "full" ? (
            <FullSlide slide={slide} />
          ) : slide.type === "image" ? (
            <ImageSlide slide={slide} />
          ) : (
            <ImageTextSlide slide={slide} />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
