'use client';
import Link from 'next/link';

export default function PaymentPending() {
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