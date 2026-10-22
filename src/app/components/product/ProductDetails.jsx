// components/product/ProductDetails.jsx
// components/product/ProductDetails.jsx
"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";
import AddToCartButton from "../cart/AddToCartButton";
import ReservationButton from "../cart/ReservationButton";
import QuoteButton from "../cart/QuoteButton";
import ShareButton from "./ShareButton";
import RelatedProducts from "./RelatedProducts";
import Link from "next/link";
import Script from "next/script";

const isFirestoreId = (value) =>
  typeof value === "string" && value.length === 20;

const ProductDetails = ({ productSlug }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!productSlug) return;

    const fetchById = async (id) => {
      const snap = await getDoc(doc(firestoreDB, "productosmmm", id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    };

    const fetchBySlug = async (slug) => {
      const q = query(
        collection(firestoreDB, "productosmmm"),
        where("slug", "==", slug),
      );
      const qs = await getDocs(q);
      if (qs.empty) return null;
      const d = qs.docs[0];
      return { id: d.id, ...d.data() };
    };

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        let data = null;

        if (isFirestoreId(productSlug)) {
          data = await fetchById(productSlug);
        } else {
          data = await fetchBySlug(productSlug);
        }

        if (!data) {
          setError("Producto no encontrado");
        } else {
          setProduct(data);
        }
      } catch (err) {
        setError("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col space-y-4 w-full max-w-3xl">
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <Link
          href="/catalogo"
          className="mt-4 inline-block px-4 py-2 bg-[#b4cf66] text-white rounded"
        >
          Ver todos los productos
        </Link>
      </div>
    );
  }

  const images = [product.image, ...(product.additionalImages || [])]
    .filter(Boolean)
    .slice(0, 5);
  const rawPrice = parseFloat(product.price);
  const priceInt = isFinite(rawPrice) && rawPrice >= 0 ? Math.round(rawPrice) : 0;
  const stockInt = Number(product.stock || 0);

  const canonicalPath = `/producto/${product.slug || product.id}`;
  const canonicalUrl = `https://www.manosdelmargamarga.cl${canonicalPath}`;

  const priceValidUntilDate = new Date();
  priceValidUntilDate.setFullYear(priceValidUntilDate.getFullYear() + 1);
  const priceValidUntil = priceValidUntilDate.toISOString().split("T")[0];
  const categoryButtons = (
    <div className="flex flex-wrap gap-2 mb-3">
      {product.categories?.map((category) => (
        <Link
          key={`category-${category}`}
          href={`/catalogo?categoria=${encodeURIComponent(category)}`}
          className="inline-flex items-center rounded-full border border-[#cde582] bg-[#eef6d6] px-3 py-1 text-xs font-medium text-[#5e8c30] transition-colors hover:bg-[#dcecb5] focus:outline-none focus:ring-2 focus:ring-[#798f38] focus:ring-offset-1"
        >
          {category}
        </Link>
      ))}
      {product.subcategories?.map((subcategory) => (
        <Link
          key={`subcategory-${subcategory}`}
          href={`/catalogo?categoria=${encodeURIComponent(product.categories?.[0] || "")}`}
          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#798f38] focus:ring-offset-1"
        >
          {subcategory}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="bg-white mt-12 rounded-lg shadow-sm overflow-hidden">
      <Script id="ld-product" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.title,
          image: images,
          description: (product.description || "").slice(0, 500),
          sku: product.id,
          brand: { "@type": "Brand", name: "Manos del Marga Marga" },
          category: (product.categories || []).join(", "),
          aggregateRating: product.rating && product.rating.count > 0 ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.avg,
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          } : undefined,
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "CLP",
            price: priceInt,
            priceValidUntil: priceValidUntil,
            availability:
              stockInt > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: "Manos del Marga Marga",
            },
          },
        })}
      </Script>

      {/* Encabezado: siempre visible arriba (especialmente en móvil) */}
      <div className="px-4 pt-4 md:hidden">
        {categoryButtons}
        <h1 className="text-xl font-bold text-gray-800 leading-tight">
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="text-gray-400 italic text-sm mt-1">{product.subtitle}</p>
        )}
        <div className="mt-2 flex justify-end">
          <ShareButton title={product.title || ""} url={canonicalUrl} label="Compartir" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-3 pt-2 md:p-6">
        {/* Columna de imágenes - carrusel moderno */}
        <div>
          <div
            className="relative h-[300px] md:h-[520px] mb-4 rounded-md overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft")
                setActiveImage((i) => (i - 1 + images.length) % images.length);
              if (e.key === "ArrowRight")
                setActiveImage((i) => (i + 1) % images.length);
            }}
            aria-roledescription="carousel"
            aria-label="Imágenes del producto"
          >
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.title || "Producto"}
                className="absolute inset-0 h-full w-full object-contain"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}

            {/* Flechas de navegación */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImage(
                      (i) => (i - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-lg p-2 shadow-md"
                  aria-label="Anterior"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-lg p-2 shadow-md"
                  aria-label="Siguiente"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Miniaturas centradas */}
          {images.length > 1 && (
            <div className="flex items-center justify-center space-x-2 overflow-x-auto mt-2">
              {images.map((img, idx) => (
                <button
                  key={`thumb-${idx}`}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-14 w-14 rounded-md overflow-hidden flex-shrink-0 transition-opacity ${
                    activeImage === idx ? "opacity-100" : "opacity-50 hover:opacity-80"
                  }`}
                  aria-label={`Miniatura ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1} - ${product.title}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna de información */}
        <div className="flex flex-col space-y-4">
          {/* Encabezado: solo visible en desktop (en móvil se muestra arriba del grid) */}
            <div className="hidden md:block mb-4">
              {categoryButtons}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {product.title}
                  </h1>
                  {product.subtitle && (
                    <p className="text-gray-400 italic mt-1">{product.subtitle}</p>
                  )}
                </div>
                <ShareButton title={product.title || ""} url={canonicalUrl} label="Compartir" />
              </div>
            </div>

          {/* Precio */}
          <div className="mb-6">
            {product.oldPrice > 0 && !product.hidePrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-400 line-through">
                  ${Number.parseInt(product.oldPrice)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#eef6d6] text-[#5e8c30]">
                  Oferta
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-[#798f38]">
                {product.hidePrice
                  ? priceInt > 0
                    ? 'Precio a cotizar'
                    : 'Consultar precio'
                  : `$${priceInt}`}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {product.hidePrice ? 'Según requerimiento' : 'IVA incluido'}
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="mb-6 border-l-4 border-[#cde582] pl-4">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#798f38] mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Stock */}
          <div className="text-sm">
            {product.personalizable ? (
              <span className="inline-block text-xs text-[#5e8c30] border border-[#cde582] bg-[#eef6d6] rounded px-2 py-0.5">
                Producto personalizable a pedido
              </span>
            ) : stockInt > 0 ? (
              <span className="inline-block text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5">
                {`Stock: ${stockInt}`}
              </span>
            ) : (
              <span className="inline-block text-xs text-red-200 border border-gray-200 rounded px-2 py-0.5">
                Agotado
              </span>
            )}
          </div>

          {/* Área de detalles adicionales */}
          <div className="border-t border-gray-100 pt-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <ul className="flex flex-row flex-wrap items-center justify-between gap-3 text-sm">
                <li className="text-gray-600">Envío a todo Chile</li>
                <li className="text-gray-600">3–5 días hábiles para entrega</li>
                <li className="text-gray-600">Compras seguras con WebPay</li>
              </ul>
            </div>
          </div>

          {/* Añadir al carrito, Reservar o Cotizar */}
          <div className="mt-auto space-y-3">
            {product.personalizable ? (
              <>
                <QuoteButton product={product} />
              </>
            ) : (
              <>
                <AddToCartButton
                  product={product}
                  className="w-full bg-[#5e8c30] hover:bg-[#7fb43f] text-white py-3 rounded-lg shadow"
                />
                {product.reservable && (
                  <ReservationButton
                    product={product}
                    className="py-3 rounded-lg shadow"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <RelatedProducts product={product} />
    </div>
  );
};

export default ProductDetails;
