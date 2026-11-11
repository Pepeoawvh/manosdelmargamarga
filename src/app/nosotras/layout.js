export const metadata = {
  title: "Sobre Nosotras | Manos del Marga Marga",
  description:
    "Conoce a Manos del Marga Marga: taller chileno de papel artesanal y reciclado desde 2008. Historia, valores y compromiso con la sostenibilidad.",
  alternates: {
    canonical: "https://www.manosdelmargamarga.cl/nosotras",
  },
  openGraph: {
    type: "website",
    url: "https://www.manosdelmargamarga.cl/nosotras",
    title: "Sobre Nosotras | Manos del Marga Marga",
    description:
      "Taller chileno de papel artesanal. Historia, valores y proceso sostenible desde 2008.",
    images: [
      {
        url: "/images/nosotras/hero-nosotras.jpg",
        width: 1920,
        height: 800,
        alt: "Manos del Marga Marga - Taller de papel artesanal",
      },
    ],
    siteName: "Manos del Marga Marga",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotras | Manos del Marga Marga",
    description:
      "Taller chileno de papel artesanal. Historia y valores desde 2008.",
    images: ["/images/nosotras/hero-nosotras.jpg"],
  },
};

export default function NosotrasLayout({ children }) {
  return children;
}
