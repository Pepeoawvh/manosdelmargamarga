// app/tutoriales/page.jsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaSeedling, FaCogs, FaPaintBrush } from "react-icons/fa";

const cards = [
  {
    href: "/como-plantar-papel-germinable-manos-del-marga-marga",
    title: "¿Cómo plantar?",
    desc: "Guía paso a paso para plantar papel germinable y disfrutar de hermosas flores.",
    icon: <FaSeedling className="text-3xl" />,
    color: "from-[#b4cf66] to-[#98b84d]",
    hoverColor: "hover:from-[#98b84d] hover:to-[#7a9a3a]",
  },
  {
    href: "/tutoriales/como-trabajamos",
    title: "¿Cómo trabajamos?",
    desc: "Conoce nuestro proceso completo, desde la consulta hasta el despacho.",
    icon: <FaCogs className="text-3xl" />,
    color: "from-[#798f38] to-[#657a2e]",
    hoverColor: "hover:from-[#657a2e] hover:to-[#536425]",
  },
  {
    href: "/tutoriales/protocolo-grafico",
    title: "Protocolo gráfico",
    desc: "Recomendaciones técnicas para diseñadores y mejores resultados de impresión.",
    icon: <FaPaintBrush className="text-3xl" />,
    color: "from-[#798f38] to-[#657a2e]",
    hoverColor: "hover:from-[#657a2e] hover:to-[#536425]",
  },
];

export default function Tutoriales() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] py-16 border-b-2 border-[#b4cf66]/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-[#798f38]"
          >
            Centro de Tutoriales
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600"
          >
            Aprende todo lo necesario sobre nuestros productos y servicios
          </motion.p>
        </div>
      </div>

      {/* Cards Section */}
      <section className="px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={card.href}
                className="group block h-full"
              >
                <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                  {/* Icon Header */}
                  <div className={`bg-gradient-to-br ${card.color} ${card.hoverColor} transition-all duration-300 p-6 flex justify-center items-center h-32`}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="text-white"
                    >
                      {card.icon}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#798f38] transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {card.desc}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-[#798f38] font-semibold group-hover:gap-3 transition-all">
                      <span>Ver tutorial</span>
                      <svg 
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#798f38] mb-6"
          >
            ¿No encuentras lo que buscas?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-700 text-lg mb-8"
          >
            Estamos aquí para ayudarte. Contáctanos y resolveremos todas tus dudas
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#b4cf66] to-[#98b84d] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#98b84d] hover:to-[#7a9a3a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Contactar con nosotros
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
