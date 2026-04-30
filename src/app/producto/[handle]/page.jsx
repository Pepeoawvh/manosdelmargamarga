// app/producto/[handle]/page.jsx
import ProductDetails from "../../components/product/ProductDetails";
import { adminDb } from "../../../lib/firebase/admin";
import Script from "next/script";

// Genera metadata dinámica para cada producto
export async function generateMetadata({ params }) {
  const { handle } = await params;
  
  try {
    // Determinar si es ID de Firestore o slug
    const isFirestoreId = (value) => typeof value === "string" && value.length === 20;
    
    let product = null;
    
    if (isFirestoreId(handle)) {
      // Usar API de Firebase Admin SDK
      const snap = await adminDb.collection("productosmmm").doc(handle).get();
      if (snap.exists) {
        product = { id: snap.id, ...snap.data() };
      }
    } else {
      // Usar API de Firebase Admin SDK para queries
      const qs = await adminDb.collection("productosmmm")
        .where("slug", "==", handle)
        .limit(1)
        .get();
      
      if (!qs.empty) {
        const d = qs.docs[0];
        product = { id: d.id, ...d.data() };
      }
    }
    
    if (!product) {
      return {
        title: "Producto no encontrado | Manos del Marga Marga",
        description: "El producto que buscas no está disponible.",
      };
    }
    
    const title = `${product.title || "Producto"} | Papel Artesanal`;
    const description = (product.description || "").slice(0, 160) || 
      `${product.title} - Papel artesanal y reciclado hecho a mano en Chile. ${product.categories?.join(", ") || ""}`;
    
    const productUrl = `https://www.manosdelmargamarga.cl/producto/${product.slug || product.id}`;
    const mainImage = product.image || "/og.jpg";
    const price = Number(product.price || 0);
    const stock = Number(product.stock || 0);
    
    return {
      title,
      description,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        type: "website",
        url: productUrl,
        title,
        description,
        images: [
          {
            url: mainImage,
            width: 800,
            height: 800,
            alt: product.title || "Producto de papel artesanal",
          },
          ...(product.additionalImages || []).slice(0, 3).map((img) => ({
            url: img,
            width: 800,
            height: 800,
            alt: `${product.title} - imagen adicional`,
          })),
        ],
        siteName: "Manos del Marga Marga",
        locale: "es_CL",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [mainImage],
      },
      other: {
        "product:price:amount": price,
        "product:price:currency": "CLP",
        "product:availability": stock > 0 ? "in stock" : "out of stock",
        "product:category": product.categories?.join(", ") || "",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Producto | Manos del Marga Marga",
      description: "Explora nuestro catálogo de papel artesanal hecho a mano en Chile.",
    };
  }
}

export default async function Page({ params }) {
  const { handle } = await params;
  const productUrl = `https://www.manosdelmargamarga.cl/producto/${handle}`;

  let productData = null;
  try {
    const isFirestoreId = (value) => typeof value === "string" && value.length === 20;
    if (isFirestoreId(handle)) {
      const snap = await adminDb.collection("productosmmm").doc(handle).get();
      if (snap.exists) {
        productData = { id: snap.id, ...snap.data() };
      }
    } else {
      const qs = await adminDb.collection("productosmmm")
        .where("slug", "==", handle)
        .limit(1)
        .get();
      if (!qs.empty) {
        productData = { id: qs.docs[0].id, ...qs.docs[0].data() };
      }
    }
  } catch (e) {
    console.error("Error loading product:", e);
  }

  return (
    <>
      <div className="px-4 md:px-6 py-8">
        <ProductDetails productSlug={handle} />
      </div>
      {productData && (
        <Script id="jsonld-product" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: productData.title,
            image: productData.image || "/og.jpg",
            description: productData.description?.slice(0, 160) || `${productData.title} - Papel artesanal hecho a mano`,
            brand: {
              "@type": "Brand",
              name: "Manos del Marga Marga",
            },
            offers: {
              "@type": "Offer",
              price: productData.price,
              priceCurrency: "CLP",
              availability: (productData.stock > 0)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: productUrl,
            },
            sku: productData.sku || productData.id,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: 28,
            },
          })}
        </Script>
      )}
    </>
  );
}

