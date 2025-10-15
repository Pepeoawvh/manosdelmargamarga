"use client";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Nos Consultas",
    description: "Por whatsapp ocomprando a través del sitio",
    icon: "🙋‍♂️",
  },
  {
    number: "2",
    title: "Cotizamos",
    description:
      "Si nos contactas por whatsapp, contamos con sistema de cotización rápida, completa y con imagenes referenciales, para que puedas presentar propuestas",
    icon: "💬",
  },
  {
    number: "3",
    title: "Pago > Ingreso de pedido",
    description:
      "Transfieres o envias OC. Ingresamos pedido en calendario de trabajo y fijamos fechas.",
    icon: "💵",
  },
  {
    number: "4",
    title: "Prueba Impresa",
    description:
      "Independiente a si tomas nuestro servicio de diseño o se usan tus archivos, SIEMPRE hacemos y te enviamos Imágenes de PRUEBA IMPRESA, para APROBACIÓN.",
    icon: "🎨",
  },
  {
    number: "5",
    title: "Producción",
    description:
      "Nos ponemos manos a la obra. Al  iniciar esta etapa indicaremos fecha de envío.",
    icon: "⚙️",
  },
  {
    number: "6",
    title: "Despachamos",
    description:
      "El medio de entrega queda establecido al momento de cotizar. Normalmente, lo hacemos por Blue Express a domicilio. Para plazos acotados usamos Chilexpress* (costo adicional de acercamiento) Y también puedes venir a retirar a nuestro taller sin costo.",
    icon: "🚚",
  },
];

export default function HacerPedido() {
  return (
    <section className="py-20 bg-white text-[#5e8c30]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          ¿Cómo funciona un pedido?
        </h2>

        <div className="flex flex-col gap-8 px-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-6 bg-[#ecf7cd] rounded-xl p-6 shadow-md"
            >
              {/* Número e ícono */}
              <div className="flex flex-col items-center justify-center bg-[#5e8c30] text-white rounded-lg w-16 h-16 font-bold text-xl shrink-0">
                {step.number}
              </div>
              <div>
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                  <span>{step.icon}</span> {step.title}
                </h3>
                <p className="text-gray-700 mt-2 whitespace-pre-line">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
