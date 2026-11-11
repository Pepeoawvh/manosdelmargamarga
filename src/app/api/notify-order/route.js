export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import admin, { adminDb } from "../../../lib/firebase/admin";
import { CustomerReceipt } from "../../components/emails/customerReceipt";
import { AdminNotice } from "../../components/emails/AdminNotice";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const started = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body?.orderId;

    console.log("notify-order IN →", {
      orderId,
      hasApiKey: Boolean(process.env.RESEND_API_KEY),
      fromEnv: process.env.RESEND_FROM,
      commerceToEnv: process.env.COMMERCE_TO,
    });

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    // Leer orden
    const docRef = adminDb.collection("orders").doc(orderId);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.warn("notify-order WARN: orden no encontrada", { orderId });
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const order = snap.data() || {};
    const t = order.transactionDetails || {};
    const customer = order.customer || {};
    const summary = order.summary || {};
    const items = Array.isArray(order.cart) ? order.cart : [];

    // Validaciones mínimas
    const customerTo = customer?.email;
    if (!customerTo || typeof customerTo !== "string") {
      console.warn("notify-order WARN: orden sin email de cliente", { orderId });
      return NextResponse.json({ error: "La orden no tiene email de cliente" }, { status: 400 });
    }

    const fromEmail = process.env.RESEND_FROM || "notificaciones@manosdelmargamarga.cl";
    const from = `Manos del Marga Marga <${fromEmail}>`;
    const commerceTo = process.env.COMMERCE_TO || customerTo;

    // Construir React templates
    const customerReact = CustomerReceipt({
      orderId: snap.id,
      buyOrder: t.buy_order || order.buy_order,
      customer,
      summary,
      transaction: {
        status: t.status,
        response_code: t.response_code,
        authorization_code: t.authorization_code,
        payment_type_code: t.payment_type_code,
        transaction_date: t.transaction_date,
        card_number: t.card_number,
      },
      items,
    });

    const adminReact = AdminNotice({
      orderId: snap.id,
      buyOrder: t.buy_order || order.buy_order,
      customer,
      summary,
      transaction: {
        status: t.status,
        response_code: t.response_code,
        authorization_code: t.authorization_code,
        payment_type_code: t.payment_type_code,
        transaction_date: t.transaction_date,
        card_number: t.card_number,
      },
    });

    console.log("notify-order SEND →", {
      orderId: snap.id,
      toCustomer: customerTo,
      toCommerce: commerceTo,
      from,
      buy_order: t.buy_order || order.buy_order,
      status: t.status,
    });

    // Enviar ambos correos
    const [toCustomerRes, toCommerceRes] = await Promise.all([
      resend.emails.send({
        from,
        to: customerTo,
        subject: `Pedido #${snap.id.slice(-6).toUpperCase()} recibido`,
        react: customerReact,
      }),
      resend.emails.send({
        from,
        to: commerceTo,
        subject: `Nueva transacción Webpay - Pedido ${snap.id}`,
        react: adminReact,
      }),
    ]);

    console.log("notify-order SENT ←", {
      customer: { id: toCustomerRes?.id, error: toCustomerRes?.error || null },
      commerce: { id: toCommerceRes?.id, error: toCommerceRes?.error || null },
      ms: Date.now() - started,
    });

    // Marcar notificado (opcional)
    try {
      await docRef.update({
        notifications: {
          customerAt: admin.firestore.FieldValue.serverTimestamp(),
          adminAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
    } catch (e) {
      console.warn("notify-order WARN: no se pudo actualizar notifications", { orderId, err: e?.message });
    }

    return NextResponse.json(
      {
        ok: true,
        results: {
          customer: toCustomerRes,
          commerce: toCommerceRes,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("notify-order ERROR:", { message: err?.message, stack: err?.stack });
    return NextResponse.json({ error: err?.message || "Error interno" }, { status: 500 });
  }
}
