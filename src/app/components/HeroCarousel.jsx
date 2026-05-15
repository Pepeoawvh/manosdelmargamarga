// src/components/HeroCarousel.jsx
"use client";
import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase/config";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// IMPORTANTE: clases en string único para que Tailwind las detecte en build
const heights = "h-[400px] sm:h-[380px] md:h-[380px] lg:h-[380px] xl:h-[420px]";
// Slides usan h-full para heredar la altura del contenedor Swiper
const slideHeights = "h-full";

function AltText(slide) {
  if (slide?.alt) return slide.alt;
  if (slide?.title && slide?.description) {
    const combined = `${slide.title} - ${slide.description}`;
    if (!combined.toLowerCase().includes("papel")) return `${combined.slice(0, 120)} - papel artesanal sostenible`;
    return combined.slice(0, 140);
  }
  if (slide?.title) {
    if (!slide.title.toLowerCase().includes("papel")) return `${slide.title} - papel artesanal hecho a mano`;
    return slide.title;
  }
  return "Papel artesanal, reciclado y papel semilla sostenible - Manos del Marga Marga";
}

// Dos imagenes superpuestas: movil (md:hidden) y desktop (hidden md:block)
// Sin JS de resize: el navegador decide via Tailwind CSS
function DualImage({ desktopSrc, mobileSrc, alt, priority, desktopObjectPosition }) {
  const pos = desktopObjectPosition || "center";
  const mSrc = mobileSrc || desktopSrc;
  return (
    <>
      <Image src={mSrc} alt={alt} fill className="object-cover object-center md:hidden" priority={priority} sizes="100vw" />
      <Image src={desktopSrc} alt={alt} fill className="hidden md:block object-cover" style={{ objectPosition: pos }} priority={priority} sizes="100vw" />
    </>
  );
}

const ALIGN = {
  horizontal: { left: "justify-start", center: "justify-center", right: "justify-end" },
  vertical:   { top: "items-start",    center: "items-center",   bottom: "items-end" },
  text:       { left: "text-left",     center: "text-center" },
};
const MAX_W = { sm:"max-w-sm", md:"max-w-md", lg:"max-w-lg", xl:"max-w-xl", "2xl":"max-w-2xl", "3xl":"max-w-3xl", "4xl":"max-w-4xl", full:"max-w-full" };
const TITLE_SIZES = { small:"text-xl sm:text-2xl md:text-3xl", medium:"text-2xl sm:text-3xl md:text-4xl", large:"text-2xl sm:text-3xl md:text-5xl", xlarge:"text-3xl sm:text-4xl md:text-6xl" };
const OVERLAY_COLORS = { black:"#000000", white:"#ffffff", green:"#798f38" };

// Función para generar clases de botón dinámicamente
function getButtonClasses(style = "solid", size = "md", radius = "md") {
  const sizeMap = {
    sm: "px-3 py-1.5 text-xs md:text-sm",
    md: "px-5 py-2.5 text-sm md:text-base",
    lg: "px-6 py-3 text-base md:text-lg",
  };
  const radiusMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };
  const base = `${sizeMap[size] || sizeMap.md} ${radiusMap[radius] || radiusMap.md} font-medium transition-all border-2`;
  if (style === "solid") return `${base} hover:opacity-90`;
  if (style === "outline") return `${base} hover:opacity-90`;
  if (style === "ghost") return `${base} border-transparent hover:opacity-75`;
  return base;
}

function getButtonStyle(button = {}) {
  const style = button?.style || "solid";
  const bgColor = button?.color || "#798f38";
  const textColor = button?.textColor || (style === "solid" ? "#ffffff" : bgColor);
  const borderColor = button?.borderColor || bgColor;

  return {
    backgroundColor: style === "solid" ? bgColor : "transparent",
    color: textColor,
    borderColor: style === "outline" ? borderColor : "transparent",
  };
}

function useSlideProps(slide, defaultOpacity) {
  const layout  = slide.layout  || { horizontalAlign:"left", verticalAlign:"center", textAlign:"left", maxWidth:"2xl" };
  const styling = slide.styling || { titleSize:"large", titleColor:"#ffffff", descriptionColor:"#ffffff", overlayOpacity:defaultOpacity, overlayColor:"black" };
  const overlayBg      = OVERLAY_COLORS[styling.overlayColor] || OVERLAY_COLORS.black;
  const overlayOpacity = (styling.overlayOpacity || defaultOpacity) / 100;
  return { layout, styling, overlayBg, overlayOpacity };
}

