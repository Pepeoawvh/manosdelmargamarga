import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactMessage } from "../../../components/emails/ContactMessage";
import admin, { adminDb } from "../../../../lib/firebase/admin"; // usa tu admin existente

const resend = new Resend(process.env.RESEND_API_KEY);
// const WINDOW_MS = 2 * 60 * 60 * 1000; // 2 horas (producción)
const WINDOW_MS = 0; // sin cooldown (pruebas)
const COLLECTION = "contact-rate";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, subject, message, website } = body || {}; // 'website' será honeypot

    // Honeypot: si viene rellenado, abortar silenciosamente
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({ ok: true }); // responder OK para no dar feedback a bots
    }

    // Validaciones mínimas
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, correo y mensaje son obligatorios" },
        { status: 400 }
      );
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }
    // Limitar tamaño y enlaces
    if (message.length > 4000) {
      return NextResponse.json({ error: "Mensaje demasiado largo" }, { status: 400 });
    }
    const linksCount = (message.match(/https?:\/\//gi) || []).length;
    if (linksCount > 3) {
      return NextResponse.json({ error: "Demasiados enlaces en el mensaje" }, { status: 400 });
    }

    // Rate limit por email + ip
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const key = `${email.toLowerCase()}__${ip}`;

    const now = Date.now();
    const ref = adminDb.collection(COLLECTION).doc(key);
    const snap = await ref.get();
    if (snap.exists) {
      const last = snap.data()?.lastAt || 0;
      if (now - last < WINDOW_MS) {
        return NextResponse.json(
          { error: "Se ha alcanzado el límite de envíos. Inténtalo más tarde." },
          { status: 429 }
        );
      }
    }
    await ref.set({ lastAt: now }, { merge: true });

    // Envío de correo
    const fromEmail = process.env.RESEND_FROM || "notificaciones@manosdelmargamarga.cl";
    const from = `Manos del Marga Marga <${fromEmail}>`;
    const to = process.env.COMMERCE_TO || "contacto@manosdelmargamarga.cl";

    const react = ContactMessage({ name, email, phone, subject, message });
    const subjectLine = subject?.trim()
      ? `[Contacto] ${subject.trim()}`
      : "[Contacto] Nuevo mensaje desde el sitio";

    const sendRes = await resend.emails.send({
      from,
      to,
      reply_to: email,
      subject: subjectLine,
      react,
    });

    if (sendRes?.error) {
      return NextResponse.json(
        { error: sendRes.error.message || "Error al enviar correo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: sendRes?.id || null }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
