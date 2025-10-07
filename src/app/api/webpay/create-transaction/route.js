import { WebpayPlus, Options, Environment } from "transbank-sdk";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { cart, customer, summary } = data;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ success: false, error: "El carrito está vacío" }, { status: 400 });
    }

    if (!summary?.total || typeof summary.total !== "number") {
      return NextResponse.json({ success: false, error: "Monto total inválido" }, { status: 400 });
    }

    // === Datos base ===
    const timestamp = Date.now();
    const newOrderId = `O-${timestamp.toString().slice(-5)}`;
    const sessionId = `S-${timestamp.toString().slice(-5)}`;
    const amount = summary.total;
    const baseUrl = process.env.BASE_URL; // debe ser tu URL de producción
    const returnUrl = `${baseUrl}/payment-success`;

    // === Guardar orden inicial en Firestore ===
    const orderData = {
      id: newOrderId,
      sessionId,
      cart,
      customer,
      summary,
      paymentMethod: "webpay",
      paymentStatus: "pending",
      isApproved: false,
      createdAt: serverTimestamp(),
      timestamp,
    };

    const ordersRef = collection(firestoreDB, "orders");
    const docRef = await addDoc(ordersRef, orderData);
    console.log("✅ Orden creada:", newOrderId, "->", docRef.id);

    // === Configuración explícita para PRODUCCIÓN ===
    const options = new Options(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY_SECRET,
      Environment.Production
    );

    const transaction = new WebpayPlus.Transaction(options);

    // === Crear transacción ===
    console.log("⚙️ Creando transacción:", { newOrderId, sessionId, amount, returnUrl });

    const createResponse = await transaction.create(
      newOrderId,
      sessionId,
      amount,
      returnUrl
    );

    if (!createResponse?.url || !createResponse?.token) {
      throw new Error("Respuesta inválida de Webpay");
    }

    // === Actualizar orden con token de Webpay ===
    await updateDoc(doc(firestoreDB, "orders", docRef.id), {
      webpayToken: createResponse.token,
      firestoreDocId: docRef.id,
      transactionDetails: {
        token_ws: createResponse.token,
        created_at: new Date().toISOString(),
      },
    });

    console.log("✅ Transacción creada con token:", createResponse.token);

    return NextResponse.json({
      success: true,
      orderId: newOrderId,
      documentId: docRef.id,
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
