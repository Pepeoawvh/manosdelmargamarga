'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OrderSummary from '../components/cart/OrderSummary';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const token_ws = searchParams.get('token_ws');

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  const fetchCompleteTransaction = async (token) => {
    const res = await fetch('/api/complete-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_ws: token })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    const processTransaction = async () => {
      const debug = { params: { token_ws }, timestamps: { start: new Date().toISOString() }, errors: [] };
      try {
        if (!token_ws) throw new Error('No se recibió token_ws');
        const result = await fetchCompleteTransaction(token_ws);

        if (result.success && result.order) {
          setOrderDetails(result.order);
        } else {
          debug.errors.push(result.error || 'Error desconocido');
        }
      } catch (err) {
        debug.errors.push(err.message);
      } finally {
        debug.timestamps.end = new Date().toISOString();
        setDebugInfo(debug);
        setLoading(false);
      }
    };

    processTransaction();
  }, [token_ws]);

  const formatDate = (ts) => {
    if (!ts) return 'Fecha no disponible';
    const date = ts.toDate?.() || ts instanceof Date ? ts : new Date(ts);
    return new Intl.DateTimeFormat('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(date);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Cargando detalles del pedido...</p></div>;

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl mb-4">No se pudo encontrar la información del pedido.</p>
        <pre className="bg-gray-100 p-2 rounded text-xs mb-4">{JSON.stringify(debugInfo, null, 2)}</pre>
        <Link href="/catalogo" className="py-2 px-4 bg-emerald-600 text-white rounded">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <div className="text-center mb-6">
          <p className="text-gray-600 mt-2">Detalle de su pedido:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className="px-3 w-full py-1 rounded-full font-medium bg-green-100 text-green-800">
              Pago aprobado
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full w-full">
              <span className="font-medium">Pedido:</span> #{orderDetails.id.slice(-6).toUpperCase()}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full w-full">
              <span className="font-medium">Fecha:</span> {formatDate(orderDetails.createdAt)}
            </div>
          </div>
        </div>

        {orderDetails.customer && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium text-gray-800 mb-2">Datos del Cliente</h3>
              <p><span className="font-medium">Nombre:</span> {orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
              <p><span className="font-medium">Email:</span> {orderDetails.customer.email}</p>
              <p><span className="font-medium">Teléfono:</span> {orderDetails.customer.phone}</p>
              {orderDetails.customer.rut && <p><span className="font-medium">RUT:</span> {orderDetails.customer.rut}</p>}
            </div>
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium text-gray-800 mb-2">Dirección de Envío</h3>
              <p>{orderDetails.customer.address}<br />{orderDetails.customer.city && orderDetails.customer.region && `${orderDetails.customer.city}, ${orderDetails.customer.region}`}</p>
            </div>
          </div>
        )}

        {orderDetails.cart && orderDetails.summary ? (
          <OrderSummary cart={orderDetails.cart} subtotal={orderDetails.summary.subtotal} shippingCost={orderDetails.summary.shipping} total={orderDetails.summary.total} />
        ) : (
          <div className="bg-gray-50 rounded p-4 mb-6 text-center">No se pudo cargar el detalle del pedido</div>
        )}

        <Link href="/catalogo" className="block w-full py-3 px-4 bg-emerald-600 text-white text-center rounded">Seguir comprando</Link>
      </div>
    </div>
  );
}
