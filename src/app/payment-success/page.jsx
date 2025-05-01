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
  const orderId = searchParams.get('orderId');
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchAttempts, setSearchAttempts] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const processTransaction = async () => {
      try {
        const attempts = []; // Inicializar array de intentos
        const debug = {
          params: { token_ws, TBK_ORDEN_COMPRA, orderId },
          timestamps: { start: new Date().toISOString() },
          errors: [],
          warnings: [],
          searchResults: {}
        };
        
        console.log('==== INICIO PROCESAMIENTO DE TRANSACCIÓN ====');
        console.log('Parámetros recibidos:', { token_ws, TBK_ORDEN_COMPRA, orderId });

        // Si no tenemos parámetros, no hay nada que buscar
        if (!token_ws && !TBK_ORDEN_COMPRA && !orderId) {
          const error = 'No se recibieron parámetros de identificación';
          console.error(error);
          debug.errors.push(error);
          setLoading(false);
          setDebugInfo(debug);
          return;
        }
                // FLUJO CORREGIDO: Si recibimos token_ws, PRIMERO confirmar la transacción
                if (token_ws) {
                  console.log('Token WebPay detectado - CONFIRMANDO PRIMERO con WebPay');
                  attempts.push('Confirmación WebPay');
                  
                  try {
                    // PASO 1: Confirmar transacción con WebPay (obligatorio según documentación)
                    console.log('Llamando a complete-transaction para confirmar con WebPay...');
                    const response = await fetch('/api/webpay/complete-transaction', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token_ws })
                    });
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
                    }
                    
                    const result = await response.json();
                    console.log('Respuesta de confirm WebPay:', result);
                    debug.confirmationResult = result;
                    
                    if (result.success) {
                      // La transacción fue confirmada, ahora usar el orderId de la respuesta
                      const confirmedOrderId = result.orderId;
                      if (!confirmedOrderId) {
                        throw new Error('No se recibió un ID de orden en la confirmación');
                      }
                      
                      console.log(`Transacción confirmada para orden: ${confirmedOrderId}`);
                      setPaymentCompleted(true);
                      
                      // PASO 2: Buscar la orden usando el ID obtenido de WebPay
                      try {
                        // Intentar primero como ID de documento
                        attempts.push('ID de documento (post-confirmación)');
                        const orderDocRef = doc(firestoreDB, 'orders', confirmedOrderId);
                        const orderDoc = await getDoc(orderDocRef);
                        
                        if (orderDoc.exists()) {
                          console.log('Orden encontrada por ID obtenido de WebPay');
                          setOrderDetails({ id: orderDoc.id, ...orderDoc.data() });
                          debug.searchResults.byWebPayId = { found: true };
                        } else {
                          // Como fallback, buscar por el campo id
                          attempts.push('Campo id (post-confirmación)');
                          const q = query(
                            collection(firestoreDB, 'orders'), 
                            where('id', '==', confirmedOrderId)
                          );
                          const snapshot = await getDocs(q);
                          
                          if (!snapshot.empty) {
                            const orderDoc = snapshot.docs[0];
                            console.log('Orden encontrada por campo id = confirmedOrderId');
                            setOrderDetails({ id: orderDoc.id, ...orderDoc.data() });
                            debug.searchResults.byIdField = { found: true, count: snapshot.size };
                          } else {
                            throw new Error('No se pudo encontrar la orden después de confirmar');
                          }
                        }
                      } catch (findErr) {
                        console.error('Error al buscar la orden después de confirmar:', findErr);
                        debug.errors.push(`Error al buscar orden después de confirmar: ${findErr.message}`);
                        
                        // BÚSQUEDA EXTRA: Por último, buscar por token_ws
                        attempts.push('webpayToken (último recurso)');
                        try {
                          const tokenQuery = query(
                            collection(firestoreDB, 'orders'), 
                            where('webpayToken', '==', token_ws)
                          );
                          const tokenSnapshot = await getDocs(tokenQuery);
                          
                          if (!tokenSnapshot.empty) {
                            const orderDoc = tokenSnapshot.docs[0];
                            console.log('Orden encontrada por webpayToken como último recurso');
                            setOrderDetails({ id: orderDoc.id, ...orderDoc.data() });
                            debug.searchResults.byWebpayToken = { found: true, count: tokenSnapshot.size };
                          } else {
                            debug.searchResults.byWebpayToken = { found: false };
                          }
                        } catch (e) {
                          debug.errors.push(`Error en búsqueda final: ${e.message}`);
                        }
                      }
                    } else {
                      throw new Error(result.error || 'Error desconocido al confirmar');
                    }
                  } catch (confirmErr) {
                    console.error('Error en confirm con WebPay:', confirmErr);
                    debug.errors.push(`Error al confirmar con WebPay: ${confirmErr.message}`);
                    
                    // FLUJO ALTERNATIVO: Si falla la confirmación, intentar búsqueda directa
                    console.log('Fallback: Intentando búsqueda sin confirmación previa');
                    attempts.push('Búsqueda directa (fallback)');
                    
                    // Intentar buscar por token_ws como webpayToken
                    try {
                      const q = query(collection(firestoreDB, 'orders'), where('webpayToken', '==', token_ws));
                      const snapshot = await getDocs(q);
                      debug.searchResults.fallbackByToken = { found: !snapshot.empty, count: snapshot.size };
                      
                      if (!snapshot.empty) {
                        const orderDoc = snapshot.docs[0];
                        console.log('Orden encontrada por webpayToken (fallback)');
                        setOrderDetails({ id: orderDoc.id, ...orderDoc.data() });
                      }
                    } catch (e) {
                      debug.errors.push(`Error en búsqueda fallback: ${e.message}`);
                    }
                  }
                } 
                // Caso: Tenemos TBK_ORDEN_COMPRA o orderId directo (sin token_ws)
                else if (TBK_ORDEN_COMPRA || orderId) {
                  const searchId = orderId || TBK_ORDEN_COMPRA;
                  console.log(`Buscando por ID directo: ${searchId}`);
                  attempts.push('ID directo');
                  
                  try {
                    // Intentar primero como ID de documento
                    const orderDocRef = doc(firestoreDB, 'orders', searchId);
                    const orderDoc = await getDoc(orderDocRef);
                    
                    if (orderDoc.exists()) {
                      console.log('Orden encontrada por ID directo');
                      setOrderDetails({ id: orderDoc.id, ...orderDoc.data() });
                      debug.searchResults.byDirectId = { found: true };
                    } else {
                      // Buscar por campo id
                      attempts.push('Campo id');
                      const q = query(collection(firestoreDB, 'orders'), where('id', '==', searchId));
                      const snapshot = await getDocs(q);
                      debug.searchResults.byIdField = { found: !snapshot.empty, count: snapshot.size };
                      
                      if (!snapshot.empty) {
                        const doc = snapshot.docs[0];
                        console.log('Orden encontrada por campo id');
                        setOrderDetails({ id: doc.id, ...doc.data() });
                      } else {
                        debug.errors.push(`No se encontró la orden con ID: ${searchId}`);
                      }
                    }
                  } catch (e) {
                    debug.errors.push(`Error buscando por ID: ${e.message}`);
                    console.error('Error buscando por ID:', e);
                  }
                }
                        // Guardar intentos de búsqueda y finalizar
        setSearchAttempts(attempts);
        debug.timestamps.end = new Date().toISOString();
        setDebugInfo(debug);
      } catch (error) {
        console.error('Error general:', error);
        setDebugInfo(prev => ({ 
          ...prev, 
          generalError: error.message,
          stack: error.stack 
        }));
      } finally {
        setLoading(false);
      }
    };

    processTransaction();
  }, [token_ws, TBK_ORDEN_COMPRA, orderId]);

  // Función para formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    // Si es un timestamp de Firestore
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      try {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (err) {
        console.error('Error al convertir timestamp:', err);
        return 'Error en fecha';
      }
    }
    
    // Si es un objeto Date normal
    if (timestamp instanceof Date) {
      return new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp);
    }
    
    // Si es un timestamp en segundos o milisegundos
    if (typeof timestamp === 'number') {
      return new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(timestamp));
    }
    
    return 'Fecha no disponible';
  };

  // Función para traducir el estado del pago de WebPay
  const translatePaymentStatus = (orderData) => {
    console.log('=== ANÁLISIS DE ESTADO DE PAGO ===');
    
    // Variables para diagnóstico
    const responseCode = {
      raiz: orderData.response_code,
      transactionDetails: orderData.transactionDetails?.response_code
    };
    
    const status = {
      raiz: orderData.status_webpay,
      transactionDetails: orderData.transactionDetails?.status
    };
    
    console.log('Response Code:', responseCode);
    console.log('Status:', status);
    
    // CASO 1: Verificar response_code=0 y status=AUTHORIZED según documentación oficial de WebPay
    
    // Primero en transactionDetails (más fiable)
    if (responseCode.transactionDetails === 0 && status.transactionDetails === 'AUTHORIZED') {
      console.log('✅ Transacción APROBADA según transactionDetails');
      return {
        text: 'Pago aprobado',
        class: 'bg-green-100 text-green-800'
      };
    }
    
    // Luego en campos de raíz
    if (responseCode.raiz === 0 && status.raiz === 'AUTHORIZED') {
      console.log('✅ Transacción APROBADA según campos de raíz');
      return {
        text: 'Pago aprobado',
        class: 'bg-green-100 text-green-800'
      };
    }
    
    // CASO 2: Si response_code no es 0 pero está definido, la transacción fue rechazada
    if (responseCode.transactionDetails !== undefined && responseCode.transactionDetails !== 0) {
      console.log(`❌ Transacción RECHAZADA (response_code=${responseCode.transactionDetails})`);
      return {
        text: 'Pago rechazado',
        class: 'bg-red-100 text-red-800'
      };
    }
    
    if (responseCode.raiz !== undefined && responseCode.raiz !== 0) {
      console.log(`❌ Transacción RECHAZADA (response_code=${responseCode.raiz})`);
      return {
        text: 'Pago rechazado',
        class: 'bg-red-100 text-red-800'
      };
    }
    
    // CASO 3: Campo isApproved (menos fiable, pero útil como respaldo)
    if (orderData.isApproved === true) {
      console.log('✅ Transacción marcada como aprobada por isApproved');
      return {
        text: 'Pago aprobado',
        class: 'bg-green-100 text-green-800'
      };
    }
    
    // CASO 4: Por último, usar paymentStatus
    console.log(`ℹ️ Usando paymentStatus: ${orderData.paymentStatus}`);
    switch(orderData.paymentStatus) {
      case 'completed': return { text: 'Pago completado', class: 'bg-green-100 text-green-800' };
      case 'pending': return { text: 'Pago en proceso', class: 'bg-yellow-100 text-yellow-800' };
      case 'failed': return { text: 'Pago rechazado', class: 'bg-red-100 text-red-800' };
      default: return { text: 'Estado desconocido', class: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando detalles del pedido...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col p-4">
        <p className="text-gray-600 mb-4 text-xl">No se pudo encontrar la información del pedido.</p>
        <div className="bg-gray-50 p-4 rounded-lg max-w-lg w-full mb-6">
          <h3 className="font-medium mb-2">Detalles de depuración:</h3>
          <p className="text-sm text-gray-500 mb-2">Parámetros recibidos:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mb-4">
            token_ws: {token_ws || 'no disponible'}{'\n'}
            TBK_ORDEN_COMPRA: {TBK_ORDEN_COMPRA || 'no disponible'}{'\n'}
            orderId: {orderId || 'no disponible'}
          </pre>
          <p className="text-sm text-gray-500 mb-2">Intentos de búsqueda realizados:</p>
          <ul className="list-disc pl-5 text-xs text-gray-600">
            {searchAttempts.map((attempt, index) => (
              <li key={index}>{attempt}</li>
            ))}
          </ul>
          
          {debugInfo?.errors?.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mt-4 mb-2">Errores encontrados:</p>
              <ul className="list-disc pl-5 text-xs text-red-600">
                {debugInfo.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </>
          )}
          
          {debugInfo?.confirmationResult && (
            <>
              <p className="text-sm text-gray-500 mt-4 mb-2">Respuesta de confirmación WebPay:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.confirmationResult, null, 2)}
              </pre>
            </>
          )}
          
          {debugInfo?.searchResults && (
            <>
              <p className="text-sm text-gray-500 mt-4 mb-2">Resultados de búsqueda:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.searchResults, null, 2)}
              </pre>
            </>
          )}
        </div>
        <Link 
          href="/catalogo" 
          className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }
  
  // Obtener información traducida del estado del pago
  const paymentStatusInfo = translatePaymentStatus(orderDetails);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        {paymentCompleted && (
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-md">
            <p className="text-green-700  text-center font-medium">
              ¡Su pago ha sido confirmado!
            </p>
          </div>
        )}
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mt-2">Gracias por tu compra. Aquí tienes los detalles de tu pedido:</p>
          
          {/* Información del pedido */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium">Pedido:</span> #{orderDetails.response_code || 
                orderDetails.authorization_code || 
                orderDetails.transactionDetails?.response_code || 
                orderDetails.id.slice(-6).toUpperCase()}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium">Fecha:</span> {formatDate(orderDetails.createdAt)}
            </div>
            
            {/* Mostrar el estado traducido */}
            <div className={`px-3 py-1 rounded-full font-medium ${paymentStatusInfo.class}`}>
              {paymentStatusInfo.text}
            </div>
          </div>
          
          {/* Información detallada del pago (para depuración) */}
          {orderDetails.transactionDetails && (
            <div className="mt-4 bg-gray-50 p-3 rounded text-left text-xs">
              
            </div>
          )}
        </div>

        {/* Información del cliente y dirección de envío */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Datos del cliente */}
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium text-gray-800 mb-2">Datos del Cliente</h3>
            {orderDetails.customer ? (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Nombre:</span> {`${orderDetails.customer.firstName || ''} ${orderDetails.customer.lastName || ''}`}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Email:</span> {orderDetails.customer.email || ''}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Teléfono:</span> {orderDetails.customer.phone || ''}
                </p>
                {orderDetails.customer.rut && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">RUT:</span> {orderDetails.customer.rut}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">Información del cliente no disponible</p>
            )}
          </div>
          
          {/* Dirección de envío */}
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium text-gray-800 mb-2">Dirección de Envío</h3>
            {orderDetails.customer && (
              <p className="text-sm text-gray-600">
                {orderDetails.customer.address || ''}<br />
                {orderDetails.customer.city && orderDetails.customer.region && 
                  `${orderDetails.customer.city}, ${orderDetails.customer.region}`}
              </p>
            )}
          </div>
        </div>

        {/* Resumen del pedido */}
        {orderDetails.cart && orderDetails.summary ? (
          <OrderSummary
            cart={orderDetails.cart}
            subtotal={orderDetails.summary.subtotal}
            shippingCost={orderDetails.summary.shipping}
            total={orderDetails.summary.total}
          />
        ) : (
          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-gray-600 text-center">No se pudo cargar el detalle del pedido</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="block w-full py-3 px-4 bg-emerald-600 text-white text-center rounded hover:bg-emerald-700 transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}