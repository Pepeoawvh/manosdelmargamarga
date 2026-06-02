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
      console.log("✅ Commit Webpay OK:", {
        buy_order: transactionResult.buy_order,
        status: transactionResult.status,
        response_code: transactionResult.response_code,
      });
    } catch (error) {
      console.error("❌ Error al confirmar transacción en WebPay:", error);
      return NextResponse.json(
        { success: false, error: `Error al confirmar transacción: ${error.message}` },
        { status: 500 }
      );
    }

    // Aprobada solo si response_code === 0 y status === "AUTHORIZED"
    const isApproved =
      transactionResult?.response_code === 0 && transactionResult?.status === "AUTHORIZED";
    const status = isApproved ? "completed" : "failed";

    // Preferir buy_order devuelto por Webpay sobre orderId del cliente
    const candidateOrderId = orderId || transactionResult.buy_order;

    // Actualizar orden en Firestore
    const orderData = await updateOrderInFirestore(
      candidateOrderId,
      status,
      isApproved,
      transactionResult,
      token_ws
    );

    if (!orderData) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
    }

    // Disparar notificaciones por correo con trazas (no bloquea la respuesta)
    try {
      const url = `${process.env.BASE_URL}/api/notify-order`;
      console.log("notify-order →", { url, orderId: orderData.id });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.id }),
        cache: "no-store",
      });

      let msg = null;
      try {
        msg = await res.json();
      } catch {
        msg = { note: "sin cuerpo JSON" };
      }

      console.log("notify-order ←", { status: res.status, body: msg });
    } catch (e) {
      console.error("notify-order fetch error:", e);
    }

    console.log("🧾 Resultado transacción:", {
      firestoreOrderId: orderData.id,
      isApproved,
      status,
    });

    return NextResponse.json({
      success: true,
      order: orderData,
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
        buy_order: transactionResult.buy_order,
        session_id: transactionResult.session_id,
      },
    });
  } catch (error) {
    console.error("❌ Error en complete-transaction:", error);
    return NextResponse.json(
      { success: false, error: `Error al completar la transacción: ${error.message}` },
      { status: 500 }
    );
  }
}

async function updateOrderInFirestore(orderIdOrBuyOrder, status, isApproved, tr, token_ws) {
  try {
    const baseUpdate = {
      paymentStatus: status,
      isApproved,
      transactionDetails: {
        buy_order: tr.buy_order,
        session_id: tr.session_id,
        amount: tr.amount,
        card_number: tr.card_detail?.card_number,
        authorization_code: tr.authorization_code,
        payment_type_code: tr.payment_type_code,
        transaction_date: tr.transaction_date,
        accounting_date: tr.accounting_date,
        response_code: tr.response_code,
        status: tr.status,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      finalizedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 1) Intentar por docId directo (cuando el frontend pasó orderId)
    if (orderIdOrBuyOrder && orderIdOrBuyOrder.length < 64) {
      const byIdRef = adminDb.collection("orders").doc(orderIdOrBuyOrder);
      const byIdDoc = await byIdRef.get();
      if (byIdDoc.exists) {
        await byIdRef.update({
          ...baseUpdate,
          webpayToken: token_ws,
        });
        return { id: byIdDoc.id, ...byIdDoc.data(), paymentStatus: status, isApproved };
      }
    }

    // 2) Intentar por token_ws almacenado
    const tokenSnap = await adminDb
      .collection("orders")
      .where("webpayToken", "==", token_ws)
      .limit(1)
      .get();
    if (!tokenSnap.empty) {
      const doc = tokenSnap.docs[0];
      await doc.ref.update(baseUpdate);
      return { id: doc.id, ...doc.data(), paymentStatus: status, isApproved };
    }

    // 3) Intentar por buy_order devuelto por Webpay
    if (tr?.buy_order) {
      const byBuyOrderSnap = await adminDb
        .collection("orders")
        .where("buy_order", "==", tr.buy_order)
        .limit(1)
        .get();
      if (!byBuyOrderSnap.empty) {
        const doc = byBuyOrderSnap.docs[0];
        await doc.ref.update({
          ...baseUpdate,
          webpayToken: token_ws,
        });
        return { id: doc.id, ...doc.data(), paymentStatus: status, isApproved };
      }
    }

    return null;
  } catch (firestoreError) {
    console.error("❌ Error al actualizar la orden:", firestoreError);
    return null;
  }
}
