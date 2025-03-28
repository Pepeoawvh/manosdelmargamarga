'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import ShippingInfoForm from './ShippingInfoForm';
import OrderSummary from './OrderSummary';
import Button from '../../components/ui/Button';

const CheckOut = () => {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    notes: '',
  });

  const shippingCost = subtotal > 30000 ? 0 : 3990;
  const total = subtotal + shippingCost;

  const handleCheckout = async (paymentMethod) => {
    // Validar formulario
    if (!validateForm()) return;

    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        cart,
        customer: shippingInfo,
        summary: { subtotal, shipping: shippingCost, total },
        paymentMethod,
      };

      const response = await fetch(
        paymentMethod === 'mercadopago'
          ? '/api/mercadopago/create-transaction'
          : '/api/webpay/create-transaction',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Error al procesar la compra');

      if (paymentMethod === 'mercadopago') {
        setPreferenceId(result.preferenceId);
      } else if (result.url) {
        clearCart();
        window.location.href = result.url;
      } else {
        throw new Error('No se recibió una URL de redirección');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      setError(err.message || 'Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'region'];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        setError(`El campo ${field} es obligatorio`);
        return false;
      }
    }
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 md:p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Finalizar Compra</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna 1: Información de envío */}
          <ShippingInfoForm shippingInfo={shippingInfo} setShippingInfo={setShippingInfo} />

          {/* Columna 2: Resumen del pedido y botones de pago */}
          <div>
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
            />

            {/* Botones de pago */}
            <div className="space-y-4 mt-4">
              <Button
                type="button"
                className="w-full py-3 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={loading || cart.length === 0}
                onClick={() => handleCheckout('webpay')}
              >
                {loading ? 'Procesando...' : 'Pagar vía WebPay'}
              </Button>

             
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Al completar la compra, aceptas nuestros términos y condiciones y política de privacidad.
        </p>
      </form>
    </div>
  );
};

export default CheckOut;