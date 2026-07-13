// app/producto/[handle]/page.jsx
import ProductDetails from "../../components/product/ProductDetails";
import { adminDb } from "../../../lib/firebase/admin";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  
  try {
    const isFirestoreId = (value) => typeof value === "string" && value.length === 20;
    
    let product = null;
    
    if (isFirestoreId(handle)) {
      const snap = await adminDb.collection("productosmmm").doc(handle).get();
      if (snap.exists) {
        product = { id: snap.id, ...snap.data() };
      }
    } else {
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
        siteName: "Manos del Marga Marga",
        locale: "es_CL",
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
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [mainImage],
      },
    };
  } catch (error) {
    return {
      title: "Producto | Manos del Marga Marga",
      description: "Explora nuestro catálogo de papel artesanal hecho a mano en Chile.",
    };
  }
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  return (
    <div className="px-4 md:px-6 py-8">
      <ProductDetails productSlug={handle} />
    </div>
  );
}