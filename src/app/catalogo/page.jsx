// app/catalogo/page.jsx
import { Suspense } from "react";
import CatalogPageClient from "./components/CatalogClient";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;

  const categoria = sp?.categoria || "";
  const destacados = sp?.destacados === "1";

  const baseTitle =
    "Catálogo de papel artesanal y papel semilla | Manos del Marga Marga";

  const title = categoria
    ? `Catálogo: ${categoria} | Manos del Marga Marga`
    : destacados
      ? "Productos destacados | Manos del Marga Marga"
      : baseTitle;

  const description = categoria
    ? `Explora ${categoria} en papel artesanal y papel semilla: diseños sostenibles, tamaños personalizados y colores únicos con envío a todo Chile.`
    : destacados
      ? "Selección curada de productos destacados en papel artesanal, papel reciclado y papel semilla germinable, listos para tu proyecto."
      : "Explora el catálogo completo de papel artesanal, papel reciclado y papel semilla germinable hecho a mano en Chile. Invitaciones, packaging sostenible y más.";

  // Keywords dinámicas según categoría
  const keywords = categoria
    ? [`papel artesanal ${categoria}`, `${categoria} papel reciclado`, `${categoria} papel semilla`, "papel hecho a mano Chile"]
    : destacados
    ? ["papel artesanal destacado", "papel semilla popular", "invitaciones papel reciclado", "packaging sostenible"]
    : ["catálogo papel artesanal", "papel reciclado Chile", "papel semilla germinable", "invitaciones papel artesanal", "packaging sostenible", "papel hecho a mano"];

  const canonicalPath = categoria
    ? `/catalogo?categoria=${encodeURIComponent(categoria)}`
    : destacados
      ? "/catalogo?destacados=1"
      : "/catalogo";

  const site = "https://www.manosdelmargamarga.cl";

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${site}${canonicalPath}` },
    openGraph: {
      type: "website",
      url: `${site}${canonicalPath}`,
      title,
      description,
      images: [{ url: "/images/logos/mmm.png", width: 1200, height: 630, alt: "Catálogo Manos del Marga Marga" }],
      siteName: "Manos del Marga Marga",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/logos/mmm.png"],
    },
  };
}

export default function Page() {
  return (
    <main
      className="w-full py-2"
      aria-label="Catálogo de productos de papel artesanal y papel semilla"
    >
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse text-gray-600">Cargando catálogo...</div>
        </div>
      }>
        <CatalogPageClient />
      </Suspense>
    </main>
  );
}
