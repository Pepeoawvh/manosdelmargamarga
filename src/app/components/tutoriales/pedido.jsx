"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FaWhatsapp, 
  FaCalculator, 
  FaCreditCard, 
  FaPalette, 
  FaCogs, 
  FaTruck 
} from "react-icons/fa";

const steps = [
  { 
    number: "1", 
    title: "Nos Consultas", 
    description: "Por WhatsApp o comprando a través del sitio web. Estamos disponibles para responder todas tus preguntas.", 
    icon: <FaWhatsapp className="text-2xl" />,
    color: "from-[#b4cf66] to-[#98b84d]"
  },
  { 
    number: "2", 
    title: "Cotizamos", 
    description: "Si nos contactas por WhatsApp, contamos con sistema de cotización rápida, completa y con imágenes referenciales para presentar propuestas.", 
    icon: <FaCalculator className="text-2xl" />,
    color: "from-[#cde582] to-[#b4cf66]"
  },
  { 
    number: "3", 
    title: "Pago e Ingreso", 
    description: "Transfieres o envías OC. Ingresamos tu pedido en nuestro calendario de trabajo y fijamos fechas de entrega.", 
    icon: <FaCreditCard className="text-2xl" />,
    color: "from-[#a3d01c] to-[#8bb817]"
  },
  { 
    number: "4", 
    title: "Prueba Impresa", 
    description: "Independiente de si tomas nuestro servicio de diseño o usas tus archivos, SIEMPRE hacemos y te enviamos imágenes de PRUEBA IMPRESA para APROBACIÓN.", 
    icon: <FaPalette className="text-2xl" />,
    color: "from-[#798f38] to-[#657a2e]"
  },
  { 
    number: "5", 
    title: "Producción", 
    description: "Nos ponemos manos a la obra. Al iniciar esta etapa indicaremos fecha de envío exacta.", 
    icon: <FaCogs className="text-2xl" />,
    color: "from-[#8f5f49] to-[#7a4f3b]"
  },
  { 
    number: "6", 
    title: "Despachamos", 
    description: "El medio de entrega queda establecido al momento de cotizar. Usamos Blue Express a domicilio; para plazos acotados, Chilexpress* (costo adicional). También puedes retirar en nuestro taller sin costo.", 
    icon: <FaTruck className="text-2xl" />,
    color: "from-[#b4cf66] to-[#8f5f49]"
  },
];

export default function HacerPedido() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50" aria-labelledby="como-funciona-pedido" role="region">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] py-16 border-b-2 border-[#b4cf66]/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            id="como-funciona-pedido"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-[#798f38]"
          >
            ¿Cómo funciona un pedido?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600"
          >
            Un proceso simple y transparente de 6 pasos
          </motion.p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="px-4 md:px-6 py-16">
        <ol className="relative border-l-4 border-[#b4cf66] ml-8 md:ml-0 md:border-l-0 space-y-12" role="list">
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative"
            >
              {/* Connector line - hidden on first item */}
              {index > 0 && (
                <div className="hidden md:block absolute left-1/2 -top-12 w-0.5 h-12 bg-gradient-to-b from-gray-200 to-transparent transform -translate-x-1/2" />
              )}

              <div className="md:flex md:items-start md:gap-8">
                {/* Number Badge - Mobile timeline dot */}
                <div className="absolute -left-12 md:relative md:left-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className={`flex flex-col items-center justify-center bg-gradient-to-br ${step.color} text-white rounded-full w-16 h-16 md:w-20 md:h-20 font-bold text-xl md:text-2xl shadow-lg shrink-0 border-4 border-white`}
                    aria-hidden="true"
                  >
                    {step.number}
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-br ${step.color} text-white p-3 rounded-xl shrink-0`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#798f38] mb-6"
          >
            ¿List@ para comenzar tu pedido?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-700 text-lg mb-8"
          >
            Explora nuestro catálogo o contáctanos por WhatsApp para una cotización personalizada
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#b4cf66] to-[#98b84d] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#98b84d] hover:to-[#7a9a3a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ver catálogo
            </Link>
            <a
              href="https://wa.me/56123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#798f38] border-2 border-[#798f38] px-8 py-4 rounded-xl font-semibold hover:bg-[#798f38] hover:text-white transition-all shadow-lg"
            >
              <FaWhatsapp className="text-xl" />
              Contáctanos
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
