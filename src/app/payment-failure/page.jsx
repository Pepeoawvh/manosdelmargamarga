'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tbkToken = searchParams.get('TBK_TOKEN');
  const tbkOrdenCompra = searchParams.get('TBK_ORDEN_COMPRA');
  
  const handleRetryPayment = () => {
    // Redirige al checkout manteniendo los datos
    router.push('/checkout?retry=true');
  };

  // Registrar información de la transacción fallida para depuración
  useEffect(() => {
    console.log('Pago fallido:', { tbkToken, tbkOrdenCompra });
  }, [tbkToken, tbkOrdenCompra]);

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
            Lo sentimos, hubo un problema con tu pago. Puedes intentar nuevamente con otro método de pago.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleRetryPayment}
            className="block w-full py-2 px-4 bg-emerald-600 text-white text-center rounded hover:bg-emerald-700 transition-colors"
          >
            Intentar con otro método de pago
          </button>
          
          <Link
            href="/catalogo"
            className="block w-full py-2 px-4 bg-gray-200 text-gray-800 text-center rounded hover:bg-gray-300 transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>

        {tbkToken && (
          <p className="text-center text-xs text-gray-500 mt-4">
            ID de transacción: {tbkToken}
            {tbkOrdenCompra && <span> | Orden: {tbkOrdenCompra}</span>}
          </p>
        )}
      </div>
    </div>
  );
}