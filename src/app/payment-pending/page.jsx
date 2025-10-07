'use client';
import Link from 'next/link';

export default function PaymentPending() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Pago en proceso
          </h2>
          <p className="text-gray-600 mt-2 leading-relaxed">
            Tu pago está siendo procesado por la pasarela. Esto puede tardar unos
            segundos. Te notificaremos cuando se confirme.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="w-full py-2.5 px-4 bg-[#e9e8da] hover:bg-[#e2e1cf] text-gray-800 font-medium rounded-md transition-colors text-sm"
          >
            Volver al catálogo
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 px-4 text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Ir al inicio
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Si tu pago no se confirma en unos minutos, podrás intentar nuevamente.
        </p>
      </div>
    </div>
  );
}
