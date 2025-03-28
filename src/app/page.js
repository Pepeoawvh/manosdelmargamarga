"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestoreDB } from "./lib/firebase/config";
import ProductCard from "./components/product/ProductCard";
import FeatureCard from "./components/FeatureCard";
import HeroCarousel from "./components/HeroCarousel";
import HowItWorks from "./components/HowItWorks";
import WspButton from "./components/WspButton";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Añadir estado para controlar el renderizado en cliente
  const [isMounted, setIsMounted] = useState(false);

  // Controlar el montaje del componente
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchFeaturedProducts();
    }
  }, [isMounted]);

  // Mostrar un esqueleto de carga mientras el componente se monta
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Esqueleto de carga para el hero */}
        <div className="w-full h-[60vh] bg-gray-100 animate-pulse"></div>
        
        {/* Esqueleto para las secciones */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="h-8 w-60 bg-gray-200 mx-auto mb-12 rounded-md animate-pulse"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="h-64 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <WspButton />
      <HeroCarousel />

      {/* Productos destacados */}
      <section className="py-20 bg-[#ffffff7a]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-emerald-800">
            Diseños Destacados
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">
                Cargando diseños destacados...
              </p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">
                No hay diseños destacados disponibles
              </p>
            </div>
          )}
          <div className="text-center mt-12">
            <button className="bg-emerald-800 text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
              Ver Todos los Diseños
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white text-emerald-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Diseños Exclusivos"
              description="Creamos invitaciones únicas que reflejan tu estilo"
              icon="✨"
            />
            <FeatureCard
              title="Eco-friendly"
              description="Contribuimos al medio ambiente con invitaciones digitales"
              icon="🌱"
            />
            <FeatureCard
              title="Personalización"
              description="Adaptamos cada detalle a tus necesidades"
              icon="🎨"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-emerald-800">
            Lo que dicen nuestros clientes
          </h2>

          <HowItWorks />
        </div>
      </section>
    </div>
  );
}