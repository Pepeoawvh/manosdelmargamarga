"use client";
import { motion } from "framer-motion";

const steps = [
  {
    title: "1. Remojar el papel germinable",
    description:
      "Pica el papel y remójalo durante 12 horas (mínimo 4). Mantén la temperatura templada y evita exceso de agua. No necesitan mucha luz en esta etapa.",
    icon: "💧",
  },
  {
    title: "2. Poner en tierra fértil",
    description:
      "Tras el remojo, coloca el papel sobre tierra y cúbrelo con no más de 2 cm de tierra fértil. También puedes esperar a ver los primeros brotes antes de plantar.",
    icon: "🌱",
  },
  {
    title: "3. Riega regularmente",
    description:
      "Usa un rociador suave, apuntando siempre a la tierra, no sobre los brotes. Mantén la humedad constante, pero evita encharcar.",
    icon: "🚿",
  },
  {
    title: "4. Cuida tus brotes",
    description:
      "El tiempo de germinación depende del tipo de semilla y las condiciones. Cuando aparezcan hojitas verdes, dales sol, agua y nutrientes.",
    icon: "☀️",
  },
];

export default function TutorialPlanting() {
  return (
    <section className="py-10 bg-white text-emerald-800">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          ¿Cómo plantar papel germinable <br /> Manos del Marga-Marga?
        </h2>
        <div className="grid md:grid-rows-4 gap-8 mx-40">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className="bg-emerald-50 p-6 rounded-2xl shadow-md flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                  <div className="text-4xl">{step.icon}</div>
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
              </div>
              <p className="text-gray-700">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}