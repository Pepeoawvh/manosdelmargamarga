import * as React from "react";

const money = (v) =>
  typeof v === "number"
    ? v.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      })
    : "—";

export function ContactMessage(props) {
  const { name, email, phone, subject, message } = props;

  const row = (label, value) => (
    <tr>
      <td style={{ padding: "6px 0", color: "#3f4f1c", fontWeight: 600, width: 140 }}>
        {label}
      </td>
      <td style={{ padding: "6px 0", color: "#333" }}>{value || "—"}</td>
    </tr>
  );

  return (
    <div
      style={{
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        background: "#f5f3e6",
        padding: 16,
      }}
    >
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{ maxWidth: 640, margin: "0 auto", background: "#ffffff", borderRadius: 8, overflow: "hidden" }}
      >
        <tbody>
          <tr>
            <td style={{ background: "#e5f2d9", color: "#46621f", padding: "14px 16px", fontSize: 18, fontWeight: 700 }}>
              Nuevo mensaje de contacto
            </td>
          </tr>

          <tr>
            <td style={{ padding: 16 }}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  {row("Nombre", name)}
                  {row("Email", email)}
                  {phone ? row("Teléfono", phone) : null}
                  {subject ? row("Asunto", subject) : null}
                </tbody>
              </table>

              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: "#faf8ee",
                  border: "1px solid #ece7d2",
                  borderRadius: 6,
                  whiteSpace: "pre-wrap",
                  color: "#333",
                }}
              >
                {message}
              </div>

              <p style={{ marginTop: 16, color: "#666", fontSize: 12 }}>
                Enviado automáticamente desde el formulario de contacto del sitio.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
