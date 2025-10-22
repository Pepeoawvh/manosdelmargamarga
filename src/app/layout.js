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
  alternates: {
    canonical: "/",
    languages: { "es-cl": "/" },
  },
  openGraph: {
    type: "website",
    url: "https://www.manosdelmargamarga.cl",
    title: "Manos del Marga Marga | Papel artesanal y reciclado",
    description:
      "Papel artesanal, papel reciclado y papel semilla hechos a mano en Chile. Diseños sostenibles para proyectos creativos.",
    siteName: "Manos del Marga Marga",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Papel artesanal Manos del Marga Marga" }],
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    site: "@manosdelmargamarga",
    title: "Manos del Marga Marga | Papel artesanal y reciclado",
    description:
      "Papel artesanal, reciclado y papel semilla hecho a mano en Chile.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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

        {/* JSON-LD Organization */}
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Manos del Marga Marga",
            url: "https://www.manosdelmargamarga.cl",
            logo: "https://www.manosdelmargamarga.cl/logo.png",
            sameAs: [
              "https://www.instagram.com/manosdelmargamarga",
              "https://www.facebook.com/manosdelmargamarga",
            ],
          })}
        </Script>

        {/* JSON-LD WebSite + SearchAction */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://www.manosdelmargamarga.cl",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.manosdelmargamarga.cl/buscar?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
      </body>
    </html>
  );
}
