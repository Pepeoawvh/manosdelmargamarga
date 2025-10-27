// app/tutoriales/page.jsx
import Link from "next/link";

const cards = [
  {
    href: "/como-plantar-papel-germinable-manos-del-marga-marga",
    title: "¿Cómo plantar?",
    desc: "Guía paso a paso para plantar papel germinable.",
    emoji: "🌱",
  },
  {
    href: "/tutoriales/como-trabajamos",
    title: "¿Cómo trabajamos?",
    desc: "Conoce nuestro proceso, pruebas impresas y tiempos.",
    emoji: "🛠️",
  },
  {
    href: "/tutoriales/protocolo-grafico",
    title: "Protocolo gráfico",
    desc: "Recomendaciones para archivos y mejores resultados.",
    emoji: "📐",
  },
];

export default function Tutoriales() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8 text-[#5e8c30]">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Tutoriales</h1>
        <p className="text-lg md:text-xl mt-2 text-[#535550]">
          En este apartado podrás encontrar contenido relacionado con tutoriales y apoyo escolar.
        </p>
      </header>

      {/* Grilla de botones/tarjetas */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        aria-label="Enlaces a tutoriales"
      >
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="
              group block rounded-xl border border-[#dfe6c8]
              bg-[#f2f5cb] hover:bg-[#f3fadf]
              shadow-sm hover:shadow-md
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96bf49]
              p-5
            "
            title={c.title}
            aria-label={c.title}
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex items-center justify-center
                  w-12 h-12 rounded-lg shrink-0
                  bg-[#5e8c30] text-white text-2xl
                "
                aria-hidden="true"
              >
                {c.emoji}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#351b12] group-hover:underline">
                  {c.title}
                </h2>
                <p className="mt-1 text-sm text-gray-700">{c.desc}</p>
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#5e8c30]">
              <span>Ver más</span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
