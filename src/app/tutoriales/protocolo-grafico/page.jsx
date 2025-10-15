// app/components/ProtocoloGrafico.jsx
"use client";
import React from "react";

export default function ProtocoloGrafico() {
  return (
    <section className="bg-[#f5f3e6]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {/* Título general */}
        <h2 className="text-2xl md:text-[28px] font-semibold text-[#3f4f1c]">
          Protocolo Gráfico para Diseñadores
        </h2>

        <p className="mt-3 text-sm md:text-base text-[#2e2e2e]">
          Si nos enviarás tu propio diseño o el de tu cliente, agradecemos tener en cuenta las siguientes recomendaciones:
        </p>

        {/* COBERTURA (sin cambios) */}
        <h3 className="mt-6 text-sm font-semibold tracking-wide text-[#3f4f1c]">
          COBERTURA
        </h3>
        <p className="mt-2 text-sm text-[#606060] max-w-3xl">
          Para garantizar óptima germinación de las semillas y sacar provecho al arte del papel; ni gráfica ni fondo deben superar el 30% de la superficie.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-10 items-start">
          <div>
            <div className="inline-flex items-end gap-3">
              <CardTag good />
              <CheckMark />
            </div>

            <p className="mt-2 text-[12px] text-[#666]">
              evitando los fondos cubrientes y calados a blanco.
            </p>

            <div className="mt-6 flex flex-wrap gap-8 items-end">
              <div className="relative inline-flex items-end gap-3">
                <CardTag variant="dark" />
                <XMark />
              </div>
              <div className="relative inline-flex items-end gap-3">
                <CardPhoto />
                <XMark />
              </div>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <LargePreview />
          </div>
        </div>

        {/* BORDES (agregado) */}
        <div className="mt-12">
          <h3 className="text-lg md:text-xl font-semibold text-[#3f4f1c]">BORDES</h3>

          <p className="mt-3 text-sm md:text-base text-[#2e2e2e]">
            Resguarde 5mm desde borde para logotipos, textos e información importante.
          </p>

          <p className="mt-2 text-sm text-[#606060]">
            En etiquetas perforadas, considere 5 mm extra desde borde, para perforado.
          </p>

          <div className="mt-6 flex flex-wrap gap-10">
            <BordeCard variant="bottom-left" />
            <BordeCard variant="top-center" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- COBERTURA: componentes previos sin cambios ---------- */

function CardFrame({ children, bg = "#fbfaf5", border = "#2f2f2f", specks = true, w = 220, h = 300 }) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-[190px] h-[260px] md:w-[210px] md:h-[290px] drop-shadow-sm"
      role="img"
      aria-label="Etiqueta de ejemplo"
    >
      <rect x="4" y="4" width={w - 8} height={h - 8} rx="8" fill={bg} stroke={border} strokeWidth="2.5" />
      <circle cx={w / 2} cy="36" r="7.5" fill="none" stroke={border} strokeWidth="2.5" />
      {specks && (
        <g fill={border} opacity="0.35">
          {Array.from({ length: 28 }).map((_, i) => {
            const x = 15 + ((i * 57) % (w - 30));
            const y = 60 + ((i * 37) % (h - 100));
            const r = 1 + ((i * 3) % 2);
            return <circle key={i} cx={x} cy={y} r={r} />;
          })}
        </g>
      )}
      {children}
    </svg>
  );
}

function LogoGroup({ color = "#2f2f2f", weak = false }) {
  return (
    <g transform="translate(110,170)" textAnchor="middle">
      <g transform="translate(0,-28)" fill="none" stroke={color} strokeWidth={weak ? 1.2 : 1.8}>
        <path d="M0,-20 L12,-6 L0,8 L-12,-6 Z" />
        <path d="M0,-12 L7,-3 L0,3 L-7,-3 Z" />
        <circle cx="0" cy="-2" r="2.5" />
      </g>
      <text y="32" fill={color} fontSize="18" fontWeight="700" letterSpacing="1.5" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        LOGOTIPO
      </text>
    </g>
  );
}

function CardTag({ good = false, variant = "light" }) {
  const isDark = variant === "dark";
  const bg = isDark ? "#0e0f11" : "#fbfaf5";
  const border = isDark ? "#0e0f11" : "#2f2f2f";
  const color = isDark ? "#d9d9d9" : "#2f2f2f";
  return (
    <CardFrame bg={bg} border={border} specks>
      <LogoGroup color={color} weak={isDark} />
    </CardFrame>
  );
}

