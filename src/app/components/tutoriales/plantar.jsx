"use client";
import { motion } from "framer-motion";
import { FaTint, FaSeedling, FaShower, FaSun } from "react-icons/fa";

const steps = [
  {
    number: "1",
    title: "Remojar el papel germinable",
    description:
      "Pica el papel y remójalo durante 12 horas (mínimo 4). Mantén la temperatura templada y evita exceso de agua. No necesitan mucha luz en esta etapa.",
    icon: <FaTint className="text-3xl" />,
    color: "from-[#5ea8e4] to-[#4a8bc2]",
  },
  {
    number: "2",
    title: "Poner en tierra fértil",
    description:
      "Tras el remojo, coloca el papel sobre tierra y cúbrelo con no más de 2 cm de tierra fértil. También puedes esperar a ver los primeros brotes antes de plantar.",
    icon: <FaSeedling className="text-3xl" />,
    color: "from-[#b4cf66] to-[#98b84d]",
  },
  {
    number: "3",
    title: "Riega regularmente",
    description:
      "Usa un rociador suave, apuntando siempre a la tierra, no sobre los brotes. Mantén la humedad constante, pero evita encharcar.",
    icon: <FaShower className="text-3xl" />,
    color: "from-[#3166d0] to-[#2851a8]",
  },
  {
    number: "4",
    title: "Cuida tus brotes",
    description:
      "El tiempo de germinación depende del tipo de semilla y las condiciones. Cuando aparezcan hojitas verdes, dales sol, agua y nutrientes.",
    icon: <FaSun className="text-3xl" />,
    color: "from-[#efc507] to-[#d4ac06]",
  },
];

export default function TutorialPlanting() {
  return (
    <section className="py-16" aria-labelledby="como-plantar-papel-germinable" role="region">
      <div className="max-w-5xl mx-auto px-4">
        {/* Grid de pasos */}
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full">
                {/* Header con icono */}
                <div className={`bg-gradient-to-br ${step.color} p-6 flex items-center gap-4`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {step.number}
                  </div>
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Consejos adicionales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-[#f5f3e9] to-[#e8e6db] rounded-2xl p-8 border-2 border-[#b4cf66]/20"
        >
          <h3 className="text-2xl font-bold text-[#798f38] mb-4 text-center">
            💡 Consejos importantes
          </h3>
          <ul className="space-y-3 max-w-2xl mx-auto">
            <li className="flex items-start gap-3">
              <span className="text-[#b4cf66] text-xl shrink-0">✓</span>
              <p className="text-gray-700">La paciencia es clave: algunas semillas tardan más que otras en germinar</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#b4cf66] text-xl shrink-0">✓</span>
              <p className="text-gray-700">Mantén el sustrato húmedo pero no encharcado para evitar hongos</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#b4cf66] text-xl shrink-0">✓</span>
              <p className="text-gray-700">Una vez germinadas, las plantas necesitan luz solar directa</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
