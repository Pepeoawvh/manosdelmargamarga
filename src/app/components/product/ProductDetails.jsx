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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-6">
        {/* Columna de imágenes - carrusel moderno */}
        <div>
          <div
            className="relative h-[480px] md:h-[520px] mb-4 rounded-md overflow-hidden"
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
                      activeImage === idx ? "bg-[#8f5f49] w-10" : "bg-gray-300"
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
          {/* Encabezado */}
          <div className="mb-4">
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
              <p className="text-[#798f38] italic mt-1">{product.subtitle}</p>
            )}
          </div>

          {/* Precio y stock */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-[#798f38]">
                  {product.cotizable
                    ? 'Precio a cotizar'
                    : priceInt > 0
                    ? `$${priceInt.toLocaleString()}`
                    : 'Consultar precio'}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${Number.parseInt(product.oldPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">{product.cotizable ? 'Precio según requerimiento' : 'IVA incluido'}</div>
            </div>

            <div className="text-sm">
              {product.cotizable ? (
                <span className="font-semibold inline-block rounded-full px-3 py-1 bg-[#f5e6e0] text-[#8f5f49]">
                  Producto a pedido
                </span>
              ) : stockInt > 0 ? (
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`font-semibold inline-block rounded-full px-3 py-1 ${
                      stockInt > 10
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {stockInt > 10 ? "En stock" : `¡Solo quedan ${stockInt}!`}
                  </span>
                </div>
              ) : (
                <span className="text-red-600 font-semibold">Agotado</span>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Descripción
            </h3>
            <div className="text-gray-600 whitespace-pre-line">
              {product.description}
            </div>
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
                  className="w-full bg-[#8f5f49] text-white py-3 rounded-md shadow"
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
      <div className="border-t p-4 md:p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Información adicional
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Detalles del producto
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {product.dimensions && (
                  <tr className="border-b">
                    <td className="py-2 font-medium text-gray-600">
                      Dimensiones
                    </td>
                    <td className="py-2 text-gray-600">{product.dimensions}</td>
                  </tr>
                )}
                {product.material && (
                  <tr className="border-b">
                    <td className="py-2 font-medium text-gray-600">Material</td>
                    <td className="py-2 text-gray-600">{product.material}</td>
                  </tr>
                )}
                {product.subcategories && product.subcategories.length > 0 && (
                  <tr className="border-b">
                    <td className="py-2 font-medium text-gray-600">Tipo</td>
                    <td className="py-2 text-gray-600">
                      {product.subcategories.join(", ")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 font-medium text-gray-600">SKU</td>
                  <td className="py-2 text-gray-600">
                    {product.id?.substring(0, 8) || "No disponible"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Envío y entrega
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[#798f38] mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Envío a todo Chile</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[#798f38] mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>3-5 días hábiles para entrega</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[#798f38] mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Compras seguras con WebPay</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
