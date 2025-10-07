'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tbkToken = searchParams.get('TBK_TOKEN');
  const tbkOrdenCompra = searchParams.get('TBK_ORDEN_COMPRA');
  const retry = searchParams.get('retry');

  useEffect(() => {
    console.log('Pago cancelado o fallido:', { tbkToken, tbkOrdenCompra, retry });
  }, [tbkToken, tbkOrdenCompra, retry]);

  const handleRetryPayment = () => {
    router.push('/checkout?retry=true');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <XCircleIcon className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pago no completado
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          El proceso de pago fue cancelado o no autorizado. Puedes intentarlo nuevamente.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetryPayment}
            className="w-full py-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            Volver a intentar el pago
          </button>

          <Link
            href="/catalogo"
            className="w-full py-3 rounded border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>

        {(tbkToken || tbkOrdenCompra) && (
          <div className="mt-6 text-xs text-gray-500 border-t pt-3">
            {tbkToken && <p>ID de transacción: {tbkToken}</p>}
            {tbkOrdenCompra && <p>Orden: {tbkOrdenCompra}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
