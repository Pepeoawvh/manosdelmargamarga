"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase/config";
import { CATEGORY_ALIASES } from "../hooks/shared/useProducts";
import ProductCard from "./product/ProductCard";
import Link from "next/link";
import HeroCarousel from "./HeroCarousel";
import WspButton from "./WspButton";
import BotoneraInfo from "./BotoneraInfo";
import ClientesBanner from "./ClientesBanner";

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [sortConfig, setSortConfig] = useState({});

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const loadSortConfig = async () => {
      try {
        const snap = await getDoc(doc(firestoreDB, 'config', 'catalogSort'));
        if (snap.exists()) setSortConfig(snap.data().sections || {});
} catch (e) {
      } finally {
        setLoading(false);
      }
    };
    if (isMounted) fetchFeaturedProducts();
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F9F9F9]">
        <div className="w-full h-[60vh] bg-gray-100 animate-pulse" aria-hidden="true" />
        <div className="px-4 md:px-6 py-20" aria-busy="true" aria-live="polite">
          <div className="h-8 w-60 bg-gray-200 mx-auto mb-12 rounded-md animate-pulse" />
          <div className="grid md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ROWS = 4;

  function getFeaturedColumnar(pool, sc) {
    if (!pool.length) return [];
    const conf = sc['Destacados'] || {};
    const getTime = (p) => p.createdAt?.toMillis?.() ?? p.createdAt?.getTime?.() ?? 0;
    const matchesCat = (p, cat) => {
      if (!cat) return true;
      const aliases = CATEGORY_ALIASES[cat] || [];
      return p.categories?.includes(cat) || aliases.some((a) => p.categories?.includes(a));
    };
    const exclude = (arr, used) => arr.filter((p) => !used.has(p.id));

    const used = new Set();

    // Columna 1 — más vendidos
    const ranking = conf.salesRanking || [];
    const col1 = [...pool].sort((a, b) => {
      const ia = ranking.indexOf(a.id), ib = ranking.indexOf(b.id);
      if (ia === -1 && ib === -1) return getTime(b) - getTime(a);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }).slice(0, ROWS);
    col1.forEach((p) => used.add(p.id));

    // Columna 2 — más recientes (excluye col1)
    const col2 = exclude([...pool].sort((a, b) => getTime(b) - getTime(a)), used).slice(0, ROWS);
    col2.forEach((p) => used.add(p.id));

    // Columna 3 — categoría elegida en admin (excluye col1+col2)
    const col3Cat = conf.col3Category;
    const col3 = exclude(
      (col3Cat ? pool.filter((p) => matchesCat(p, col3Cat)) : [...pool])
        .sort((a, b) => getTime(b) - getTime(a)),
      used
    ).slice(0, ROWS);
    col3.forEach((p) => used.add(p.id));

    // Columna 4 — categoría elegida en admin (excluye col1+col2+col3)
    const col4Cat = conf.col4Category;
    const col4 = exclude(
      (col4Cat ? pool.filter((p) => matchesCat(p, col4Cat)) : [...pool])
        .sort((a, b) => getTime(b) - getTime(a)),
      used
    ).slice(0, ROWS);

    // Intercalar por filas: [c1[0], c2[0], c3[0], c4[0], c1[1], ...]
    const result = [];
    for (let i = 0; i < ROWS; i++) {
      if (col1[i]) result.push(col1[i]);
      if (col2[i]) result.push(col2[i]);
      if (col3[i]) result.push(col3[i]);
      if (col4[i]) result.push(col4[i]);
    }
    return result;
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
        <div className="px-4 md:px-6">
          <h2 
            id="featured-heading" 
            className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-700"
          >
            Productos destacados de papel artesanal
          </h2>

          {loading ? (
            <div className="text-center py-8" aria-live="polite">
              <p className="text-lg text-gray-600">Cargando diseños destacados…</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              {getFeaturedColumnar(featuredProducts, sortConfig).map((product) => (
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

      {/* Clientes que han trabajado con nosotras */}
      <ClientesBanner />

      {/* CTA WhatsApp */}
      <section className="py-12 bg-gray-50" aria-labelledby="cta-heading">
        <div className="px-4 md:px-6 text-center">
          <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold mb-4 text-gray-700">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="text-gray-700 mb-6">
            Escríbenos por WhatsApp y te ayudamos personal y rápidamente.
          </p>
        </div>
      </section>
    </div>
  );
}
