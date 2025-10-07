'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderSummary from '../components/cart/OrderSummary';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // token_ws viene por GET desde Webpay (API v1.1+)
  const token_ws = useMemo(() => searchParams.get('token_ws') || '', [searchParams]);

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const [statusLabel, setStatusLabel] = useState('pending');

  const fetchCompleteTransaction = async (token) => {
    const res = await fetch('/api/complete-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_ws: token }),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  // Formateador robusto de fecha para evitar RangeError: Invalid time value
  const safeFormatDate = (ts) => {
    try {
      if (!ts) return 'Fecha no disponible';

      // Firestore Timestamp
      if (typeof ts?.toDate === 'function') {
        const d = ts.toDate();
        if (isNaN(d?.getTime?.())) return 'Fecha no disponible';
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
      }

      // Date nativo
      if (ts instanceof Date) {
        if (isNaN(ts.getTime())) return 'Fecha no disponible';
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(ts);
      }

      // Epoch ms como number o string numérica
      if (typeof ts === 'number' || (typeof ts === 'string' && /^\d+$/.test(ts))) {
        const n = typeof ts === 'number' ? ts : parseInt(ts, 10);
        const d = new Date(n);
        if (isNaN(d.getTime())) return 'Fecha no disponible';
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
      }

      // ISO string u otro string parseable
      if (typeof ts === 'string') {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return 'Fecha no disponible';
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
      }

      return 'Fecha no disponible';
    } catch {
      return 'Fecha no disponible';
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
          throw new Error('No se recibió token_ws válido');
        }

        const result = await fetchCompleteTransaction(token_ws);

        if (result.success && result.order) {
          setOrderDetails(result.order);
          setStatusLabel(result.isApproved ? 'approved' : 'rejected');
        } else {
          debug.errors.push(result.error || 'Error desconocido');
          setStatusLabel('rejected');
        }
      } catch (err) {
        debug.errors.push(err.message);
        setStatusLabel('rejected');
      } finally {
        debug.timestamps.end = new Date().toISOString();
        setDebugInfo(debug);
        setLoading(false);
      }
    };

    processTransaction();
  }, [token_ws]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando detalles del pedido...</p>
      </div>
    );
  }

  // Si no hay orden, mostrar depuración y opción para reintentar
  if (!orderDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl mb-4">No se pudo encontrar la información del pedido.</p>
        <pre className="bg-gray-100 p-2 rounded text-xs mb-4">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <div className="flex gap-3">
          <Link href="/catalogo" className="py-2 px-4 bg-emerald-600 text-white rounded">
            Volver al catálogo
          </Link>
          <Link href="/payment-failure" className="py-2 px-4 bg-gray-200 rounded text-gray-800">
            Ver detalles de fallo
          </Link>
        </div>
      </div>
    );
  }

  const badge =
    statusLabel === 'approved'
      ? { text: 'Pago aprobado', cls: 'bg-green-100 text-green-800' }
      : { text: 'Pago no aprobado', cls: 'bg-red-100 text-red-800' };

  // Elegir fecha para mostrar: preferir createdAt de la orden; fallback a transaction_date del commit si existe en transactionDetails.
  const shownDate =
    orderDetails.createdAt ||
    orderDetails?.transactionDetails?.transaction_date ||
    null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <div className="text-center mb-6">
          <p className="text-gray-600 mt-2">Detalle de su pedido:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className={`px-3 w-full py-1 rounded-full font-medium ${badge.cls}`}>
              {badge.text}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full w-full">
              <span className="font-medium">Pedido:</span>{' '}
              #{orderDetails.id?.slice?.(-6)?.toUpperCase?.() || 'N/D'}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full w-full">
              <span className="font-medium">Fecha:</span> {safeFormatDate(shownDate)}
            </div>
          </div>
        </div>

        {orderDetails.customer && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium text-gray-800 mb-2">Datos del Cliente</h3>
              <p>
                <span className="font-medium">Nombre:</span> {orderDetails.customer.firstName}{' '}
                {orderDetails.customer.lastName}
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
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium text-gray-800 mb-2">Dirección de Envío</h3>
              <p>
                {orderDetails.customer.address}
                <br />
                {orderDetails.customer.city && orderDetails.customer.region
                  ? `${orderDetails.customer.city}, ${orderDetails.customer.region}`
                  : ''}
              </p>
            </div>
          </div>
        )}

        {orderDetails.cart && orderDetails.summary ? (
          <OrderSummary
            cart={orderDetails.cart}
            subtotal={orderDetails.summary.subtotal}
            shippingCost={orderDetails.summary.shipping}
            total={orderDetails.summary.total}
          />
        ) : (
          <div className="bg-gray-50 rounded p-4 mb-6 text-center">
            No se pudo cargar el detalle del pedido
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <Link
            href="/catalogo"
            className="flex-1 py-3 px-4 bg-emerald-600 text-white text-center rounded"
          >
            Seguir comprando
          </Link>
          {statusLabel !== 'approved' && (
            <Link
              href="/payment-failure?retry=true"
              className="flex-1 py-3 px-4 bg-gray-100 text-center rounded text-gray-800"
            >
              Reintentar pago
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
