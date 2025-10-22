// app/robots.js
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.manosdelmargamarga.cl/sitemap.xml",
  };
}