"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import OrderSummary from "../components/cart/OrderSummary";
import { FaCheckCircle } from "react-icons/fa";

// === NUEVO: helpers de fecha robustos ===
const toDateSafe = (val) => {
  try {
    if (!val) return null;
    if (typeof val?.toDate === "function") return val.toDate(); // Firestore Timestamp
    if (val instanceof Date) return val;
    if (typeof val === "number") return new Date(val);          // epoch ms
    if (typeof val === "string") return new Date(val);          // ISO
    return null;
  } catch {
    return null;
  }
};

const resolveOrderDate = (order) => {
  return (
    toDateSafe(order?.finalizedAt) ||
    toDateSafe(order?.transactionDetails?.transaction_date) ||
    toDateSafe(order?.createdAt) ||
    toDateSafe(order?.date) ||
    null
  );
};

const formatDateCL = (date) => {
  if (!date) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
// === FIN helpers ===

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // token_ws viene por GET desde Webpay (redirigido por /api/webpay-return)
  const token_ws = useMemo(() => searchParams.get("token_ws") || "", [searchParams]);

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const [statusLabel, setStatusLabel] = useState("pending");

  const fetchCompleteTransaction = async (token) => {
    const res = await fetch("/api/complete-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_ws: token }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  // Guard: si no hay token válido, salir de inmediato a payment-failure
  useEffect(() => {
    const t = token_ws?.trim();
    if (!t || t.length !== 64) {
      router.replace("/payment-failure?reason=missing_token");
      return;
    }
  }, [token_ws, router]);

  // Formateador robusto de fecha (mantener por compatibilidad con tu UI)
  const safeFormatDate = (ts) => {
    try {
      if (!ts) return "Fecha no disponible";

      if (typeof ts?.toDate === "function") {
        const d = ts.toDate();
        if (isNaN(d?.getTime?.())) return "Fecha no disponible";
        return new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
      }

      if (ts instanceof Date) {
        if (isNaN(ts.getTime())) return "Fecha no disponible";
        return new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(ts);
      }

      if (typeof ts === "number" || (typeof ts === "string" && /^\d+$/.test(ts))) {
        const n = typeof ts === "number" ? ts : parseInt(ts, 10);
        const d = new Date(n);
        if (isNaN(d.getTime())) return "Fecha no disponible";
        return new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
      }

      if (typeof ts === "string") {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return "Fecha no disponible";
        return new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
      }

      return "Fecha no disponible";
    } catch {
      return "Fecha no disponible";
    }
  };

  useEffect(() => {
    const processTransaction = async () => {
      const debug = {
        params: { token_ws },
        timestamps: { start: new Date().toISOString() },
        errors: [],
      };
      try {
        if (!token_ws || token_ws.length !== 64) {
          // Defensa extra si aún no se ejecutó el replace del guard
          throw new Error("No se recibió token_ws válido");
        }
        const result = await fetchCompleteTransaction(token_ws);

        if (result.success && result.order) {
          setOrderDetails(result.order);
          setStatusLabel(result.isApproved ? "approved" : "rejected");
        } else {
          debug.errors.push(result.error || "Error desconocido");
          setStatusLabel("rejected");
        }
      } catch (err) {
        debug.errors.push(err.message);
        setStatusLabel("rejected");
      } finally {
        debug.timestamps.end = new Date().toISOString();
        setDebugInfo(debug);
        setLoading(false);
      }
    };

    if (token_ws && token_ws.length === 64) {
      processTransaction();
    }
  }, [token_ws]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando detalles del pedido...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl mb-4">No se pudo encontrar la información del pedido.</p>
        <pre className="bg-stone-100 p-2 rounded text-xs mb-4">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <div className="flex gap-3">
          <Link
            href="/catalogo"
            className="py-2 px-4 bg-[#5e8c30] hover:bg-[#4d7528] text-white rounded transition-colors"
          >
            Volver al catálogo
          </Link>
          <Link
            href="/payment-failure"
            className="py-2 px-4 bg-stone-100 hover:bg-stone-200 rounded text-stone-800 transition-colors"
          >
            Ver detalles de fallo
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = statusLabel === "approved";
  const badge = isApproved
    ? { text: "Pago aprobado", cls: "bg-[#e5f2d9] text-[#46621f]" }
    : { text: "Pago no aprobado", cls: "bg-amber-100 text-amber-800" };

  // === CAMBIO: usar resolver robusto y formatear ===
  const resolvedDate = resolveOrderDate(orderDetails);
  const shownDate = formatDateCL(resolvedDate);
  // === FIN CAMBIO ===

  return (
    <div className="min-h-screen bg-[#f5f3e6] py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <FaCheckCircle
              className={`text-3xl ${isApproved ? "text-[#5e8c30]" : "text-amber-600"}`}
            />
            <h1
              className={`text-2xl md:text-3xl font-semibold ${
                isApproved ? "text-[#46621f]" : "text-amber-700"
              }`}
            >
              {isApproved
                ? "¡Felicidades! Tu pedido se ha completado con éxito"
                : "Pago recibido, en revisión"}
            </h1>
          </div>
          <p className="text-stone-600 mt-2">
            {isApproved
              ? "Gracias por confiar en nosotros."
              : "Si el emisor finaliza el proceso, se informará el resultado."}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
            <div className={`px-3 py-1 rounded-full font-medium ${badge.cls}`}>{badge.text}</div>
            <div className="bg-stone-100 px-3 py-1 rounded-full">
              <span className="font-medium">Pedido:</span>{" "}
              #{orderDetails.id?.slice?.(-6)?.toUpperCase?.() || "N/D"}
            </div>
            <div className="bg-stone-100 px-3 py-1 rounded-full">
              <span className="font-medium">Fecha:</span> {shownDate}
            </div>
          </div>
        </div>

        {orderDetails.customer && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#faf8ee] rounded p-4 border border-[#ece7d2]">
              <h3 className="font-medium text-[#3f4f1c] mb-2">Datos del Cliente</h3>
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {orderDetails.customer.firstName} {orderDetails.customer.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {orderDetails.customer.email}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span> {orderDetails.customer.phone}
              </p>
              {orderDetails.customer.rut && (
                <p>
                  <span className="font-medium">RUT:</span> {orderDetails.customer.rut}
                </p>
              )}
            </div>
            <div className="bg-[#faf8ee] rounded p-4 border border-[#ece7d2]">
              <h3 className="font-medium text-[#3f4f1c] mb-2">Dirección de Envío</h3>
              <p>
                {orderDetails.customer.address}
                <br />
                {orderDetails.customer.city && orderDetails.customer.region
                  ? `${orderDetails.customer.city}, ${orderDetails.customer.region}`
                  : ""}
              </p>
            </div>
          </div>
        )}

        {orderDetails.cart && orderDetails.summary ? (
          <OrderSummary
            cart={orderDetails.cart}
            subtotal={orderDetails.summary.subtotal}
            shippingCost={orderDetails.summary.shippingCost}
            total={orderDetails.summary.total}
          />
        ) : (
          <div className="bg-[#faf8ee] rounded p-4 mb-6 text-center border border-[#ece7d2]">
            No se pudo cargar el detalle del pedido
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <Link
            href="/catalogo"
            className="flex-1 py-3 px-4 bg-[#5e8c30] hover:bg-[#4d7528] text-white text-center rounded transition-colors"
          >
            Seguir comprando
          </Link>
          {!isApproved && (
            <Link
              href="/payment-failure?retry=true"
              className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-center rounded text-stone-800 transition-colors"
            >
              Reintentar pago
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
