export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import admin, { adminDb } from "../../../lib/firebase/admin";
import { CustomerReceipt } from "../../components/emails/customerReceipt";
import { AdminNotice } from "../../components/emails/AdminNotice";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const orderId = body?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    const docRef = adminDb.collection("orders").doc(orderId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    const order = snap.data() || {};

    const t = order.transactionDetails || {};
    const customer = order.customer || {};
    const summary = order.summary || {};
    const items = Array.isArray(order.cart) ? order.cart : [];

    // From con nombre de marca + email del entorno
    const fromEmail = process.env.RESEND_FROM || "notificaciones@manosdelmargamarga.cl";
    const from = `Manos del Marga Marga <${fromEmail}>`;

    const commerceTo = process.env.COMMERCE_TO || customer.email;
    const customerTo = customer.email;

    if (!customerTo) {
      return NextResponse.json({ error: "La orden no tiene email de cliente" }, { status: 400 });
    }

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

    // Enviar ambos correos (sin reply_to, no se esperan respuestas)
    const results = await Promise.all([
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

    // Marcar notificado (opcional)
    await docRef.update({
      notifications: {
        customerAt: admin.firestore.FieldValue.serverTimestamp(),
        adminAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ error: err?.message || "Error interno" }, { status: 500 });
  }
}
