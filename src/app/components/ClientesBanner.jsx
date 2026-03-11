// src/app/components/ClientesBanner.jsx
"use client";

const CLIENTS = [
  { src: "/images/clientes/1.svg",  alt: "Empresa cliente 1 — Manos del Marga Marga" },
  { src: "/images/clientes/2.svg",  alt: "Empresa cliente 2 — Manos del Marga Marga" },
  { src: "/images/clientes/3.svg",  alt: "Empresa cliente 3 — Manos del Marga Marga" },
  { src: "/images/clientes/4.svg",  alt: "Empresa cliente 4 — Manos del Marga Marga" },
  { src: "/images/clientes/5.svg",  alt: "Empresa cliente 5 — Manos del Marga Marga" },
  { src: "/images/clientes/6.svg",  alt: "Empresa cliente 6 — Manos del Marga Marga" },
  { src: "/images/clientes/7.svg",  alt: "Empresa cliente 7 — Manos del Marga Marga" },
  { src: "/images/clientes/8.svg",  alt: "Empresa cliente 8 — Manos del Marga Marga" },
  { src: "/images/clientes/9.svg",  alt: "Empresa cliente 9 — Manos del Marga Marga" },
];

//loop infinito sin salto visible
const ITEMS = [...CLIENTS, ...CLIENTS];

export default function ClientesBanner() {
  return (
    <section
      className="pt-10 bg-white border-t border-gray-100"
      aria-label="Marcas y empresas que confían en Manos del Marga Marga"
    >
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-5570px); }
        }
        .marquee-track {
          animation: marquee 40s linear infinite;
        }
        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
      {/* Cabecera */}
      <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 select-none">
        Confían en nosotras
      </p>

      {/* Pista de desplazamiento */}
      <div className="relative overflow-hidden marquee-wrapper">
        {/* Degradados en los bordes para efecto de fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #ffffff, transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, #ffffff, transparent)",
          }}
          aria-hidden="true"
        />

        {/* Cinta animada */}
        <div className="flex marquee-track">
          {ITEMS.map((client, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: "533px" }}
              aria-hidden={i >= CLIENTS.length}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={client.src}
                alt={i < CLIENTS.length ? client.alt : ""}
                className="h-44 sm:h-52 md:h-72 w-full object-contain opacity-60 grayscale hover:opacity-95 hover:grayscale-0 transition-all duration-300"
                draggable={false}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
