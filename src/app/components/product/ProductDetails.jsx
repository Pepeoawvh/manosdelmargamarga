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
import Image from "next/image";
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
        console.error("Error al cargar el producto:", err);
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
  const priceInt = Number(product.price || 0);
  const stockInt = Number(product.stock || 0);

  const canonicalPath = `/producto/${product.slug || product.id}`;
  const canonicalUrl = `https://www.manosdelmargamarga.cl${canonicalPath}`;

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
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "CLP",
            price: priceInt,
            availability:
              stockInt > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        })}
      </Script>

      {/* Encabezado: siempre visible arriba (especialmente en móvil) */}
      <div className="px-4 pt-4 md:hidden">
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.map((category) => (
              <Link
                key={category}
                href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
              >
                {category}
              </Link>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-800 leading-tight">
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="text-gray-400 italic text-sm mt-1">{product.subtitle}</p>
        )}
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
              <Image
                src={images[activeImage]}
                alt={product.title || "Producto"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md"
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

          {/* Indicadores y miniaturas */}
          {images.length > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-2 w-8 rounded-full transition-all ${
                      activeImage === idx ? "bg-[#5e8c30] w-10" : "bg-gray-300"
                    }`}
                    aria-label={`Ir a imagen ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="hidden sm:flex items-center space-x-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-14 w-14 border-2 rounded-md overflow-hidden flex-shrink-0 ${
                      activeImage === idx
                        ? "border-[#cde582]"
                        : "border-gray-200 hover:border-[#a3d01c]"
                    }`}
                    aria-label={`Miniatura ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`Miniatura ${idx + 1} - ${product.title}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />  
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna de información */}
        <div className="flex flex-col space-y-4">
          {/* Encabezado: solo visible en desktop (en móvil se muestra arriba del grid) */}
          <div className="hidden md:block mb-4">
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categories.map((category) => (
                  <Link
                    key={category}
                    href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                    className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-gray-400 italic mt-1">{product.subtitle}</p>
            )}
          </div>

          {/* Precio */}
          <div className="mb-6">
            {product.oldPrice > 0 && !product.cotizable && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-400 line-through">
                  ${Number.parseInt(product.oldPrice)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full  text-green-600">
                  Oferta
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-[#798f38]">
                {product.cotizable
                  ? 'Precio a cotizar'
                  : priceInt > 0
                  ? `$${priceInt}`
                  : 'Consultar precio'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{product.cotizable ? 'Precio según requerimiento' : 'IVA incluido'}</div>
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
            {product.cotizable ? (
              <span className="inline-block text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5">
                Producto a pedido
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

          {/* Características */}
          {product.subcategories && product.subcategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Características
              </h3>
              <ul className="list-disc pl-5 text-gray-600 text-sm">
                {product.subcategories.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Añadir al carrito, Reservar o Cotizar */}
          <div className="mt-auto space-y-3">
            {product.cotizable ? (
              <>
                <p className="text-sm text-gray-500 italic">
                  Este producto es a pedido / servicio personalizado. Contáctanos para cotizar.
                </p>
                <QuoteButton product={product} />
              </>
            ) : (
              <>
                <AddToCartButton
                  product={product}
                  className="w-full bg-[#5e8c30] hover:bg-[#7fb43f] text-white py-3 rounded-md shadow"
                />
                {product.reservable && (
                  <ReservationButton
                    product={product}
                    className="py-3 rounded-md shadow"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área de detalles adicionales */}
      <div className="border-t border-gray-100 px-4 py-6 md:px-6">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-[#798f38] mb-5">
          Información adicional
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
          {/* Envío y entrega */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-3">
              Envío y entrega
            </h3>
            <ul className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0 md:space-x-6 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#eef6d6] flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#5e8c30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                </span>
                <span className="text-gray-600">Envío a todo Chile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#eef6d6] flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#5e8c30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="text-gray-600">3–5 días hábiles para entrega</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#eef6d6] flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#5e8c30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <span className="text-gray-600">Compras seguras con WebPay</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
