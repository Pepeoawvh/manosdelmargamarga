import admin, { adminDb } from "../firebase/admin";

export async function decrementInventoryForOrder(orderId) {
  const orderRef = adminDb.collection("orders").doc(orderId);

  return adminDb.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);

    if (!orderSnapshot.exists) {
      throw new Error("Orden no encontrada");
    }

    const order = orderSnapshot.data() || {};
    if (order.inventoryAdjustment?.status === "completed") {
      return { adjusted: false, alreadyAdjusted: true };
    }

    if (order.paymentStatus !== "completed" || order.isApproved !== true) {
      return { adjusted: false, alreadyAdjusted: false };
    }

    const items = Array.isArray(order.cart) ? order.cart : [];
    const quantitiesByProduct = new Map();

    for (const item of items) {
      const productId = typeof item?.id === "string" ? item.id : "";
      const quantity = Number(item?.quantity);

      if (!productId || !Number.isSafeInteger(quantity) || quantity < 1) {
        throw new Error("La orden contiene productos inválidos");
      }

      quantitiesByProduct.set(
        productId,
        (quantitiesByProduct.get(productId) || 0) + quantity,
      );
    }

    const productRefs = [...quantitiesByProduct.keys()].map((productId) =>
      adminDb.collection("productosmmm").doc(productId),
    );
    const productSnapshots = [];
    for (const productRef of productRefs) {
      productSnapshots.push(await transaction.get(productRef));
    }

    const updates = [];
    for (let index = 0; index < productSnapshots.length; index += 1) {
      const productSnapshot = productSnapshots[index];
      const productRef = productRefs[index];
      const quantity = quantitiesByProduct.get(productRef.id);

      if (!productSnapshot.exists) {
        throw new Error(`Producto no encontrado: ${productRef.id}`);
      }

      const stock = Number(productSnapshot.data()?.stock);
      if (!Number.isFinite(stock) || stock < quantity) {
        throw new Error(`Stock insuficiente para el producto: ${productRef.id}`);
      }

      updates.push({
        ref: productRef,
        stock: stock - quantity,
      });
    }

    for (const update of updates) {
      transaction.update(update.ref, {
        stock: update.stock,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    transaction.update(orderRef, {
      inventoryAdjustment: {
        status: "completed",
        adjustedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { adjusted: true, alreadyAdjusted: false };
  });
}
