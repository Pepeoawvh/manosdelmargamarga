'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

export default function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState('processing');
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    // Recuperar datos de la transacción
    const token = searchParams.get('token_ws');
    const orderId = searchParams.get('orderId');
    
    // Recuperar la orden pendiente del localStorage
    const pendingOrderJSON = localStorage.getItem('pendingOrder');
    
    if (!token || !pendingOrderJSON) {
      setStatus('error');
      return;
    }
    
    const confirmPayment = async () => {
      try {
        const pendingOrder = JSON.parse(pendingOrderJSON);
        
        // Confirmar el pago con nuestro backend
        const response = await fetch('/api/payment-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token_ws: token,
            orderId: pendingOrder.orderId
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Error al confirmar el pago');
        }
        
        // Pago exitoso
        setStatus('success');
        setOrderDetails(pendingOrder);
        
        // Limpiar carrito y orden pendiente
        clearCart();
        localStorage.removeItem('pendingOrder');
        
      } catch (error) {
        console.error('Error al confirmar pago:', error);
        setStatus('error');
      }
    };
    
    confirmPayment();
  }, [searchParams, clearCart]);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {status === 'processing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Procesando tu pago</h2>
          <p className="text-gray-600">Por favor espera mientras confirmamos tu transacción...</p>
        </div>
      )}
      
      {status === 'success' && orderDetails && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-emerald-100 inline-block p-3 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Pago completado con éxito!</h2>
          <p className="text-gray-600 mb-6">
            Gracias por tu compra. Hemos recibido tu pago correctamente.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
            <p className="font-medium mb-1">Resumen de la compra:</p>
            <p><span className="text-gray-600">Número de orden:</span> #{orderDetails.orderId.substring(0, 8)}</p>
            <p><span className="text-gray-600">Productos:</span> {orderDetails.cart.length}</p>
            <p><span className="text-gray-600">Cliente:</span> {orderDetails.shippingInfo.firstName} {orderDetails.shippingInfo.lastName}</p>
            <p><span className="text-gray-600">Dirección:</span> {orderDetails.shippingInfo.address}, {orderDetails.shippingInfo.city}</p>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Te hemos enviado un correo electrónico con los detalles de tu pedido.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
              Volver a la tienda
            </Link>
            <Link href="/mis-pedidos" className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Ver mis pedidos
            </Link>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 inline-block p-3 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Hubo un problema con tu pago</h2>
          <p className="text-gray-600 mb-6">
            Tu transacción no pudo completarse. Por favor, intenta de nuevo o contacta con nuestro equipo de soporte.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/checkout" className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
              Intentar de nuevo
            </Link>
            <Link href="/" className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Volver a la tienda
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}