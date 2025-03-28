'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestoreDB } from '../lib/firebase/config';

export default function PaymentPending() {
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Pago en proceso</h2>
          <p className="text-gray-600 mt-2">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
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
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-yellow-800 text-sm">
              <p className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                Importante
              </p>
              <p className="mt-1">
                Algunos métodos de pago pueden tardar hasta 48 horas en confirmarse. Te enviaremos un correo electrónico cuando se complete el proceso.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No se encontraron detalles del pedido.</p>
        )}
        
        <div className="mt-6 flex flex-col gap-3">
          <Link 
            href="/mis-pedidos"
            className="block w-full py-2 px-4 bg-emerald-600 text-white text-center rounded hover:bg-emerald-700 transition-colors"
          >
            Ver mis pedidos
          </Link>
          
          <Link 
            href="/catalogo"
            className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}