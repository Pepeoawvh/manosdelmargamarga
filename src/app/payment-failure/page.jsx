'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestoreDB } from '../lib/firebase/config';

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Obtener detalles del pedido
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        const ordersRef = collection(firestoreDB, 'orders');
        const q = query(ordersRef, where('id', '==', orderId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setOrderDetails({
            id: orderId,
            ...querySnapshot.docs[0].data()
          });
        }
      } catch (error) {
        console.error('Error al obtener detalles del pedido:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Pago no completado</h2>
          <p className="text-gray-600 mt-2">
            Lo sentimos, hubo un problema con tu pago.
          </p>
        </div>
        
        {loading ? (
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ) : orderDetails ? (
          <div className="bg-gray-50 rounded p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Número de pedido:</span> {orderDetails.id}
            </p>
            {orderDetails.customer && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Nombre:</span> {orderDetails.customer.name}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">No se encontraron detalles del pedido.</p>
        )}
        
        <div className="mt-6 flex flex-col gap-3">
          <Link 
            href={`/checkout?orderId=${orderId}`}
            className="block w-full py-2 px-4 bg-emerald-600 text-white text-center rounded hover:bg-emerald-700 transition-colors"
          >
            Intentar pago nuevamente
          </Link>
          
          <Link 
            href="/catalogo"
            className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}