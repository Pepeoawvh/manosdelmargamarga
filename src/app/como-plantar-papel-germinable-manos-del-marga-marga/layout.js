// app/como-plantar-papel-germinable-manos-del-marga-marga/layout.js
export const metadata = {
  title: "Cómo Plantar Papel Germinable | Guía Paso a Paso",
  description:
    "Guía completa para plantar papel germinable. Aprende a cuidar tus semillas de papel artesanal: riego, luz, temperatura y cuidados para que crezcan flores y plantas.",
  alternates: {
    canonical: "https://www.manosdelmargamarga.cl/como-plantar-papel-germinable-manos-del-marga-marga",
  },
  keywords: [
    "como plantar papel germinable",
    "papel semilla",
    "papel con semillas",
    "plantar papel",
    "papel biodegradable con semillas",
    "tutorial papel germinable",
  ],
  openGraph: {
    type: "article",
    url: "https://www.manosdelmargamarga.cl/como-plantar-papel-germinable-manos-del-marga-marga",
    title: "Cómo Plantar Papel Germinable | Tutorial Completo",
    description:
      "Tutorial paso a paso: aprende a plantar y cuidar papel germinable para que crezcan hermosas flores y plantas.",
    images: [
      {
        url: "/images/germinables/og-tutorial.jpg",
        width: 1200,
        height: 630,
        alt: "Tutorial: Cómo plantar papel germinable",
      },
    ],
    siteName: "Manos del Marga Marga",
    locale: "es_CL",
    publishedTime: "2024-01-01",
    modifiedTime: new Date().toISOString(),
    section: "Tutoriales",
    tags: ["papel germinable", "tutorial", "jardinería", "sostenibilidad"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo Plantar Papel Germinable | Tutorial",
    description:
      "Aprende a plantar y cuidar papel germinable para que crezcan flores. Guía completa paso a paso.",
    images: ["/images/germinables/og-tutorial.jpg"],
  },
};

export default function TutorialPlantarLayout({ children }) {
  return children;
}