function CardPhoto() {
  const w = 220, h = 300;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-[190px] h-[260px] md:w-[210px] md:h-[290px] drop-shadow-sm"
      role="img"
      aria-label="Etiqueta con fotografía"
    >
      <rect x="4" y="4" width={w - 8} height={h - 8} rx="8" fill="#f0f0f0" stroke="#2f2f2f" strokeWidth="2.5" />
      <circle cx={w / 2} cy="36" r="7.5" fill="#ffffff99" />
      <g>
        {Array.from({ length: 45 }).map((_, i) => (
          <circle
            key={i}
            cx={20 + ((i * 37) % (w - 40))}
            cy={90 + ((i * 23) % (h - 120))}
            r={10 + ((i * 3) % 12)}
            fill={i % 3 ? "#7bc67b" : "#ffd166"}
            opacity="0.6"
          />
        ))}
      </g>
      <g transform={`translate(${w / 2}, 170)`} textAnchor="middle" opacity="0.9">
        <g transform="translate(0,-28)" fill="none" stroke="#ffffff" strokeWidth="2">
          <path d="M0,-20 L12,-6 L0,8 L-12,-6 Z" />
          <path d="M0,-12 L7,-3 L0,3 L-7,-3 Z" />
          <circle cx="0" cy="-2" r="2.5" />
        </g>
        <text y="32" fill="#ffffff" fontSize="18" fontWeight="700" letterSpacing="1.5" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
          LOGOTIPO
        </text>
      </g>
    </svg>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 60 40" className="w-10 h-10">
      <path d="M6,22 L20,34 L54,6" fill="none" stroke="#4caf50" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10">
      <path d="M8,8 L42,42 M42,8 L8,42" stroke="#111" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function LargePreview() {
  return (
    <svg
      viewBox="0 0 280 380"
      className="w-[260px] md:w-[300px]"
      role="img"
      aria-label="Ejemplo correcto con área libre"
    >
      <rect x="6" y="6" width="268" height="368" rx="22" fill="#ffffff" opacity="0.95" />
      <clipPath id="round">
        <rect x="16" y="16" width="248" height="348" rx="18" />
      </clipPath>
      <g clipPath="url(#round)">
        <rect x="16" y="16" width="248" height="348" rx="18" fill="#0e0f11" />
        <g fill="#e6e6e6" opacity="0.2">
          {Array.from({ length: 60 }).map((_, i) => (
            <rect
              key={i}
              x={24 + ((i * 41) % 220)}
              y={24 + ((i * 29) % 280)}
              width={1.6}
              height={4}
              rx={0.6}
              transform={`rotate(${(i * 23) % 40} ${24 + ((i * 41) % 220)} ${24 + ((i * 29) % 280)})`}
            />
          ))}
        </g>
        <circle cx="140" cy="44" r="9" fill="#7fb36a" />
        <g transform="translate(140,210)" textAnchor="middle">
          <g transform="translate(0,-30)" fill="none" stroke="#d9d9d9" strokeWidth="2">
            <path d="M0,-22 L14,-7 L0,9 L-14,-7 Z" />
            <path d="M0,-13 L8,-4 L0,3 L-8,-4 Z" />
            <circle cx="0" cy="-3" r="3" />
          </g>
          <text y="40" fill="#d9d9d9" fontSize="20" fontWeight="800" letterSpacing="2" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
            LOGOTIPO
          </text>
        </g>
        <rect x="16" y="336" width="248" height="28" fill="#7fb36a" />
      </g>
    </svg>
  );
}

/* ---------- BORDES (nuevo, añadido) ---------- */

function BordeCard({ variant = "bottom-left" }) {
  const W = 260, H = 320;
  const guideStroke = "#e23b3b";
  const labelFill = "#e23b3b";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-[220px] h-[270px] md:w-[240px] md:h-[300px]"
      role="img"
      aria-label="Guía de bordes 5mm"
    >
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="8" fill="#fbfaf5" stroke="#2f2f2f" strokeWidth="2.5" />
      <circle cx={W / 2} cy="48" r="7" fill="none" stroke="#2f2f2f" strokeWidth="2.5" />

      <g fill="#2f2f2f" opacity="0.2">
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 24 + ((i * 37) % (W - 48));
          const y = 70 + ((i * 29) % (H - 120));
          return <circle key={i} cx={x} cy={y} r={(i % 3) ? 1.2 : 1.8} />;
        })}
      </g>

      <g transform={`translate(${W / 2}, ${H / 2 + 18})`} textAnchor="middle">
        <g transform="translate(0,-30)" fill="none" stroke="#2f2f2f" strokeWidth="2">
          <path d="M0,-20 L12,-6 L0,8 L-12,-6 Z" />
          <path d="M0,-12 L7,-3 L0,3 L-7,-3 Z" />
          <circle cx="0" cy="-2" r="2.5" />
        </g>
        <text y="36" fill="#2f2f2f" fontSize="22" fontWeight="800" letterSpacing="2" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
          LOGOTIPO
        </text>
      </g>

      {variant === "bottom-left" ? (
        <>
          <line x1="32" y1={H - 32} x2="90" y2={H - 32} stroke={guideStroke} strokeWidth="3" />
          <rect x="32" y={H - 28} width="32" height="18" fill="#fff" />
          <text x="34" y={H - 14} fill={labelFill} fontSize="14" fontWeight="700" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
            5mm
          </text>
        </>
      ) : (
        <>
          <line x1={W / 2} y1="24" x2={W / 2} y2="64" stroke={guideStroke} strokeWidth="3" />
          <rect x={W / 2 - 16} y="24" width="32" height="18" fill="#fff" />
          <text x={W / 2 - 12} y="38" fill={labelFill} fontSize="14" fontWeight="700" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
            5mm
          </text>
        </>
      )}
    </svg>
  );
}

