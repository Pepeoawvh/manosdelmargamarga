
// app/sitemap.js
// Activa esta versión cuando exista /api/sitemap-products
export const revalidate = 86400; // refresca 1 vez al día

async function getProductSlugs() {
  const res = await fetch("https://www.manosdelmargamarga.cl/api/sitemap-products", {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  // Debe devolver: [{ slug: "m8s69ZyGYn8x1xszdir3", updatedAt: "2025-10-20T00:00:00Z" }]
  return res.json();
}

export default async function sitemap() {
  const base = "https://www.manosdelmargamarga.cl";

  // Rutas estáticas principales (mismas que la versión A)
  const staticPaths = [
    "", // Home
    "/catalogo",
    "/nosotras",
    "/tutoriales/como-plantar",
    "/tutoriales/protocolo-grafico",
    "/tutoriales/como-trabajamos",
    "/contacto",
  ];

  const now = new Date().toISOString();

  const staticUrls = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  // Productos (se habilita cuando tengas el endpoint)
  let productUrls = [];
  try {
    const products = await getProductSlugs();
    productUrls = products.map((p) => ({
      url: `${base}/producto/${p.slug}`, // tu ruta real de detalle
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    productUrls = []; // sigue funcionando con las rutas estáticas
  }

  return [...staticUrls, ...productUrls];
}

