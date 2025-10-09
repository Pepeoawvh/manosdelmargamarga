import { NextResponse } from "next/server";

// Este handler es el punto de retorno de Webpay.
// Decide a qué UI redirigir según vengan parámetros de éxito (token_ws)
// o de cancelación (TBK_*) o si faltan parámetros.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Parámetros que Webpay envía en retorno
    const token_ws = searchParams.get("token_ws");
    const tbkToken = searchParams.get("TBK_TOKEN");
    const tbkOrden = searchParams.get("TBK_ORDEN_COMPRA");
    const tbkIdSesion = searchParams.get("TBK_ID_SESION");

    // URLs finales
    const baseUrl = process.env.BASE_URL || "";
    const successUrl = `${baseUrl}/payment-success`;
    const failureUrl = `${baseUrl}/payment-failure`;

    // Caso 1: éxito → redirigir a payment-success con token_ws para que el cliente confirme
    if (token_ws && token_ws.length === 64) {
      const redirectUrl = new URL(successUrl);
      redirectUrl.searchParams.set("token_ws", token_ws);
      return NextResponse.redirect(redirectUrl.toString(), 303);
    }

    // Caso 2: cancelación o timeout (Webpay envía TBK_*)
    if (tbkToken || tbkOrden || tbkIdSesion) {
      const redirectUrl = new URL(failureUrl);
      redirectUrl.searchParams.set("motivo", "cancelled");
      if (tbkOrden) redirectUrl.searchParams.set("buy_order", tbkOrden);
      return NextResponse.redirect(redirectUrl.toString(), 303);
    }

    // Caso 3: sin parámetros válidos → tratar como fallo
    const fallbackUrl = new URL(failureUrl);
    fallbackUrl.searchParams.set("motivo", "invalid_return");
    return NextResponse.redirect(fallbackUrl.toString(), 303);
  } catch (e) {
    // En caso de error inesperado, enviar a fallo con motivo=exception
    const failureUrl = `${process.env.BASE_URL || ""}/payment-failure?motivo=exception`;
    return NextResponse.redirect(failureUrl, 303);
  }
}
