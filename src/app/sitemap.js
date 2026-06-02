export const revalidate = 86400; // refresca 1 vez al día

async function getProductSlugs() {
  const res = await fetch("https://www.manosdelmargamarga.cl/api/sitemap-products", {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  return res.json(); // [{ slug, updatedAt }]
}

export default async function sitemap() {
  const base = "https://www.manosdelmargamarga.cl";

  // Rutas estáticas principales
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

  // Productos dinámicos
  let productUrls = [];
  try {
    const products = await getProductSlugs();
    productUrls = products.map((p) => ({
      url: `${base}/producto/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    productUrls = [];
  }

  return [...staticUrls, ...productUrls];
}
