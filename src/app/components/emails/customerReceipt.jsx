import * as React from "react";

export function CustomerReceipt(props) {
  const {
    orderId,
    buyOrder,
    customer = {},
    summary = {},
    transaction = {},
    items = [],
  } = props;

  const money = (v) =>
    typeof v === "number"
      ? v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      : "—";

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ color: "#46621f" }}>Comprobante de pedido</h1>
      <p>Hola {customer.firstName} {customer.lastName}, gracias por tu compra.</p>

      <h3>Resumen</h3>
      <ul>
        <li>Pedido interno: {orderId}</li>
        <li>Buy Order Webpay: {buyOrder || "—"}</li>
        <li>Estado: {transaction.status || "—"} (código {transaction.response_code ?? "—"})</li>
        <li>Autorización: {transaction.authorization_code || "—"}</li>
        <li>Medio: {transaction.payment_type_code || "—"}</li>
        <li>Tarjeta: {transaction.card_number ? `**** **** **** ${transaction.card_number}` : "—"}</li>
        <li>Fecha transacción: {transaction.transaction_date || "—"}</li>
      </ul>

      <h3>Productos</h3>
      {Array.isArray(items) && items.length ? (
        <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th align="left">Producto</th>
              <th align="right">Cant.</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const qty = Number(it?.quantity ?? 1);
              const line = Number(it?.price ?? 0) * qty;
              return (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td>{it?.title || "Producto"}</td>
                  <td align="right">{qty}</td>
                  <td align="right">{money(line)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>—</p>
      )}

      <h3>Totales</h3>
      <ul>
        <li>Subtotal: {money(summary.subtotal)}</li>
        <li>Envío: {money(summary.shippingCost)}</li>
        <li>Total: {money(summary.total)}</li>
      </ul>

      <p style={{ color: "#6b7280", fontSize: 12 }}>
        Este correo no reemplaza boleta/factura. Para consultas, escribe a manosdelmargamarga@gmail.com.
      </p>
    </div>
  );
}
