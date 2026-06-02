import { NextResponse } from "next/server";
import crypto from "node:crypto";
import admin, { adminDb } from "../../../lib/firebase/admin";

// Utilidad: guardar evento con idempotencia
async function saveWebhookEvent({ provider, raw, body, headers }) {
  const dedupId = crypto.createHash("sha256").update(raw).digest("hex");

  const existing = await adminDb
    .collection("webhooks")
    .where("dedupId", "==", dedupId)
    .limit(1)
    .get();

  if (!existing.empty) {
    return { deduped: true, id: existing.docs[0].id, dedupId };
  }

  const ref = await adminDb.collection("webhooks").add({
    provider,
    body,
    headers,
    dedupId,
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { deduped: false, id: ref.id, dedupId };
}

// Opcional: actualizar orden si el webhook trae buy_order y nuevo estado
async function maybeUpdateOrderFromWebhook(body) {
  try {
    const buyOrder = body?.buy_order || body?.detail?.buy_order || null;
    if (!buyOrder) return { updated: false, reason: "no_buy_order" };

    // Mapear estado desde el payload real de Webpay
    const wbStatus = body?.status || body?.detail?.status || null;
    const responseCode =
      typeof body?.response_code === "number"
        ? body.response_code
        : typeof body?.detail?.response_code === "number"
        ? body.detail.response_code
        : null;

    // Determinar flags internos
    const isApproved = wbStatus === "AUTHORIZED" && responseCode === 0;
    const paymentStatus = isApproved ? "completed" : "failed";

    // Buscar orden por buy_order
    const snap = await adminDb
      .collection("orders")
      .where("buy_order", "==", buyOrder)
      .limit(1)
      .get();

    if (snap.empty) {
      return { updated: false, reason: "order_not_found", buyOrder };
    }

    const doc = snap.docs[0];
    await doc.ref.update({
      paymentStatus,
      isApproved,
      webhookLastStatus: {
        status: wbStatus ?? null,
        response_code: responseCode ?? null,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { updated: true, orderId: doc.id, paymentStatus, isApproved };
  } catch (e) {
    return { updated: false, error: e?.message || String(e) };
  }
}

export async function POST(request) {
  try {
    // Leer crudo para poder firmar/deduplicar
    const raw = await request.text();
    const contentType = request.headers.get("content-type") || "application/json";
    const ua = request.headers.get("user-agent") || "";
    const body = contentType.includes("application/json") ? JSON.parse(raw || "{}") : { raw };

    // Validación básica de origen (ajusta según tu setup)
    // Si configuras un secreto propio, valídalo aquí con un header, ej. x-webpay-secret
    const headers = {
      "user-agent": ua,
      "content-type": contentType,
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      "x-vercel-ip": request.headers.get("x-vercel-ip") || "",
    };

    // Guardar evento con idempotencia
    const saved = await saveWebhookEvent({
      provider: "webpay",
      raw,
      body,
      headers,
    });

    // Intentar actualizar orden si el payload trae buy_order
    const updateRes = await maybeUpdateOrderFromWebhook(body);

    return NextResponse.json(
      {
        success: true,
        deduped: saved.deduped,
        eventId: saved.id,
        update: updateRes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error procesando webhook de WebPay:", error);
    return NextResponse.json(
      { success: false, message: "Error interno al procesar la notificación" },
      { status: 500 }
    );
  }
}
