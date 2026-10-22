"use client";
import TutorialPlanting from "../components/tutoriales/plantar";
import WspButton from "../components/WspButton";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ComoPlantarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Botón de WhatsApp flotante */}
      <WspButton />

      {/* Hero section */}
      <div className="bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] py-16 border-b-2 border-[#b4cf66]/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-[#798f38]"
          >
            ¿Cómo plantar papel germinable?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600"
          >
            Aprende a cuidar y dar vida a tus semillas con esta guía paso a paso
          </motion.p>
        </div>
      </div>

      {/* Componente del tutorial */}
      <TutorialPlanting />

      {/* Call to action final */}
      <section className="bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#798f38] mb-6"
          >
            ¿Buscas un hermoso recuerdo?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-700 text-lg mb-8"
          >
            Explora nuestra tienda y encuentra el diseño perfecto en papel germinable
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#b4cf66] to-[#98b84d] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#98b84d] hover:to-[#7a9a3a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ver catálogo
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}