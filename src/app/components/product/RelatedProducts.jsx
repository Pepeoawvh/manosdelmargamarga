"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import { firestoreDB } from "../../../lib/firebase/config";
import ProductCard from "./ProductCard";
import "swiper/css";
import "swiper/css/navigation";

const RELATED_LIMIT = 8;

const toValues = (value) => (Array.isArray(value) ? value : []);

const getRecommendationScore = (candidate, currentProduct) => {
  const currentCategories = toValues(currentProduct.categories);
  const currentSubcategories = toValues(currentProduct.subcategories);
  const candidateCategories = toValues(candidate.categories);
  const candidateSubcategories = toValues(candidate.subcategories);

  const sharedSubcategories = candidateSubcategories.filter((subcategory) =>
    currentSubcategories.includes(subcategory),
  ).length;
  const sharedCategories = candidateCategories.filter((category) =>
    currentCategories.includes(category),
  ).length;

  return (
    sharedSubcategories * 5 +
    sharedCategories * 3 +
    (candidate.featured ? 1 : 0)
  );
};

export default function RelatedProducts({ product }) {
  const [products, setProducts] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const snapshot = await getDocs(collection(firestoreDB, "productosmmm"));
        if (cancelled) return;

        setProducts(
          snapshot.docs.map((productDoc) => ({
            id: productDoc.id,
            ...productDoc.data(),
          })),
        );
      } catch (error) {
        console.error("No se pudieron cargar los productos recomendados:", error);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const relatedProducts = useMemo(() => {
    if (!product?.id) return [];

    return products
      .filter((candidate) => {
        if (candidate.id === product.id) return false;
        return Number(candidate.stock) > 0 || candidate.personalizable === true;
      })
      .map((candidate) => ({
        candidate,
        score: getRecommendationScore(candidate, product),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, RELATED_LIMIT)
      .map(({ candidate }) => candidate);
  }, [product, products]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="border-t border-gray-100 px-4 py-8 md:px-6" aria-labelledby="related-products-title">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2
          id="related-products-title"
          className="text-xs uppercase tracking-widest font-semibold text-[#798f38]"
        >
          También te puede interesar
        </h2>
        {relatedProducts.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#798f38] text-[#798f38] transition-colors hover:bg-[#798f38] hover:text-white"
              aria-label="Ver recomendaciones anteriores"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#798f38] text-[#798f38] transition-colors hover:bg-[#798f38] hover:text-white"
              aria-label="Ver más recomendaciones"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>

      <Swiper
        modules={[A11y]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={16}
        slidesPerView={1.15}
        breakpoints={{
          640: { slidesPerView: 2.15 },
          1024: { slidesPerView: 3.15 },
          1280: { slidesPerView: 3.35 },
        }}
        className="related-products-swiper !pb-2"
      >
        {relatedProducts.map((relatedProduct) => (
          <SwiperSlide key={relatedProduct.id} className="!h-auto">
            <ProductCard product={relatedProduct} showInfo />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
