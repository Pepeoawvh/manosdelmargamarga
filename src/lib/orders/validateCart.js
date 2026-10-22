import { adminDb } from "../firebase/admin";

const MAX_ITEMS = 50;
const MAX_QUANTITY = 1000;

export async function validateCartAgainstFirestore(cart) {
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > MAX_ITEMS) {
    return { ok: false, error: "El carrito no es válido" };
  }

  const validatedItems = [];

  for (const item of cart) {
    const productId = typeof item?.id === "string" ? item.id : "";
    const quantity = Number(item?.quantity);

    if (
      !productId ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      return { ok: false, error: "Datos de producto inválidos" };
    }

    const snapshot = await adminDb.collection("productosmmm").doc(productId).get();
    if (!snapshot.exists) {
      return { ok: false, error: "Uno de los productos ya no está disponible" };
    }

    const product = snapshot.data() || {};
    const price = Number(product.price);
    const stock = Number(product.stock);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(stock) ||
      stock < quantity
    ) {
      return { ok: false, error: "El stock o precio de un producto cambió" };
    }

    validatedItems.push({
      ...item,
      id: productId,
      title: typeof product.title === "string" ? product.title : item.title,
      price,
      stock,
      quantity,
      image: typeof product.image === "string" ? product.image : item.image,
    });
  }

  const subtotal = validatedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return {
    ok: true,
    cart: validatedItems,
    summary: {
      subtotal,
      shippingCost: 0,
      total: subtotal,
    },
  };
}