const FullSlide = ({ slide, priority = false }) => {
  const { layout, styling, overlayBg, overlayOpacity } = useSlideProps(slide, 40);
  return (
    <div className={`relative w-full ${slideHeights} overflow-hidden bg-[#f2f2f0]`}>
      <DualImage desktopSrc={slide.imageUrl} mobileSrc={slide.mobileImageUrl} alt={AltText(slide)} priority={priority} desktopObjectPosition={slide.objectPosition} />
      <div className="absolute inset-0" style={{ backgroundColor: overlayBg, opacity: overlayOpacity }} aria-hidden="true" />
      <div className={`relative h-full flex ${ALIGN.vertical[layout.verticalAlign]} ${ALIGN.horizontal[layout.horizontalAlign]} px-4 md:px-6 lg:px-8`}>
        <div className={`w-full ${MAX_W[layout.maxWidth] || MAX_W["2xl"]} ${ALIGN.text[layout.textAlign]}`}>
          {slide.title && (
            <h1 className={`${TITLE_SIZES[styling.titleSize]} font-bold mb-4`} style={{ color: styling.titleColor }}>
              {slide.title}
            </h1>
          )}
          {slide.description && (
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8" style={{ color: styling.descriptionColor }}>
              {slide.description}
            </p>
          )}
          <div className={`flex flex-wrap gap-3 md:gap-4 ${layout.textAlign === "center" ? "justify-center" : ""}`}>
            {slide.primaryButton?.show && (
              <a
                href={slide.primaryButton.url}
                className={getButtonClasses(
                  slide.primaryButton?.style,
                  slide.primaryButton?.size,
                  slide.primaryButton?.radius
                )}
                style={getButtonStyle(slide.primaryButton)}
                aria-label={slide.primaryButton.text || "Ver mas"}
              >
                {slide.primaryButton.text}
              </a>
            )}
            {slide.secondaryButton?.show && (
              <a
                href={slide.secondaryButton.url}
                className={getButtonClasses(
                  slide.secondaryButton?.style,
                  slide.secondaryButton?.size,
                  slide.secondaryButton?.radius
                )}
                style={getButtonStyle(slide.secondaryButton)}
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

const ImageOnly = ({ slide, priority = false }) => (
  <div className={`relative w-full ${slideHeights} overflow-hidden bg-[#f2f2f0]`}>
    <DualImage desktopSrc={slide.imageUrl} mobileSrc={slide.mobileImageUrl} alt={AltText(slide)} priority={priority} desktopObjectPosition={slide.objectPosition} />
  </div>
);

const ImageText = ({ slide, priority = false }) => {
  const { layout, styling, overlayBg, overlayOpacity } = useSlideProps(slide, 30);
  return (
    <div className={`relative w-full ${slideHeights} overflow-hidden bg-[#f2f2f0]`}>
      <DualImage desktopSrc={slide.imageUrl} mobileSrc={slide.mobileImageUrl} alt={AltText(slide)} priority={priority} desktopObjectPosition={slide.objectPosition} />
      <div className="absolute inset-0" style={{ backgroundColor: overlayBg, opacity: overlayOpacity }} aria-hidden="true" />
      <div className={`relative h-full flex ${ALIGN.vertical[layout.verticalAlign]} ${ALIGN.horizontal[layout.horizontalAlign]} px-4 md:px-6 lg:px-8`}>
        <div className={`w-full ${MAX_W[layout.maxWidth] || MAX_W["2xl"]} ${ALIGN.text[layout.textAlign]}`}>
          {slide.title && (
            <h2 className={`${TITLE_SIZES[styling.titleSize]} font-bold mb-4`} style={{ color: styling.titleColor }}>
              {slide.title}
            </h2>
          )}
          {slide.description && (
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8" style={{ color: styling.descriptionColor }}>
              {slide.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HeroCarousel() {
  const [slides, setSlides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const q = query(collection(firestoreDB, "carousel-slides"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => {
          const d = doc.data() || {};
          return {
            id: doc.id, ...d,
            type: d.type || "image",
            primaryButton: {
              show: false,
              text: "",
              url: "",
              color: "#798f38",
              textColor: "#ffffff",
              borderColor: "#798f38",
              style: "solid",
              size: "md",
              radius: "md",
              ...(d.primaryButton || {}),
            },
            secondaryButton: {
              show: false,
              text: "",
              url: "",
              color: "#ffffff",
              textColor: "#ffffff",
              borderColor: "#ffffff",
              style: "outline",
              size: "md",
              radius: "md",
              ...(d.secondaryButton || {}),
            },
            visible: d.visible ?? true,
            layout:  d.layout  || { horizontalAlign:"left", verticalAlign:"center", textAlign:"left", maxWidth:"2xl" },
            styling: d.styling || { titleSize:"large", titleColor:"#ffffff", descriptionColor:"#ffffff", overlayOpacity:40, overlayColor:"black" },
          };
        })
        .filter((s) => s.visible && s.imageUrl);
      setSlides(data);
      setLoading(false);
    }, (err) => {
      setError("No se pudieron cargar las imagenes del carrusel");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const modules = useMemo(() => [Autoplay, Pagination, Navigation], []);

  if (loading)    return <div className={`${heights} bg-gray-100 animate-pulse`} />;
  if (error)      return <div className={`${heights} bg-gray-100 flex items-center justify-center text-red-500`}>{error}</div>;
  if (!slides.length) return <div className={`${heights} bg-gray-100 flex items-center justify-center text-gray-500`}>No hay slides disponibles</div>;

  return (
    <Swiper
      modules={modules} spaceBetween={0} slidesPerView={1}
      autoplay={{ delay: (slides[0]?.autoplaySpeed || 6) * 1000, disableOnInteraction: true, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }} navigation
      aria-label="Carrusel de papel artesanal y reciclado"
      className={`hero-carousel w-full ${heights}`}
    >
      {slides.map((slide, idx) => (
        <SwiperSlide key={slide.id} aria-roledescription="slide" aria-label={`Slide ${idx + 1}`}>
          {slide.type === "full"  ? <FullSlide  slide={slide} priority={idx === 0} /> :
           slide.type === "image" ? <ImageOnly  slide={slide} priority={idx === 0} /> :
                                    <ImageText  slide={slide} priority={idx === 0} />}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}