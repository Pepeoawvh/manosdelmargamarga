'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  where,
  getDoc 
} from 'firebase/firestore';
import { db as firestoreDB } from '../../../lib/firebase/config';

export default function useOrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });
// Función para generar número de pedido interno secuencial
const generateOrderNumber = async (status) => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
    const year = today.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
    
    // Prefijo según el estado del pedido
    let prefix = 'P'; // P para pendiente por defecto
    if (status === 'completed' || status === true) {
      prefix = 'A'; // A para aceptado
    } else if (status === 'failed' || status === false) {
      prefix = 'R'; // R para rechazado
    }
    
    // Consultar Firestore para obtener el último número de este tipo en el mes actual
    const ordersRef = collection(firestoreDB, 'orders');
    const q = query(
      ordersRef,
      where('orderNumberPrefix', '==', prefix),
      where('orderNumberMonth', '==', month),
      where('orderNumberYear', '==', year),
      orderBy('orderNumberSequential', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    // Determinar el número secuencial
    let sequential = 1;
    if (!snapshot.empty) {
      const lastOrder = snapshot.docs[0].data();
      sequential = (lastOrder.orderNumberSequential || 0) + 1;
    }
    
    // Formatear el número secuencial con ceros a la izquierda
    const sequentialStr = String(sequential).padStart(3, '0');
    
    // Construir el número de pedido completo
    const orderNumber = `${prefix}${sequentialStr}${month}${year}`;
    
    return {
      orderNumber,
      orderNumberPrefix: prefix,
      orderNumberSequential: sequential,
      orderNumberMonth: month,
      orderNumberYear: year
    };
  } catch (error) {
    console.error('Error al generar número de pedido:', error);
    return {
      orderNumber: `ERROR-${Date.now()}`,
      orderNumberPrefix: 'ERR',
      orderNumberSequential: 0,
      orderNumberMonth: '00',
      orderNumberYear: '00'
    };
  }
};
  // Función para cargar pedidos
  const fetchOrders = useCallback(async (statusFilter = null) => {
    try {
      setLoading(true);
      const ordersRef = collection(firestoreDB, "orders");
      let q = query(ordersRef, orderBy("createdAt", "desc"));
      
      if (statusFilter) {
        q = query(ordersRef, where("status", "==", statusFilter), orderBy("createdAt", "desc"));
      }
      
      const querySnapshot = await getDocs(q);
      
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Procesar los datos para un formato más fácil de usar
        const customer = data.customer || {};
        
        // Normalizar estructura de items - buscar en múltiples ubicaciones posibles
        let items = [];
        if (Array.isArray(data.cart) && data.cart.length > 0) {
          items = data.cart;
        } else if (Array.isArray(data.items) && data.items.length > 0) {
          items = data.items;
        } else if (Array.isArray(data.products) && data.products.length > 0) {
          items = data.products;
        } else if (data.rawData && Array.isArray(data.rawData.cart) && data.rawData.cart.length > 0) {
          items = data.rawData.cart;
        } else {
          console.log("No se encontraron productos en la orden:", doc.id);
          items = [];
        }
        
        // Extraer datos específicos de WebPay para mejor interpretación
        const webpay = {
          responseCode: {
            root: data.response_code,
            transactionDetails: data.transactionDetails?.response_code
          },
          status: {
            root: data.status_webpay,
            transactionDetails: data.transactionDetails?.status
          },
          isApproved: data.isApproved || false
        };
        
        // Determinar el estado real de pago según WebPay (más preciso)
        const paymentInfo = interpretPaymentStatus(webpay, data.paymentStatus);
        
        return {
          id: doc.id,
          orderId: data.id || doc.id,
          date: data.createdAt?.toDate() || new Date(),
          customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Cliente sin nombre',
          customerEmail: customer.email || data.customerEmail || 'No disponible',
          customerPhone: customer.phone || data.customerPhone || 'No disponible',
          total: data.summary?.total || parseFloat(data.amount || 0) || 0,
          status: data.status || 'PENDIENTE',
          paymentStatus: data.paymentStatus || 'pending',
          isApproved: data.isApproved || false,
          items: items,
          customer: customer,
          summary: data.summary || {},
          shippingMethod: customer.shippingType || data.shippingMethod || 'No especificado',
          payment_type_code: data.payment_type_code || data.transactionDetails?.payment_type_code,
          authorization_code: data.authorization_code || data.transactionDetails?.authorization_code,
          transaction_date: data.transaction_date || data.transactionDetails?.transaction_date,
          webpay: webpay,
          paymentInfo: paymentInfo,
          transactionDetails: data.transactionDetails || {},
          rawData: data
        };
      });
      
      setOrders(ordersData);
      console.log("Órdenes cargadas:", ordersData);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      setError("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Función para interpretar el estado del pago según WebPay
  const interpretPaymentStatus = (webpay, paymentStatus) => {
    // Primero verificar por datos WebPay que son más precisos
    if (webpay.responseCode.transactionDetails === 0 && webpay.status.transactionDetails === 'AUTHORIZED') {
      return {
        status: 'completed',
        text: 'Pago aprobado (WebPay)',
        class: 'bg-green-100 text-green-800',
        icon: '✓'
      };
    }
    
    if (webpay.responseCode.root === 0 && webpay.status.root === 'AUTHORIZED') {
      return {
        status: 'completed',
        text: 'Pago aprobado (WebPay)',
        class: 'bg-green-100 text-green-800',
        icon: '✓'
      };
    }
    
    // Si hay código de respuesta pero no es 0, fue rechazado
    if (webpay.responseCode.transactionDetails !== undefined && webpay.responseCode.transactionDetails !== 0) {
      return {
        status: 'failed',
        text: 'Pago rechazado (WebPay)',
        class: 'bg-red-100 text-red-800',
        icon: '✗'
      };
    }
    
    if (webpay.responseCode.root !== undefined && webpay.responseCode.root !== 0) {
      return {
        status: 'failed',
        text: 'Pago rechazado (WebPay)',
        class: 'bg-red-100 text-red-800', 
        icon: '✗'
      };
    }
    
    // Usar isApproved como respaldo
    if (webpay.isApproved === true) {
      return {
        status: 'completed',
        text: 'Pago aprobado',
        class: 'bg-green-100 text-green-800',
        icon: '✓'
      };
    }
    
    // Finalmente, usar paymentStatus como último recurso
    switch(paymentStatus) {
      case 'completed':
        return {
          status: 'completed',
          text: 'Pago completado',
          class: 'bg-green-100 text-green-800',
          icon: '✓'
        };
      case 'pending':
        return {
          status: 'pending',
          text: 'Pago pendiente',
          class: 'bg-yellow-100 text-yellow-800',
          icon: '⌛'
        };
      case 'failed':
        return {
          status: 'failed',
          text: 'Pago fallido',
          class: 'bg-red-100 text-red-800',
          icon: '✗'
        };
      default:
        return {
          status: 'unknown',
          text: 'Estado desconocido',
          class: 'bg-gray-100 text-gray-800',
          icon: '?'
        };
    }
  };
  
  // Efecto para cargar pedidos al montar el componente
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Función para actualizar el estado de un pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Actualizando pedido ${orderId} al estado ${newStatus}`);
      
      // Actualizar en Firestore
      const orderRef = doc(firestoreDB, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Actualizar en estado local
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      }));
      
      console.log(`Pedido ${orderId} actualizado correctamente`);
      return true;
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      setError(`Error al actualizar el estado del pedido: ${error.message}`);
      return false;
    }
  };

  // NUEVA FUNCIÓN: Completar información de transacción WebPay para un pedido
  const completeWebPayTransaction = async (orderId, token_ws) => {
    try {
      if (!token_ws) {
        throw new Error('Se requiere el token_ws para completar la transacción');
      }
      
      setLoading(true);
      
      // Llamar al endpoint para completar la transacción
      const response = await fetch('/api/webpay/complete-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, token_ws })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al completar la transacción');
      }
      
      const result = await response.json();
      
      // Recargar la orden específica
      const orderRef = doc(firestoreDB, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        // Actualizar solo esta orden en el estado
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId) {
            // Aplicar la misma lógica de conversión que en fetchOrders
            const webpay = {
              responseCode: {
                root: orderData.response_code,
                transactionDetails: orderData.transactionDetails?.response_code
              },
              status: {
                root: orderData.status_webpay,
                transactionDetails: orderData.transactionDetails?.status
              },
              isApproved: orderData.isApproved || false
            };
            
            const paymentInfo = interpretPaymentStatus(webpay, orderData.paymentStatus);
            
            return {
              ...order,
              paymentStatus: orderData.paymentStatus,
              isApproved: orderData.isApproved,
              transactionDetails: orderData.transactionDetails,
              response_code: orderData.response_code,
              status_webpay: orderData.status_webpay,
              webpay,
              paymentInfo,
              rawData: orderData
            };
          }
          return order;
        }));
      }
      
      console.log(`Transacción WebPay completada para orden ${orderId}`);
      return result;
    } catch (error) {
      console.error("Error al completar transacción WebPay:", error);
      setError(`Error al completar la transacción: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para solicitar ordenamiento
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Ordenar los pedidos según configuración
  const sortedOrders = [...orders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Funciones de utilidad para mostrar estados
  const getPaymentStatusClass = (order) => {
    // Usar el paymentInfo calculado en base a WebPay si está disponible
    if (order.paymentInfo) {
      return order.paymentInfo.class;
    }
    
    // Fallback al método anterior
    return order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getPaymentStatusText = (order) => {
    // Usar el paymentInfo calculado en base a WebPay si está disponible
    if (order.paymentInfo) {
      return order.paymentInfo.text;
    }
    
    // Fallback al método anterior
    return order.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente';
  };

  const getPaymentTypeText = (order) => {
    // Determinar y mostrar el tipo de pago de forma legible
    const paymentType = order.payment_type_code || order.transactionDetails?.payment_type_code;
    
    if (!paymentType) return 'No disponible';
    
    switch(paymentType) {
      case 'VD': return 'Débito';
      case 'VP': return 'Prepago';
      case 'VN': return 'Crédito';
      case 'VC': return 'Crédito en cuotas';
      case 'SI': return '3 cuotas sin interés';
      case 'S2': return '2 cuotas sin interés';
      case 'NC': return 'N cuotas sin interés';
      default: return paymentType;
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'EMPACADO S/ETIQ.': 'bg-blue-100 text-blue-800',
      'EMP. CON ETIQUETA': 'bg-indigo-100 text-indigo-800',
      'ENVIADO': 'bg-purple-100 text-purple-800',
      'FINALIZADO': 'bg-green-100 text-green-800',
      'ESPERANDO RETIRO': 'bg-orange-100 text-orange-800',
      'RETIRADO POR CLIENTE': 'bg-green-100 text-green-800',
      'RESERVADO': 'bg-pink-100 text-pink-800',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    orders: sortedOrders,
    loading,
    error,
    updateOrderStatus,
    requestSort,
    getPaymentStatusClass,
    getPaymentStatusText,
    getPaymentTypeText,
    getStatusClass,
    formatDate,
    fetchOrders,
    completeWebPayTransaction,  // Nueva función
    interpretPaymentStatus      // Exportar para uso directo si se necesita
  };
}