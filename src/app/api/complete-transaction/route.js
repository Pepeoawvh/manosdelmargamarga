import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";
import { Environment, Options, WebpayPlus } from "transbank-sdk";

// Configuración explícita para PRODUCCIÓN
const webpayOptions = new Options(
  process.env.WEBPAY_COMMERCE_CODE,
  process.env.WEBPAY_API_KEY_SECRET,
  Environment.Production
);
const webpay = new WebpayPlus.Transaction(webpayOptions);

export async function POST(req) {
  try {
    const data = await req.json();
    const { token_ws, orderId } = data;

    if (!token_ws || typeof token_ws !== "string" || token_ws.length !== 64) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 400 });
    }

    console.log("📌 Completando transacción desde frontend:", { token_ws, orderId });

    // Confirmar la transacción en Webpay
    let transactionResult;
    try {
      transactionResult = await webpay.commit(token_ws);
    } catch (error) {
      console.error("❌ Error al confirmar transacción en WebPay:", error);
      return NextResponse.json(
        { success: false, error: `Error al confirmar transacción: ${error.message}` },
        { status: 500 }
      );
    }

    const status = transactionResult.response_code === 0 ? "approved" : "rejected";
    const isApproved = status === "approved";
    const updateOrderId = orderId || transactionResult.buy_order;

    if (!updateOrderId) {
      return NextResponse.json({ success: false, error: "No se pudo determinar el ID de la orden" }, { status: 400 });
    }

    // Actualizar orden en Firestore
    const orderData = await updateOrderInFirestore(updateOrderId, status, isApproved, transactionResult, token_ws);

    if (!orderData) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: orderData, // ✅ Devuelve toda la orden
      status,
      isApproved,
      details: {
        response_code: transactionResult.response_code,
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
    return NextResponse.json({ success: false, error: `Error al completar la transacción: ${error.message}` }, { status: 500 });
  }
}

async function updateOrderInFirestore(orderId, status, isApproved, transactionResult, token_ws) {
  try {
    const orderDocRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      const snapshot = await adminDb.collection("orders")
        .where("cart.buy_order", "==", orderId)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      await snapshot.docs[0].ref.update({
        paymentStatus: status,
        isApproved,
        webpayToken: token_ws,
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

      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    await orderDocRef.update({
      paymentStatus: status,
      isApproved,
      webpayToken: token_ws,
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

    return { id: orderDoc.id, ...orderDoc.data() };
  } catch (firestoreError) {
    console.error("❌ Error al actualizar la orden:", firestoreError);
    return null;
  }
}
