'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { firestoreDB } from '../lib/firebase/config';
import OrderSummary from '../components/cart/OrderSummary';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const token_ws = searchParams.get('token_ws');
  const TBK_ORDEN_COMPRA = searchParams.get('TBK_ORDEN_COMPRA');
  const orderIdParam = searchParams.get('orderId');

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchAttempts, setSearchAttempts] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 1500; // ms

  // --- FUNCIONES AUXILIARES ---
  const logDebug = (field, value) => setDebugInfo(prev => ({ ...prev, [field]: value }));

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchCompleteTransaction = async (token) => {
    const res = await fetch('/api/webpay/complete-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_ws: token })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const fetchOrderById = async (id, attemptsArr) => {
    attemptsArr.push('ID de documento');
    const orderRef = doc(firestoreDB, 'orders', id);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) return { id: orderSnap.id, ...orderSnap.data() };

    attemptsArr.push('Campo id');
    const q = query(collection(firestoreDB, 'orders'), where('id', '==', id));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    throw new Error('Orden no encontrada por ID');
  };

  const fetchOrderByToken = async (token, attemptsArr) => {
    attemptsArr.push('webpayToken');
    const q = query(collection(firestoreDB, 'orders'), where('webpayToken', '==', token));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    throw new Error('Orden no encontrada por token_ws');
  };

  const retryFetchOrder = async (fetchFn, maxRetries, delay) => {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetchFn();
      } catch (err) {
        lastError = err;
        await sleep(delay);
      }
    }
    throw lastError;
  };

  const processTransaction = async () => {
    const attempts = [];
    const debug = {
      params: { token_ws, TBK_ORDEN_COMPRA, orderIdParam },
      timestamps: { start: new Date().toISOString() },
      errors: [],
      searchResults: {}
    };

    try {
      if (!token_ws && !TBK_ORDEN_COMPRA && !orderIdParam) {
        throw new Error('No se recibieron parámetros de identificación');
      }

      let order = null;

      if (token_ws) {
        try {
          const result = await fetchCompleteTransaction(token_ws);
          logDebug('confirmationResult', result);

          if (result.success && result.orderId) {
            setPaymentCompleted(true);
            // Reintentos para buscar la orden
            order = await retryFetchOrder(() => fetchOrderById(result.orderId, attempts), MAX_RETRIES, RETRY_DELAY)
              .catch(async () => {
                debug.errors.push('No se encontró la orden por ID, intentando token_ws...');
                return await retryFetchOrder(() => fetchOrderByToken(token_ws, attempts), MAX_RETRIES, RETRY_DELAY);
              });
          } else {
            throw new Error(result.error || 'Confirmación WebPay fallida');
          }
        } catch (err) {
          debug.errors.push(err.message);
          // Fallback directo por token_ws
          try {
            order = await retryFetchOrder(() => fetchOrderByToken(token_ws, attempts), MAX_RETRIES, RETRY_DELAY);
          } catch (e) {
            debug.errors.push(e.message);
          }
        }
      } else if (TBK_ORDEN_COMPRA || orderIdParam) {
        const searchId = orderIdParam || TBK_ORDEN_COMPRA;
        try {
          order = await retryFetchOrder(() => fetchOrderById(searchId, attempts), MAX_RETRIES, RETRY_DELAY);
        } catch (err) {
          debug.errors.push(err.message);
        }
      }

      if (order) setOrderDetails(order);
    } catch (err) {
      debug.errors.push(err.message);
    } finally {
      debug.timestamps.end = new Date().toISOString();
      setSearchAttempts(attempts);
      setDebugInfo(debug);
      setLoading(false);
    }
  };

  useEffect(() => { processTransaction(); }, [token_ws, TBK_ORDEN_COMPRA, orderIdParam]);

  // --- FUNCIONES DE FORMATO ---
  const formatDate = (ts) => {
    if (!ts) return 'Fecha no disponible';
    let date;
    try {
      date = ts.toDate?.() || ts instanceof Date ? ts : new Date(ts);
      return new Intl.DateTimeFormat('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(date);
    } catch {
      return 'Fecha inválida';
    }
  };

  const translatePaymentStatus = (order) => {
    if (!order) return { text: 'Estado desconocido', class: 'bg-gray-100 text-gray-800' };
    const responseCode = order.transactionDetails?.response_code ?? order.response_code;
    const status = order.transactionDetails?.status ?? order.status_webpay;

    if ((responseCode === 0 || order.isApproved) && status === 'AUTHORIZED') {
      return { text: 'Pago aprobado', class: 'bg-green-100 text-green-800' };
    }
    if (responseCode !== 0) return { text: 'Pago rechazado', class: 'bg-red-100 text-red-800' };
    return { text: 'Estado desconocido', class: 'bg-gray-100 text-gray-800' };
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

  const paymentStatusInfo = translatePaymentStatus(orderDetails);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <div className="text-center mb-6">
          <p className="text-gray-600 mt-2">Detalle de su pedido:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className={`px-3 w-full py-1 rounded-full font-medium ${paymentStatusInfo.class}`}>
              {paymentStatusInfo.text}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full w-full">
              <span className="font-medium">Pedido:</span> #{orderDetails.id.slice(-6).toUpperCase()}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full w-full">
              <span className="font-medium">Fecha:</span> {formatDate(orderDetails.createdAt)}
            </div>
          </div>
        </div>

        {/* Cliente y envío */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium text-gray-800 mb-2">Datos del Cliente</h3>
            {orderDetails.customer ? (
              <>
                <p><span className="font-medium">Nombre:</span> {orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
                <p><span className="font-medium">Email:</span> {orderDetails.customer.email}</p>
                <p><span className="font-medium">Teléfono:</span> {orderDetails.customer.phone}</p>
                {orderDetails.customer.rut && <p><span className="font-medium">RUT:</span> {orderDetails.customer.rut}</p>}
              </>
            ) : <p>Información del cliente no disponible</p>}
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium text-gray-800 mb-2">Dirección de Envío</h3>
            <p>{orderDetails.customer?.address}<br />{orderDetails.customer?.city && orderDetails.customer?.region && `${orderDetails.customer.city}, ${orderDetails.customer.region}`}</p>
          </div>
        </div>

        {/* Resumen de pedido */}
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
