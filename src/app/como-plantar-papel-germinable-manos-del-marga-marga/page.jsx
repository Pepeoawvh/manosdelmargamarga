"use client";
import TutorialPlanting from "../components/tutoriales/plantar";
import WspButton from "../components/WspButton";

export default function ComoPlantarPage() {
  return (
    <div className="min-h-screen mt-20 bg-white">
      {/* Botón de WhatsApp flotante */}
      <WspButton />

      {/* Menú informativo (si quieres mantenerlo en todas las páginas) */}


      {/* Hero section simple */}
      <section className="bg-white py-5">
        <div className="max-w-4xl mx-auto px-4 text-center">
         
          <p className="text-lg text-gray-500 mt-4">
            Aprende a cuidar y dar vida a tus semillas con esta guía paso a paso.
          </p>
        </div>
      </section>

      {/* Componente del tutorial */}
      <TutorialPlanting />

      {/* Call to action final */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#73a224] mb-6">
            ¿Buscas un hermoso recuerdo?
          </h2>
          <p className="text-gray-700 mb-8">
            Explora nuestra tienda y encuentra el diseño perfecto en papel germinable.
          </p>
          <a
            href="/catalogo"
            className="bg-[#f5f3e9]  text-gray-800 px-8 py-3 rounded-lg hover:bg-[#e3e1d8] transition-colors"
          >
            Ir al catálogo
          </a>
        </div>
      </section>
    </div>
  );
}