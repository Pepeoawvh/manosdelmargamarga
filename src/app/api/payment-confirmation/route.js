import { NextResponse } from "next/server";

// Proxy transparente hacia /api/complete-transaction
// Mantiene el contrato actual: recibe { token_ws, orderId } y retorna el JSON del endpoint central.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token_ws = body?.token_ws;
    const orderId = body?.orderId || null;

    if (!token_ws || typeof token_ws !== "string" || token_ws.length !== 64) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 400 });
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: "BASE_URL no configurado" }, { status: 500 });
    }

    const url = `${baseUrl}/api/complete-transaction`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_ws, orderId }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("payment-confirmation proxy error:", e);
    return NextResponse.json({ success: false, error: e?.message || "Error interno" }, { status: 500 });
  }
}
