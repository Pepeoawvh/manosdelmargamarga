// app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/adminpanel/",
          "/api/",
          "/checkout/",
          "/payment-success/",
          "/payment-failure/",
          "/payment-pending/",
        ],
      },
    ],
    sitemap: "https://www.manosdelmargamarga.cl/sitemap.xml",
  };
}