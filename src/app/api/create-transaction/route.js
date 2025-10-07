import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";
import { WebpayPlus, Options, Environment } from "transbank-sdk";

export async function POST(req) {
  try {
    const data = await req.json();
    const { cart, customer, summary } = data;

    // === Validaciones básicas ===
    if (!cart || cart.length === 0) {
      return NextResponse.json({ success: false, error: "El carrito está vacío" }, { status: 400 });
    }

    if (!summary?.total || typeof summary.total !== "number" || summary.total <= 0) {
      return NextResponse.json({ success: false, error: "Monto total inválido" }, { status: 400 });
    }

    // === Generación de IDs únicos ===
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const newOrderId = `O-${timestamp}-${randomSuffix}`;
    const sessionId = `S-${timestamp}-${randomSuffix}`;
    const amount = Math.round(summary.total); // Redondear a entero, requisito de Webpay

    // === URLs ===
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL no está definido en el entorno");
    const returnUrl = `${baseUrl}/payment-success`;

    // === Guardar orden inicial en Firestore (Admin SDK) ===
    const orderData = {
      id: newOrderId,
      sessionId,
      cart,
      customer,
      summary,
      paymentMethod: "webpay",
      paymentStatus: "pending",
      isApproved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp,
    };

    const orderDocRef = await adminDb.collection("orders").add(orderData);
    console.log("✅ Orden creada:", newOrderId, "->", orderDocRef.id);

    // === Configuración Webpay ===
    const webpayOptions = new Options(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY_SECRET,
      Environment.Production
    );
    const transaction = new WebpayPlus.Transaction(webpayOptions);

    // === Crear transacción ===
    console.log("⚙️ Creando transacción:", { newOrderId, sessionId, amount, returnUrl });
    const createResponse = await transaction.create(newOrderId, sessionId, amount, returnUrl);

    if (!createResponse?.url || !createResponse?.token) {
      throw new Error("Respuesta inválida de Webpay");
    }

    // === Actualizar orden con token y datos de transacción ===
    await orderDocRef.update({
      webpayToken: createResponse.token,
      firestoreDocId: orderDocRef.id,
      transactionDetails: {
        token_ws: createResponse.token,
        created_at: new Date().toISOString(),
      },
    });

    console.log("✅ Transacción creada con token:", createResponse.token);

    // === Respuesta al frontend ===
    return NextResponse.json({
      success: true,
      orderId: newOrderId,
      documentId: orderDocRef.id,
      url: createResponse.url,
      token: createResponse.token,
      environment: "production",
      message: "Redirigiendo a Webpay...",
    });

  } catch (error) {
    console.error("❌ Error al crear transacción en producción:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido al crear transacción" },
      { status: 500 }
    );
  }
}
