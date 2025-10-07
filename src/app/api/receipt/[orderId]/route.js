import { NextResponse } from "next/server";
import admin, { adminDb } from "../../../../lib/firebase/admin";
import PdfPrinter from "pdfmake";

// Usar fuentes estándar del PDF para simplificar (no requiere TTFs)
const fonts = {
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
};

export async function GET(_req, { params }) {
  try {
    const { orderId } = params || {};
    if (!orderId) {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    // Cargar orden en Firestore
    const docRef = adminDb.collection("orders").doc(orderId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    const order = doc.data() || {};

    // Campos clave desde la orden/commit Webpay
    const t = order.transactionDetails || {};
    const comercioNombre = process.env.NEXT_PUBLIC_SITE_NAME || "Comercio";
    const comercioRut = process.env.NEXT_PUBLIC_COMPANY_RUT || "RUT Comercio";
    const iso = t.transaction_date || order.createdAt || new Date().toISOString();
    const fecha = new Date(iso);
    const buyOrder = t.buy_order || order.buy_order || orderId;
    const amount = Number(order?.summary?.total ?? t.amount ?? 0);
    const estado = t.status || order.paymentStatus || "—";
    const resp = t.response_code ?? "—";
    const auth = t.authorization_code || "—";
    const medio = t.payment_type_code || "—";
    const card = t.card_number ? `**** **** **** ${t.card_number}` : "—";
    const subtotal = Number(order?.summary?.subtotal ?? 0);
    const shipping = Number(order?.summary?.shippingCost ?? 0);
    const total = Number(order?.summary?.total ?? 0);

    // Definición del documento PDF
    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      defaultStyle: { font: "Times", fontSize: 11 },
      content: [
        { text: comercioNombre, style: "h1" },
        { text: `RUT: ${comercioRut}`, margin: [0, 2, 0, 8] },
        { text: "Comprobante de pago Webpay", style: "h2", margin: [0, 0, 0, 16] },

        { text: "Datos del pedido", style: "h3" },
        { text: `Pedido interno: ${doc.id}` },
        { text: `Buy Order: ${buyOrder}` },
        { text: `Fecha: ${isNaN(fecha) ? "—" : fecha.toLocaleString("es-CL")}`, margin: [0, 0, 0, 8] },

        { text: "Datos del cliente", style: "h3" },
        { text: `Nombre: ${(order?.customer?.firstName ?? "")} ${(order?.customer?.lastName ?? "")}` },
        { text: `Email: ${order?.customer?.email ?? "—"}` },
        { text: `Teléfono: ${order?.customer?.phone ?? "—"}` },
        { text: `Dirección: ${order?.customer?.address ?? "—"}`, margin: [0, 0, 0, 8] },

        { text: "Datos del pago", style: "h3" },
        { text: `Estado: ${estado}` },
        { text: `Código respuesta: ${resp}` },
        { text: `Autorización: ${auth}` },
        { text: `Medio: ${medio}` },
        { text: `Tarjeta: ${card}` },
        {
          text: `Monto: ${
            Number.isFinite(amount)
              ? amount.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
              : "—"
          }`,
          margin: [0, 0, 0, 8],
        },

        { text: "Resumen del pedido", style: "h3" },
        {
          text: `Subtotal: ${subtotal.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}`,
        },
        {
          text: `Envío: ${shipping.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}`,
        },
        {
          text: `Total: ${total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}`,
          margin: [0, 0, 0, 8],
          bold: true,
        },

        { text: "Este documento es un comprobante emitido por el comercio con base en la transacción procesada por Webpay.", style: "foot", margin: [0, 12, 0, 2] },
        { text: "La boleta o factura se emite según normativa vigente y puede ser enviada por correo o disponible en el panel del comercio.", style: "foot" },
      ],
      styles: {
        h1: { fontSize: 18, bold: true },
        h2: { fontSize: 14, bold: true },
        h3: { fontSize: 12, bold: true, margin: [0, 8, 0, 6] },
        foot: { fontSize: 9, color: "#666" },
      },
    };

    // Generar PDF en buffer
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    await new Promise((resolve, reject) => {
      pdfDoc.on("data", (c) => chunks.push(c));
      pdfDoc.on("end", resolve);
      pdfDoc.on("error", reject);
      pdfDoc.end();
    });
    const buffer = Buffer.concat(chunks);

    // Responder descarga
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Comprobante-${buyOrder}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
