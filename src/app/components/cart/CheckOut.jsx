'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import ShippingInfoForm from './ShippingInfoForm';
import OrderSummary from './OrderSummary';
import PaymentMethods from './PaymentMethods';
import Button from '../../components/ui/Button';
import BuyWspButton from './BuyWspButton'; // Importamos el botón de WhatsApp

// Importar funciones necesarias de Firebase Firestore
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../../lib/firebase/config';

const CheckOut = () => {
  const searchParams = useSearchParams();
  const isRetry = searchParams.get('retry') === 'true';

  const { 
    cart, 
    subtotal, 
    savedShippingInfo, 
    saveShippingInfo,
    startPaymentAttempt,
    cancelPaymentAttempt
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('webpay');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: 'Selecciona tu región',
    notes: '',
    shippingType: 'Por pagar todo Chile'
  });

  const shippingCost = subtotal > 5 ? 0 : 0;
  const total = subtotal + shippingCost;

  // Cargar datos guardados si hay un reintento de pago
  useEffect(() => {
    if (isRetry && savedShippingInfo) {
      setShippingInfo(savedShippingInfo);

      // Si es un reintento, sugerir el otro método de pago
      if (savedShippingInfo.lastPaymentMethod === 'webpay') {
        setPaymentMethod('mercadopago');
      } else if (savedShippingInfo.lastPaymentMethod === 'mercadopago') {
        setPaymentMethod('webpay');
      }

      // Mostrar mensaje para el usuario
      setMessage('Tus datos se han recuperado. Puedes intentar con otro método de pago.');
    }
  }, [isRetry, savedShippingInfo]);

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'region'];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        setError(`El campo ${getFieldName(field)} es obligatorio`);
        return false;
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError('El formato del email es inválido');
      return false;
    }

    // Validar teléfono (solo números)
    const phoneRegex = /^\d{9,12}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s+/g, ''))) {
      setError('El teléfono debe contener entre 9 y 12 dígitos');
      return false;
    }

    return true;
  };

  const getFieldName = (field) => {
    const fieldNames = {
      firstName: 'nombre',
      lastName: 'apellido',
      email: 'correo electrónico',
      phone: 'teléfono',
      address: 'dirección',
      city: 'ciudad',
      region: 'región'
    };

    return fieldNames[field] || field;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 md:p-6 border-b">
        <h1 className="text-md font-bold text-gray-800">Finalizar Compra</h1>
        {isRetry && (
          <p className="text-sm text-amber-600 mt-1">
            Estás realizando un nuevo intento de pago. Tus datos se han mantenido.
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <p className="text-blue-600 font-medium">{message}</p>
        </div>
      )}

      <form className="p-4 md:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Columna 1: Información de envío */}
          <div>
            <ShippingInfoForm shippingInfo={shippingInfo} setShippingInfo={setShippingInfo} />

            {/* Métodos de pago */}
            {/* <div className="mt-4">
              <PaymentMethods paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            </div> */}
          </div>

          {/* Columna 2: Resumen del pedido y botones de pago */}
          <div className='text-xs'>
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
            />

            {/* Botón de pago */}
            <div className="flex justify-center space-y-4 mt-4">
              {/* Botón de Transbank comentado temporalmente */}
              {/* <Button
                type="button"
                className="w-2/5 py-3 flex items-center justify-center bg-[#542e1d] text-white rounded hover:bg-[#542e1d] transition-colors"
                disabled={loading || cart.length === 0}
                onClick={handleCheckout}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  `Pagar con ${paymentMethod === 'webpay' ? 'WebPay' : 'MercadoPago'}`
                )}
              </Button> */}

              {/* Botón de WhatsApp */}
              <BuyWspButton
                orderData={{
                  customer: shippingInfo,
                  cart,
                  summary: { subtotal, shippingCost, total },
                }}
                phoneNumber="56322121504" // Número de WhatsApp de la empresa
              />
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