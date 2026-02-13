'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, Suspense } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // webpay-return puede enviar motivo=cancelled | missing_or_invalid_token | exception
  const motivo = useMemo(() => searchParams.get('motivo') || '', [searchParams]);
  const buyOrder = useMemo(() => searchParams.get('buy_order') || '', [searchParams]);
  const retry = useMemo(() => searchParams.get('retry') || '', [searchParams]);

  useEffect(() => {
    console.log('Pago cancelado o fallido:', { motivo, buyOrder, retry });
  }, [motivo, buyOrder, retry]);

  const handleRetryPayment = () => {
    router.push('/checkout?retry=true');
  };

  const title = motivo === 'cancelled'
    ? 'Pago cancelado'
    : motivo === 'exception'
    ? 'Error inesperado'
    : 'Pago no completado';

  const subtitle =
    motivo === 'cancelled'
      ? 'El proceso fue cancelado desde la pasarela. Puedes intentarlo nuevamente.'
      : motivo === 'missing_or_invalid_token'
      ? 'No se recibió el comprobante de pago. Intenta nuevamente.'
      : 'No pudimos completar el pago. Reintenta en unos segundos.';

  return (
    <div className="min-h-screen bg-[#f5f3e6] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow border border-[#ece7d2] p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <FiAlertTriangle className="text-2xl text-amber-700" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[#3f4f1c] mb-2">
          {title}
        </h1>
        <p className="text-stone-700 text-sm mb-6">
          {subtitle}
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={handleRetryPayment}
            className="w-full py-3 rounded bg-[#5e8c30] hover:bg-[#4d7528] text-white font-medium transition-colors"
          >
            Volver a intentar el pago
          </button>

          <Link
            href="/catalogo"
            className="w-full py-3 rounded border border-[#ece7d2] bg-[#faf8ee] hover:bg-[#f3efdf] text-[#3f4f1c] font-medium transition-colors text-center"
          >
            Volver al catálogo
          </Link>
        </div>

        {(buyOrder || motivo) ? (
          <div className="mt-6 text-xs text-stone-600 border-t border-[#ece7d2] pt-3 text-left">
            {buyOrder && <p><span className="font-medium">Orden:</span> {buyOrder}</p>}
            {motivo && <p><span className="font-medium">Motivo:</span> {motivo}</p>}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f3e6] flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Cargando...</div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
