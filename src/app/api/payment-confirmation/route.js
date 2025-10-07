import { WebpayPlus, Environment, Options } from "transbank-sdk";
import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../lib/firebase/admin";

// Instancia de WebpayPlus en producción
const webpayOptions = new Options(
  process.env.WEBPAY_COMMERCE_CODE,
  process.env.WEBPAY_API_KEY_SECRET,
  Environment.Production
);
const webpay = new WebpayPlus.Transaction(webpayOptions);

// Helper interno: actualizar orden con diferentes claves
async function updateOrderInFirestore(orderIdOrBuyOrder, status, isApproved, tr, token_ws) {
  try {
    // 1) Por docId directo
    if (orderIdOrBuyOrder && orderIdOrBuyOrder.length < 64) {
      const byIdRef = adminDb.collection("orders").doc(orderIdOrBuyOrder);
      const byIdDoc = await byIdRef.get();
      if (byIdDoc.exists) {
        await byIdRef.update({
          paymentStatus: status,
          isApproved,
          webpayToken: token_ws || byIdDoc.data()?.webpayToken || null,
          transactionDetails: {
            buy_order: tr?.buy_order || null,
            session_id: tr?.session_id || null,
            amount: tr?.amount ?? null,
            card_number: tr?.card_detail?.card_number || null,
            authorization_code: tr?.authorization_code || null,
            payment_type_code: tr?.payment_type_code || null,
            transaction_date: tr?.transaction_date || null,
            accounting_date: tr?.accounting_date || null,
            response_code: tr?.response_code ?? null,
            status: tr?.status || status,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { id: byIdDoc.id, ...byIdDoc.data(), paymentStatus: status, isApproved };
      }
    }

    // 2) Por token_ws
    if (token_ws) {
      const byToken = await adminDb
        .collection("orders")
        .where("webpayToken", "==", token_ws)
        .limit(1)
        .get();
      if (!byToken.empty) {
        const doc = byToken.docs[0];
        await doc.ref.update({
          paymentStatus: status,
          isApproved,
          transactionDetails: {
            buy_order: tr?.buy_order || null,
            session_id: tr?.session_id || null,
            amount: tr?.amount ?? null,
            card_number: tr?.card_detail?.card_number || null,
            authorization_code: tr?.authorization_code || null,
            payment_type_code: tr?.payment_type_code || null,
            transaction_date: tr?.transaction_date || null,
            accounting_date: tr?.accounting_date || null,
            response_code: tr?.response_code ?? null,
            status: tr?.status || status,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { id: doc.id, ...doc.data(), paymentStatus: status, isApproved };
      }
    }

    // 3) Por buy_order devuelto por Webpay
    if (tr?.buy_order) {
      const byBuyOrderSnap = await adminDb
        .collection("orders")
        .where("buy_order", "==", tr.buy_order)
        .limit(1)
        .get();
      if (!byBuyOrderSnap.empty) {
        const doc = byBuyOrderSnap.docs[0];
        await doc.ref.update({
          paymentStatus: status,
          isApproved,
          webpayToken: token_ws || doc.data()?.webpayToken || null,
          transactionDetails: {
            buy_order: tr?.buy_order || null,
            session_id: tr?.session_id || null,
            amount: tr?.amount ?? null,
            card_number: tr?.card_detail?.card_number || null,
            authorization_code: tr?.authorization_code || null,
            payment_type_code: tr?.payment_type_code || null,
            transaction_date: tr?.transaction_date || null,
            accounting_date: tr?.accounting_date || null,
            response_code: tr?.response_code ?? null,
            status: tr?.status || status,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { id: doc.id, ...doc.data(), paymentStatus: status, isApproved };
      }
    }

    return null;
  } catch (e) {
    console.error("❌ Error al actualizar la orden:", e);
    return { error: e.message };
  }
}

// POST para confirmación desde el frontend o desde return_url si decides usar fetch
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      token_ws,
      orderId,
      TBK_TOKEN,
      TBK_ORDEN_COMPRA,
      TBK_ID_SESION,
    } = data || {};

    // Flujo abortado/timeout: TBK_* presente
    if (TBK_TOKEN || TBK_ORDEN_COMPRA) {
      console.log("Transacción cancelada/timeout detectada:", {
        TBK_TOKEN,
        TBK_ORDEN_COMPRA,
        TBK_ID_SESION,
      });
      // No se hace commit; solo registrar estado
      const updateRes = await updateOrderInFirestore(
        TBK_ORDEN_COMPRA,
        "failed",
        false,
        null,
        null
      );
      return NextResponse.json({
        success: false,
        status: "cancelled",
        isApproved: false,
        orderId: updateRes?.id || orderId || null,
        message: "El usuario canceló el pago o se agotó el tiempo en Webpay.",
      });
    }

    if (!token_ws) {
      return NextResponse.json(
        { success: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    console.log("Completando transacción (producción):", { token_ws, orderId });

    // Idempotencia: si orderId llegó y ya está completed, retornar sin tocar Webpay
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

    // Commit
    let commitResp;
    try {
      commitResp = await webpay.commit(token_ws);
      console.log("✅ Commit Webpay:", {
        buy_order: commitResp.buy_order,
        status: commitResp.status,
        response_code: commitResp.response_code,
      });
    } catch (commitError) {
      console.error("Error en commit:", commitError);

      // Transacción ya procesada → consultar status
      if (commitError?.response?.status === 422) {
        try {
          const statusResp = await webpay.status(token_ws);
          console.log("ℹ️ Status tras 422:", {
            buy_order: statusResp.buy_order,
            status: statusResp.status,
            response_code: statusResp.response_code,
          });
          commitResp = statusResp;
        } catch (statusError) {
          return NextResponse.json(
            { success: false, error: `Error al consultar estado: ${statusError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: `Error en commit: ${commitError.message}` },
          { status: 500 }
        );
      }
    }

    const isApproved =
      commitResp?.response_code === 0 && commitResp?.status === "AUTHORIZED";
    const status = isApproved ? "completed" : "failed";
    const resolvedOrderKey = orderId || commitResp?.buy_order;

    // Actualizar Firestore
    const updateResult = await updateOrderInFirestore(
      resolvedOrderKey,
      status,
      isApproved,
      commitResp,
      token_ws
    );

    if (updateResult?.error) {
      return NextResponse.json(
        { success: false, error: updateResult.error },
        { status: 500 }
      );
    }
    if (!updateResult) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: updateResult.id || resolvedOrderKey || null,
      status,
      isApproved,
      details: {
        response_code: commitResp.response_code,
        status: commitResp.status,
        authorization_code: commitResp.authorization_code,
        payment_type_code: commitResp.payment_type_code,
        transaction_date: commitResp.transaction_date,
        accounting_date: commitResp.accounting_date,
        card_number: commitResp.card_detail?.card_number,
        amount: commitResp.amount,
        buy_order: commitResp.buy_order,
        session_id: commitResp.session_id,
      },
    });
  } catch (error) {
    console.error("❌ Error en payment-confirmation:", error);
    return NextResponse.json(
      { success: false, error: `Error al completar la transacción: ${error.message}` },
      { status: 500 }
    );
  }
}
