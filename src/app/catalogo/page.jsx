// app/catalogo/page.jsx
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
    ? `Explora ${categoria} en papel artesanal y papel semilla: diseños, tamaños y colores con envío a todo Chile.`
    : destacados
      ? "Selección de productos destacados en papel artesanal y papel semilla, listos para tu proyecto."
      : "Explora el catálogo completo de papel artesanal, reciclado y papel semilla hecho a mano en Chile.";

  const canonicalPath = categoria
    ? `/catalogo?categoria=${encodeURIComponent(categoria)}`
    : destacados
      ? "/catalogo?destacados=1"
      : "/catalogo";

  const site = "https://www.manosdelmargamarga.cl";

  return {
    title,
    description,
    alternates: { canonical: `${site}${canonicalPath}` },
    openGraph: {
      type: "website",
      url: `${site}${canonicalPath}`,
      title,
      description,
      images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"],
    },
  };
}

// 👇 ESTE ES EL PUNTO CLAVE QUE FALTABA
export default function Page() {
  return (
    <main
      className="max-w-6xl mx-auto px-4 py-2"
      aria-label="Catálogo de productos de papel artesanal y papel semilla"
    >
      <CatalogPageClient />
    </main>
  );
}
