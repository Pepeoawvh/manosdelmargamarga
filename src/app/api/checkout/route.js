import { NextResponse } from "next/server";
import { firestoreDB } from "../../../lib/firebase/config";
import { collection, doc, setDoc } from "firebase/firestore";
import { Environment, Options, WebpayPlus } from "transbank-sdk";

// === GUARDAR ORDEN EN FIRESTORE ===
async function saveOrderToFirestore(orderId, data) {
  try {
    const orderRef = doc(collection(firestoreDB, "orders"), orderId);
    await setDoc(orderRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: "pending",
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Error guardando orden en Firestore:", error);
    return { error: error.message };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { cart, customer, summary, paymentMethod } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ success: false, error: "Carrito vacío" }, { status: 400 });
    }

    if (paymentMethod !== "webpay") {
      return NextResponse.json({ success: false, error: "Método de pago no soportado" }, { status: 400 });
    }

    const total = summary?.total || 0;
    if (total <= 0) {
      return NextResponse.json({ success: false, error: "Total inválido" }, { status: 400 });
    }

    const orderId = `order-${Date.now()}`;
    const sessionId = `sess-${Date.now()}`;

    // Guardar orden preliminar en Firestore
    const saveResult = await saveOrderToFirestore(orderId, { cart, customer, summary });
    if (saveResult.error) {
      return NextResponse.json({ success: false, error: saveResult.error }, { status: 500 });
    }

    // === CONFIGURACIÓN AUTOMÁTICA SEGÚN EL ENTORNO ===
    const isIntegration =
      process.env.WEBPAY_COMMERCE_CODE === "597055555532" ||
      process.env.NODE_ENV === "development";

    const options = new Options(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY_SECRET,
      isIntegration ? Environment.Integration : Environment.Production
    );

    const transaction = new WebpayPlus.Transaction(options);

    // === CREAR TRANSACCIÓN ===
    const response = await transaction.create(
      String(orderId),
      String(sessionId),
      Number(total),
      `${process.env.NEXT_PUBLIC_DOMAIN}/payment-confirmation`
    );

    console.log("✅ Transacción WebPay creada:", response);

    return NextResponse.json({
      success: true,
      orderId,
      transaction: response,
    });
  } catch (error) {
    console.error("❌ Error en /api/checkout:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
