import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../../lib/firebase/admin";
import { Environment, Options, WebpayPlus } from "transbank-sdk";

// Inicializar Transbank con opciones (producción o integración)
const isProduction = process.env.NODE_ENV === "production";
const webpayOptions = new Options(
  process.env.WEBPAY_COMMERCE_CODE,
  process.env.WEBPAY_API_KEY_SECRET,
  isProduction ? Environment.Production : Environment.Integration
);
const webpay = new WebpayPlus.Transaction(webpayOptions);

export async function POST(req) {
  try {
    const data = await req.json();
    const { token_ws, orderId } = data;

    // Validar token_ws
    if (!token_ws || typeof token_ws !== "string" || token_ws.length !== 64) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 400 });
    }

    console.log("📌 Completando transacción desde frontend:", { token_ws, orderId });

    let transactionResult;
    try {
      transactionResult = await webpay.commit(token_ws);
    } catch (error) {
      console.error("❌ Error al confirmar transacción en WebPay:", error);
      return NextResponse.json({
        success: false,
        error: `Error al confirmar transacción: ${error.message}`,
      }, { status: 500 });
    }

    // Determinar estado de la transacción
    const status = transactionResult.response_code === 0 ? "approved" : "rejected";
    const isApproved = status === "approved";

    console.log("✅ Resultado de transacción:", {
      buy_order: transactionResult.buy_order,
      status,
      isApproved,
      response_code: transactionResult.response_code,
    });

    // Determinar ID de la orden en Firestore
    const updateOrderId = orderId || transactionResult.buy_order;
    if (!updateOrderId) {
      return NextResponse.json({ success: false, error: "No se pudo determinar el ID de la orden" }, { status: 400 });
    }

    const updateResult = await updateOrderInFirestore(updateOrderId, status, isApproved, transactionResult);
    if (updateResult.error) {
      return NextResponse.json({ success: false, error: updateResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: updateOrderId,
      status,
      isApproved,
      details: {
        response_code: transactionResult.response_code,
        status: transactionResult.status,
        authorization_code: transactionResult.authorization_code,
        payment_type_code: transactionResult.payment_type_code,
        transaction_date: transactionResult.transaction_date,
        accounting_date: transactionResult.accounting_date,
        card_number: transactionResult.card_detail?.card_number,
        amount: transactionResult.amount,
      },
    });

  } catch (error) {
    console.error("❌ Error en complete-transaction:", error);
    return NextResponse.json({
      success: false,
      error: `Error al completar la transacción: ${error.message}`,
    }, { status: 500 });
  }
}

async function updateOrderInFirestore(orderId, status, isApproved, transactionResult) {
  try {
    console.log("📌 Actualizando orden en Firestore:", { orderId, status, isApproved });

    const orderDocRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      console.warn("⚠️ Documento no encontrado por ID, buscando por buy_order...");
      const snapshot = await adminDb.collection("orders")
        .where("cart.buy_order", "==", orderId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { error: `Orden no encontrada: ${orderId}` };
      }

      await snapshot.docs[0].ref.update({
        paymentStatus: status,
        isApproved,
        transactionDetails: {
          buy_order: transactionResult.buy_order,
          session_id: transactionResult.session_id,
          amount: transactionResult.amount,
          card_number: transactionResult.card_detail?.card_number,
          authorization_code: transactionResult.authorization_code,
          payment_type_code: transactionResult.payment_type_code,
          transaction_date: transactionResult.transaction_date,
          accounting_date: transactionResult.accounting_date,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Orden actualizada por búsqueda alternativa:", snapshot.docs[0].id);
      return { success: true };
    }

    await orderDocRef.update({
      paymentStatus: status,
      isApproved,
      transactionDetails: {
        buy_order: transactionResult.buy_order,
        session_id: transactionResult.session_id,
        amount: transactionResult.amount,
        card_number: transactionResult.card_detail?.card_number,
        authorization_code: transactionResult.authorization_code,
        payment_type_code: transactionResult.payment_type_code,
        transaction_date: transactionResult.transaction_date,
        accounting_date: transactionResult.accounting_date,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Orden actualizada correctamente:", orderId);
    return { success: true };
  } catch (firestoreError) {
    console.error("❌ Error al actualizar la orden:", firestoreError);
    return { error: firestoreError.message };
  }
}
