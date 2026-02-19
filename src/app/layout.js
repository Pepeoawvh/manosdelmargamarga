import "./globals.css";
import { AuthProvider } from "./context/authProvider";
import { lexend } from "./ui/fonts";
import ClientProviders from "./providers/ClientProviders";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  metadataBase: new URL("https://www.manosdelmargamarga.cl"),
  title: {
    default: "Manos del Marga Marga | Papel artesanal y reciclado",
    template: "%s | Manos del Marga Marga",
  },
  description:
    "Taller chileno de papel artesanal, papel reciclado y papel semilla. Piezas sostenibles hechas a mano en Marga Marga, con diseños para invitaciones, packaging y arte.",
  keywords: [
    "papel artesanal",
    "papel reciclado",
    "papel semilla",
    "papel germinable",
    "papel hecho a mano",
    "invitaciones papel artesanal",
    "packaging sostenible",
    "taller papel Chile",
    "papel biodegradable",
    "diseño sustentable",
    "papel personalizado",
    "manualidades papel",
  ],
  authors: [{ name: "Manos del Marga Marga" }],
  creator: "Manos del Marga Marga",
  publisher: "Manos del Marga Marga",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: { "es-CL": "/" },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MMM Papel",
  },
  verification: {
    // google: "TU_CODIGO_AQUI", // Agregar cuando tengas Google Search Console
    // yandex: "TU_CODIGO_AQUI",
    // bing: "TU_CODIGO_AQUI",
  },
  openGraph: {
    type: "website",
    url: "https://www.manosdelmargamarga.cl",
    title: "Manos del Marga Marga | Papel artesanal y reciclado",
    description:
      "Papel artesanal, papel reciclado y papel semilla hechos a mano en Chile. Diseños sostenibles para proyectos creativos.",
    siteName: "Manos del Marga Marga",
    images: [{ 
      url: "/images/logos/mmm.png", 
      width: 1200, 
      height: 630, 
      alt: "Papel artesanal Manos del Marga Marga" 
    }],
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    site: "@manosdelmargamarga",
    creator: "@manosdelmargamarga",
    title: "Manos del Marga Marga | Papel artesanal y reciclado",
    description:
      "Papel artesanal, reciclado y papel semilla hecho a mano en Chile.",
    images: ["/images/logos/mmm.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "business",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className="scrollbar-thin scrollbar-thumb-[#5e8c30] scrollbar-track-gray-100 hover:scrollbar-thumb-[#89cb46] scrollbar-thumb-rounded-full"
    >
      <body className={`${lexend.className} relative min-h-screen bg-[#fff9f2]`}>
        {/* Fondo fijo accesible sin div extra on top */}
        <AuthProvider>
          <ClientProviders>{children}</ClientProviders>
        </AuthProvider>

        {/* JSON-LD LocalBusiness (incluye Organization) */}
        <Script id="ld-localbusiness" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.manosdelmargamarga.cl/#localbusiness",
            name: "Manos del Marga Marga",
            description: "Taller chileno de papel artesanal, papel reciclado y papel semilla. Creamos piezas sostenibles hechas a mano para invitaciones, packaging y proyectos creativos.",
            url: "https://www.manosdelmargamarga.cl",
            logo: "https://www.manosdelmargamarga.cl/images/logos/mmm.png",
            image: "https://www.manosdelmargamarga.cl/images/logos/mmm.png",
            priceRange: "$$",
            address: {
              "@type": "PostalAddress",
              addressCountry: "CL",
              addressRegion: "Valparaíso",
              addressLocality: "Marga Marga",
            },
            sameAs: [
              "https://www.instagram.com/manosdelmargamarga",
              "https://www.facebook.com/manosdelmargamarga",
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "28",
            },
          })}
        </Script>

        {/* JSON-LD WebSite + SearchAction */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Manos del Marga Marga",
            url: "https://www.manosdelmargamarga.cl",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://www.manosdelmargamarga.cl/catalogo?busqueda={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
      </body>
    </html>
  );
}
