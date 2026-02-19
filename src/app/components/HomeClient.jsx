"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase/config";
import ProductCard from "./product/ProductCard";
import Link from "next/link";
import HeroCarousel from "./HeroCarousel";
import WspButton from "./WspButton";
import BotoneraInfo from "./BotoneraInfo";

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const q = query(
          collection(firestoreDB, "productosmmm"),
          where("featured", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeaturedProducts(products.filter((p) => Number(p.stock) > 0));
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isMounted) fetchFeaturedProducts();
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full h-[60vh] bg-gray-100 animate-pulse" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-4 py-20" aria-busy="true" aria-live="polite">
          <div className="h-8 w-60 bg-gray-200 mx-auto mb-12 rounded-md animate-pulse" />
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Botón flotante de WhatsApp */}
      <WspButton />

      {/* Hero con carrusel optimizado */}
      <HeroCarousel />

      <BotoneraInfo />

      {/* Productos destacados */}
      <section className="py-16 bg-[#ffffff7a]" aria-labelledby="featured-heading">
        <div className="max-w-6xl mx-auto px-4">
          <h2 
            id="featured-heading" 
            className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#467302]"
          >
            Productos destacados de papel artesanal
          </h2>

          {loading ? (
            <div className="text-center py-8" aria-live="polite">
              <p className="text-lg text-gray-600">Cargando diseños destacados…</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">
                No hay diseños destacados disponibles por ahora.
              </p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/catalogo"
              className="inline-block bg-[#467302] text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all hover:scale-105"
              aria-label="Ver todos los productos del catálogo de papel artesanal"
            >
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="py-12 bg-gray-50" aria-labelledby="cta-heading">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#87a644]">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="text-gray-700 mb-6">
            Escríbenos por WhatsApp para cotizar papel artesanal, reciclado o papel semilla a medida.
          </p>
        </div>
      </section>
    </div>
  );
}
