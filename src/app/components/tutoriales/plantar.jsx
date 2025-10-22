"use client";
import { motion } from "framer-motion";
import { FaTint, FaSeedling, FaShower, FaSun } from "react-icons/fa";

const steps = [
  {
    title: "1. Remojar el papel germinable",
    description:
      "Pica el papel y remójalo durante 12 horas (mínimo 4). Mantén la temperatura templada y evita exceso de agua. No necesitan mucha luz en esta etapa.",
    icon: <FaTint className="text-[#5ea8e4] text-2xl" aria-hidden="true" />,
  },
  {
    title: "2. Poner en tierra fértil",
    description:
      "Tras el remojo, coloca el papel sobre tierra y cúbrelo con no más de 2 cm de tierra fértil. También puedes esperar a ver los primeros brotes antes de plantar.",
    icon: <FaSeedling className="text-[#798f38] text-2xl" aria-hidden="true" />,
  },
  {
    title: "3. Riega regularmente",
    description:
      "Usa un rociador suave, apuntando siempre a la tierra, no sobre los brotes. Mantén la humedad constante, pero evita encharcar.",
    icon: <FaShower className="text-[#3166d0] text-2xl" aria-hidden="true" />,
  },
  {
    title: "4. Cuida tus brotes",
    description:
      "El tiempo de germinación depende del tipo de semilla y las condiciones. Cuando aparezcan hojitas verdes, dales sol, agua y nutrientes.",
    icon: <FaSun className="text-[#efc507] text-2xl" aria-hidden="true" />,
  },
];

export default function TutorialPlanting() {
  return (
    <section className="py-8 bg-[#eff2d5] text-[#467302]" aria-labelledby="como-plantar-papel-germinable" role="region">
      <div className="max-w-5xl mx-auto px-4">
        <h2 id="como-plantar-papel-germinable" className="text-3xl md:text-4xl font-bold text-center mb-12">
          ¿Cómo plantar papel germinable <br /> Manos del Marga-Marga?
        </h2>

        <ol className="grid md:grid-cols-2 gap-8" role="list">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 border rounded-xl p-6 bg-white transition"
              aria-label={step.title}
            >
              <div className="flex-shrink-0">{step.icon}</div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#351b12]">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
