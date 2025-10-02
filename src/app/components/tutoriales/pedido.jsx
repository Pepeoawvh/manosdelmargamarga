"use client";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Haces tu consulta",
    description: "Completando el formulario aquí",
    icon: "🙋‍♂️",
  },
  {
    number: "2",
    title: "Cotizamos",
    description:
      "Enviaremos información detallada que incluirá valores, formas de envío y condiciones de compra.",
    icon: "💬",
  },
  {
    number: "3",
    title: "Abonas y envías info",
    description:
      "Necesaria para diseño o Prueba de Impresión. Te integramos a calendario de trabajo.",
    icon: "💵",
  },
  {
    number: "4",
    title: "Abonas y envías info",
    description:
      "Si requieres diseño o enviaste tus archivos, te contactará directamente la diseñadora con los pasos a seguir; según tu caso particular.",
    icon: "🎨",
  },
  {
    number: "5",
    title: "Producción",
    description:
      "Aquí solo debes esperar… Pero nos mantenemos en contacto para avisar que ya está listo tu pedido.",
    icon: "⚙️",
  },
  {
    number: "6",
    title: "Saldo",
    description:
      "Aquí finiquitamos pago de Saldo, facturación, detalles de despachos especiales, etc.",
    icon: "📑",
  },
  {
    number: "7",
    title: "Despacho",
    description:
      "• Nacional: Arica a Punta Arenas (link de seguimiento por correo). \n• Local: Olmué, Limache, P.Blanca, Quilpué, Villa Alemana, Con-Con, Reñaca, Valparaíso, Placilla, Curauma. \n• Retiro personal: a coordinar según disponibilidad en Quilpué.",
    icon: "🚚",
  },
];

export default function HacerPedido() {
  return (
    <section className="py-20 bg-white text-[#798f38]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          ¿Cómo hago un pedido?
        </h2>

        <div className="flex flex-col gap-8 px-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-6 bg-[#d2d9be] rounded-xl p-6 shadow-md"
            >
              {/* Número e ícono */}
              <div className="flex flex-col items-center justify-center bg-[#798f38] text-white rounded-lg w-16 h-16 font-bold text-xl shrink-0">
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
