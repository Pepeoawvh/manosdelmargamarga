import * as React from "react";

export function AdminNotice(props) {
  const { orderId, buyOrder, customer = {}, summary = {}, transaction = {} } = props;

  const money = (v) =>
    typeof v === "number"
      ? v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
      : "—";

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ color: "#5e8c30" }}>Nueva transacción Webpay</h1>
      <ul>
        <li>Pedido interno: {orderId}</li>
        <li>Buy Order: {buyOrder || "—"}</li>
        <li>Estado: {transaction.status || "—"} (resp {transaction.response_code ?? "—"})</li>
        <li>Autorización: {transaction.authorization_code || "—"}</li>
        <li>Medio: {transaction.payment_type_code || "—"}</li>
        <li>Tarjeta: {transaction.card_number ? `**** **** **** ${transaction.card_number}` : "—"}</li>
        <li>Fecha: {transaction.transaction_date || "—"}</li>
      </ul>

      <h3>Cliente</h3>
      <ul>
        <li>Nombre: {customer.firstName} {customer.lastName}</li>
        <li>Email: {customer.email}</li>
        <li>Teléfono: {customer.phone || "—"}</li>
      </ul>

      <h3>Totales</h3>
      <ul>
        <li>Subtotal: {money(summary.subtotal)}</li>
        <li>Envío: {money(summary.shippingCost)}</li>
        <li>Total: {money(summary.total)}</li>
      </ul>
    </div>
  );
}
