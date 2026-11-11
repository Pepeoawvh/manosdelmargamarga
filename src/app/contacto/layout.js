// app/contacto/layout.js
export const metadata = {
  title: "Contacto | Manos del Marga Marga",
  description:
    "Contáctanos para consultas sobre papel artesanal, reciclado y papel semilla. Pedidos personalizados, colaboraciones y más. Atención personalizada en Chile.",
  alternates: {
    canonical: "https://www.manosdelmargamarga.cl/contacto",
  },
  openGraph: {
    type: "website",
    url: "https://www.manosdelmargamarga.cl/contacto",
    title: "Contacto | Manos del Marga Marga",
    description:
      "Escríbenos para consultas sobre papel artesanal, pedidos personalizados y colaboraciones. Estamos aquí para ayudarte.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Contacta con Manos del Marga Marga",
      },
    ],
    siteName: "Manos del Marga Marga",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Manos del Marga Marga",
    description:
      "Escríbenos para consultas sobre papel artesanal y pedidos personalizados.",
    images: ["/og.jpg"],
  },
};

export default function ContactoLayout({ children }) {
  return children;
}
