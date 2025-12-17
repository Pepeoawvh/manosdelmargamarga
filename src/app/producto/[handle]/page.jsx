// app/producto/[handle]/page.jsx
import ProductDetails from "../../components/product/ProductDetails";

export default async function Page({ params }) {
  const { handle } = await params;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProductDetails productSlug={handle} />
    </div>
  );
}
