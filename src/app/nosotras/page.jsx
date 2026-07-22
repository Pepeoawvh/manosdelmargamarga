"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaSeedling,
  FaFemale,
  FaSun,
  FaHeart,
  FaBuilding,
  FaStar,
  FaFlag,
  FaLeaf,
  FaClock,
  FaTrophy,
  FaChartLine,
  FaWhatsapp,
} from "react-icons/fa";

/* ─── Animación base ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Datos de pilares ─── */
const pilares = [
  {
    icon: FaSeedling,
    title: "Regeneración Ambiental",
    text: "Elaboramos papel semilla 100% reciclado, libre de cloro y azufre, que vuelve a la tierra para convertirse en huertos y flores.",
  },
  {
    icon: FaFemale,
    title: "Desarrollo Femenino",
    text: "Somos una red de mujeres del Marga Marga. Creemos en el trabajo artesanal digno como motor de empoderamiento y talento local.",
  },
  {
    icon: FaSun,
    title: "Producción Solar y Limpia",
    text: "Nuestra huella de carbono es mínima. Aprovechamos la energía del sol y reutilizamos cada gota de agua en nuestra propia huerta orgánica.",
  },
  {
    icon: FaHeart,
    title: "Cultura del Cuidado",
    text: "Fomentamos un estilo de vida consciente, promoviendo la creación de pulmones verdes urbanos a través de cada uno de nuestros productos.",
  },
];

/* ─── Datos de certificaciones ─── */
const certificaciones = [
  {
    icon: FaBuilding,
    title: "Mercado Público",
    text: "Habilitada para contratar con el Estado, facilitando la compra pública sostenible y transparente.",
  },
  {
    icon: FaStar,
    title: "Sello Mujeres Proveedoras",
    text: "Reconocidas oficialmente como empresa liderada por mujeres, impulsando la equidad en la cadena de suministro estatal.",
  },
  {
    icon: FaFlag,
    title: "Sello Marca Chile",
    text: "Nuestra producción artesanal cuenta con el respaldo de la marca país, certificando origen, calidad y valor local.",
  },
  {
    icon: FaLeaf,
    title: "Sello R – SERNATUR",
    text: "Formamos parte del Registro Nacional de Prestadores de Servicios Turísticos, garantizando confianza y formalidad legal.",
  },
  {
    icon: FaClock,
    title: "Certificación 40 Horas",
    text: "Nuestro equipo opera con una jornada de 35 horas semanales, priorizando la calidad de vida y el talento humano.",
  },
  {
    icon: FaTrophy,
    title: "Finalistas \"Nada Nos Detiene\"",
    text: "Destacados entre los mejores emprendimientos del país por nuestra innovación y potencial de impacto socioambiental (G100).",
  },
  {
    icon: FaChartLine,
    title: "Asesoría Centro de Negocios",
    text: "Contamos con el respaldo técnico de Sercotec para asegurar una gestión empresarial sólida y profesional.",
  },
];

export default function NosotrasPage() {
  return (
    <main className="bg-[#F9F9F9]">
      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN 1 — HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/images/nosotras/hero-nosotras.jpg"
            alt="Taller de papel artesanal Manos del Marga Marga"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-[#5e8c30]/40"
            aria-hidden="true"
          />
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
          >
            Manos del Marga Marga
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl text-white/90 italic drop-shadow"
          >
            aquí florece la economía circular
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN 2 — HISTORIA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Texto */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#798f38] mb-3">
              Nuestra historia
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
              Desde{" "}
              <span className="text-[#5e8c30]">2008</span>, en el corazón del
              Valle del Marga Marga
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Transformamos residuos en vida. Lo que comenzó como una búsqueda
                de coherencia ambiental, hoy es Manos del Marga Marga,
                microempresa liderada por mujeres que diseña soluciones de
                papelería germinable de autor.
              </p>
              <p>
                Además de fabricar nuestro propio papel, gestionamos un ciclo
                productivo 100% circular. Utilizamos energía solar para el
                secado, agua de pozo filtrada para el riego y evitamos
                cualquier agente químico.
              </p>
              <p className="font-medium text-gray-700">
                Cada hoja que sale de nuestro taller es un compromiso tangible
                con la regeneración de nuestro entorno.
              </p>
            </div>
          </motion.div>

          {/* Imagen */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/nosotras/taller-historia.jpg"
                alt="Artesana elaborando papel semilla en el taller Manos del Marga Marga"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decoración */}
            <div
              className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#cde582]/30 rounded-full blur-2xl"
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN 3 — POR QUÉ SOMOS DIFERENTES
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#ebead5] py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#798f38] mb-3">
              Valores
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              ¿Por qué somos diferentes?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilares.map((pilar, i) => {
              const Icon = pilar.icon;
              return (
                <motion.div
                  key={pilar.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-[#eef6d6] flex items-center justify-center mb-4">
                    <Icon className="text-[#5e8c30] text-2xl" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    {pilar.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {pilar.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN 4 — IMAGEN FULL-WIDTH
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="relative h-[300px] md:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/images/nosotras/taller-fullwidth.jpg"
            alt="Vista panorámica del taller de papel artesanal Manos del Marga Marga"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN 5 — RESPALDAN NUESTRA COHERENCIA
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-24 px-4 md:px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#798f38] mb-3">
              Reconocimientos
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Respaldan nuestra Coherencia
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Una trayectoria de más de 18 años y nuestro modelo de negocio de
              triple impacto están validados por instituciones que garantizan la
              transparencia, el origen y la calidad de nuestra labor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificaciones.map((cert, i) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={cert.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="flex gap-4 items-start bg-gray-50 rounded-xl p-5 border border-gray-100"
                >
                  <div className="w-11 h-11 rounded-full bg-[#cde582]/40 flex items-center justify-center shrink-0">
                    <Icon className="text-[#5e8c30] text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {cert.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECCIÓN 6 — CTA FINAL
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#5e8c30] to-[#4a7025] py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-white mb-3"
          >
            ¿Quieres conocer nuestro trabajo?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/80 mb-8 text-lg"
          >
            Escríbenos y te contamos todo sobre nuestros productos.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a
              href="https://wa.me/56322121504"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#5e8c30] font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
            >
              <FaWhatsapp className="text-xl" />
              Contactar por WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
