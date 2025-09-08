import ProductDetails from "../../components/product/ProductDetails";

export default function ProductDetailPage({ params }) {
  const { id } = params;
  return (
    <div className="max-w-4xl mx-auto py-8">
      <ProductDetails productId={id} />
    </div>
  );
}