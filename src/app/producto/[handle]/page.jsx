// app/producto/[handle]/page.jsx
import ProductDetails from "../../components/product/ProductDetails";

export default function Page(props) {
  const handle = props?.params?.handle; // sin await
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProductDetails productSlug={handle} productId={handle} />
    </div>
  );
}
