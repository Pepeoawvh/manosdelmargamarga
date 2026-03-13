"use client";
import { useState } from "react";
import Link from "next/link";
import AddToCartButton from "../cart/AddToCartButton";
import QuoteButton from "../cart/QuoteButton";

const ProductCard = ({
  product = {},
  isAdmin = false,
  onToggleFeatured,
  onEdit,
  onDelete,
  showInfo = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const {
    id,
    slug,
    image = "",
    additionalImages = [],
    title = "",
    categories = [],
    subcategories = [],
    description = "",
    price = "0",
    oldPrice = 0,
    stock = 0,
    featured = false,
    videoUrl,
    cotizable = false,
  } = product;

  const secondImage = additionalImages[0] || null;

  const mainCategory = categories?.[0] || "";
  const isOutOfStock = Number(stock) === 0;

  const isGifUrl = (url) => !!url && url.toLowerCase().endsWith(".gif");
  const isVideoUrl = (url) =>
    !!url && (url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm") || url.toLowerCase().endsWith(".mov"));

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const yt = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    if (yt && yt[2]?.length === 11) {
      return `https://www.youtube.com/embed/${yt[2]}?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=${yt[2]}`;
    }
    return url;
  };

  // URL canónica por slug o id
  const productHref = `/producto/${slug || id}`;
  const priceInt = Number.parseInt(price || 0);
  const oldPriceInt = Number.parseInt(oldPrice || 0);

  // Textos enriquecidos con keywords SEO
  const titleText = title || "Producto de papel artesanal";
  const descText = description || "Papel artesanal hecho a mano.";
  
  // Alt text optimizado para SEO con contexto descriptivo
  const altText = mainCategory
    ? `${titleText} - papel artesanal hecho a mano, categoría ${mainCategory}`
    : `${titleText} - papel artesanal sostenible hecho a mano`;

  // Imagen fallback
  const handleImgError = (e) => {
    e.currentTarget.src = "/images/placeholder-product.jpg";
  };

  return (
    <article
      className="relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-[360px] w-full max-w-xs mx-auto group"
      onMouseEnter={() => !isAdmin && setIsHovered(true)}
      onMouseLeave={() => !isAdmin && setIsHovered(false)}
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Enlace principal que envuelve media + overlay para priorizar CTR */}
      <Link href={productHref} aria-label={`Ver ${titleText}`} title={titleText} prefetch className="absolute inset-0">
        {/* Imagen base */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={image || "/images/placeholder-product.jpg"}
            alt={altText}
            title={titleText}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
            itemProp="image"
            onError={handleImgError}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-all duration-300" aria-hidden="true" />
        </div>

        {/* Segunda imagen al hover (sin video) */}
        {!videoUrl && secondImage && (
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 hidden md:block ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            <img
              src={secondImage}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          </div>
        )}

        {/* Video/GIF (solo al hover y no en mobile) */}
        {videoUrl && (
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            } hidden md:block`}
            aria-hidden="true"
          >
            {isGifUrl(videoUrl) ? (
              <img src={videoUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : isVideoUrl(videoUrl) ? (
              <video src={videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <iframe
                src={isHovered ? getEmbedUrl(videoUrl) : ""}
                className="w-full h-full"
                title={`Video de ${titleText}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}
      </Link>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
        {cotizable && (
          <span className="text-xs font-medium px-2 py-1 bg-[#5e8c30] text-white rounded-full" aria-label="Producto cotizable">
            Cotizable
          </span>
        )}
        {isOutOfStock && !isAdmin && !cotizable && (
          <span className="text-xs font-medium px-2 py-1 bg-red-500 text-white rounded-full" aria-label="Sin stock">
            Agotado
          </span>
        )}
      </div>

      {/* Destacado: solo visible en el panel de administración */}
      {isAdmin && featured && (
        <div className="absolute top-2 right-2 z-10" aria-label="Producto destacado">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-400 drop-shadow-md">
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Información */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1" itemProp="name">
          {titleText}
        </h3>

        <div className="flex justify-between items-end mt-2">
          {showInfo && (
            <div className="font-bold text-white" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              {cotizable ? (
                <span className="text-[#f5d6c8] text-sm">Precio a cotizar</span>
              ) : priceInt > 0 ? (
                <div className="flex flex-col items-start gap-0.5">
                  {oldPriceInt > 0 && (
                    <span className="text-xs text-white/60 line-through">
                      ${oldPriceInt}
                    </span>
                  )}
                  <span itemProp="price" content={String(priceInt)} className="text-base leading-tight">
                    <span itemProp="priceCurrency" content="CLP" className="text-xs font-normal mr-0.5">CLP</span>
                    {`$${priceInt}`}
                  </span>
                </div>
              ) : (
                <span className="text-sm">Consultar precio</span>
              )}
              <link itemProp="availability" href={isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"} />
            </div>
          )}

          {isAdmin ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onToggleFeatured(product)}
                className={`p-1 rounded-full ${featured ? "text-yellow-500" : "text-gray-400"}`}
                title={featured ? "Quitar de destacados" : "Marcar como destacado"}
                aria-label={featured ? "Quitar de destacados" : "Marcar como destacado"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button onClick={() => onEdit(product)} className="bg-blue-500 text-white text-sm px-2 py-1 rounded" aria-label="Editar producto">
                Editar
              </button>
              <button onClick={() => onDelete(id)} className="bg-red-500 text-white text-sm px-2 py-1 rounded" aria-label="Eliminar producto">
                Eliminar
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <Link
                href={productHref}
                className="px-3 py-[5px] bg-white/90 text-[#5e8c30] text-[11px] font-semibold rounded-full hover:bg-white transition-colors backdrop-blur-sm"
                aria-label={`Ver detalle de ${titleText}`}
                title={`Ver ${titleText}`}
                prefetch
              >
                Ver detalle
              </Link>
              {cotizable ? (
                <QuoteButton
                  product={product}
                  compact={true}
                  aria-label={`Cotizar ${titleText}`}
                />
              ) : (
                <AddToCartButton
                  product={product}
                  compact={true}
                  className="px-3 py-[5px] text-[11px] font-semibold rounded-full"
                  aria-label={`Agregar ${titleText} al carrito`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
  