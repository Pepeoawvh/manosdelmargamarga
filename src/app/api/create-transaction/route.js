import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";
import { WebpayPlus, Options, Environment } from "transbank-sdk";

export async function POST(req) {
  try {
    const data = await req.json();
    const { cart, customer, summary } = data;

    // === Validaciones ===
    if (!cart?.length) {
      return NextResponse.json({ success: false, error: "El carrito está vacío" }, { status: 400 });
    }

    if (!summary?.total || typeof summary.total !== "number" || summary.total <= 0) {
      return NextResponse.json({ success: false, error: "Monto total inválido" }, { status: 400 });
    }

    // === IDs válidos según Transbank ===
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const buyOrder = `${timestamp}${randomSuffix}`; // sin guiones, solo números
    const sessionId = `S${timestamp}${randomSuffix}`;
    const amount = Math.round(summary.total);

    // === URLs ===
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL no está definido en el entorno");

    const returnUrl = `${baseUrl}/payment-success`;

    // === Guardar orden inicial ===
    const orderData = {
      buy_order: buyOrder,
      session_id: sessionId,
      cart,
      customer,
      summary,
      paymentMethod: "webpay",
      paymentStatus: "pending",
      isApproved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp,
    };

    const orderRef = await adminDb.collection("orders").add(orderData);
    console.log("✅ Orden creada en Firestore:", orderRef.id);

    // === Configuración Webpay ===
    const options = new Options(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY_SECRET,
      Environment.Production
    );
    const transaction = new WebpayPlus.Transaction(options);

    // === Crear transacción en Webpay ===
    console.log("⚙️ Creando transacción:", { buyOrder, sessionId, amount, returnUrl });
    const createResponse = await transaction.create(buyOrder, sessionId, amount, returnUrl);

    if (!createResponse?.url || !createResponse?.token) {
      throw new Error("Respuesta inválida de Webpay");
    }

    // === Actualizar orden con token ===
    await orderRef.update({
      webpayToken: createResponse.token,
      firestoreDocId: orderRef.id,
      transactionDetails: {
        token_ws: createResponse.token,
        created_at: new Date().toISOString(),
      },
    });

    console.log("✅ Transacción Webpay creada:", createResponse.token);

    // === Respuesta al frontend ===
    return NextResponse.json({
      success: true,
      buy_order: buyOrder,
      documentId: orderRef.id,
      url: createResponse.url,
      token: createResponse.token,
      environment: "production",
      message: "Redirigiendo a Webpay...",
    });

  } catch (error) {
    console.error("❌ Error al crear transacción:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido al crear transacción" },
      { status: 500 }
    );
  }
}
