import { WebpayPlus, Environment, Options } from "transbank-sdk";
import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";
import { handleNormalFlow } from "./transactionHelpers";

// Instancia de WebpayPlus en producción
const webpayOptions = new Options(
  process.env.WEBPAY_COMMERCE_CODE,
  process.env.WEBPAY_API_KEY_SECRET,
  Environment.Production
);
const webpay = new WebpayPlus.Transaction(webpayOptions);

export async function POST(request) {
  try {
    const data = await request.json();
    const { token_ws, orderId } = data;

    if (!token_ws) {
      return NextResponse.json(
        { success: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    console.log("Completando transacción desde frontend (producción):", { token_ws, orderId });

    // Verificar si el pedido ya está confirmado
    if (orderId) {
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists && orderDoc.data().paymentStatus === "completed") {
        return NextResponse.json({
          success: true,
          orderId,
          status: "completed",
          isApproved: true,
          orderNumber: orderDoc.data().orderNumber || null,
          details: orderDoc.data().transactionDetails || {},
        });
      }
    }
if (data.TBK_TOKEN || data.TBK_ORDEN_COMPRA) {
  console.log("Transacción cancelada por el usuario:", data);
  return NextResponse.json({
    success: false,
    status: "cancelled",
    message: "El usuario canceló el pago en Webpay.",
  });
}
    // Usar helper para completar la transacción
    const { transactionResult, status, isApproved } = await handleNormalFlow(token_ws, webpay);

    const updateOrderId = orderId || transactionResult.buy_order;
    if (!updateOrderId) {
      return NextResponse.json(
        { success: false, error: "No se pudo determinar el ID de la orden" },
        { status: 400 }
      );
    }

    // Actualizar Firestore
    const updateResult = await updateOrderInFirestore(
      updateOrderId,
      status,
      isApproved,
      transactionResult,
      { token_ws }
    );

    if (updateResult.error) {
      return NextResponse.json({ success: false, error: updateResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: updateOrderId,
      status,
      isApproved,
      orderNumber: updateResult.orderNumber || null,
      details: {
        response_code: transactionResult.response_code,
        status: transactionResult.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Error al completar la transacción: ${error.message}` },
      { status: 500 }
    );
  }
}
