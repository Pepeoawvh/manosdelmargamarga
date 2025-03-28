'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CheckOut = () => {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('webpay');
  
  // Estado para formulario de envío
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    notes: ''
  });

  // Calculamos el envío y el total (ejemplo)
  const shippingCost = subtotal > 30000 ? 0 : 3990;
  const total = subtotal + shippingCost;

  // Manejador para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'region'];
    
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        setError(`Por favor, completa el campo: ${getFieldLabel(field)}`);
        return false;
      }
    }
    
    // Validar email
    if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      setError('Por favor, introduce un email válido');
      return false;
    }
    
    return true;
  };

  // Función para obtener el nombre visible de un campo
  const getFieldLabel = (field) => {
    const labels = {
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Email',
      phone: 'Teléfono',
      address: 'Dirección',
      city: 'Ciudad',
      region: 'Región',
      postalCode: 'Código Postal',
      notes: 'Notas adicionales'
    };
    return labels[field] || field;
  };

  // Manejador para el proceso de checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Validar que haya productos en el carrito
    if (cart.length === 0) {
      setError('No hay productos en el carrito');
      return;
    }
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Preparar los datos para el API
      const orderData = {
        cart: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        customer: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          region: shippingInfo.region,
          postalCode: shippingInfo.postalCode,
          notes: shippingInfo.notes
        },
        summary: {
          subtotal,
          shipping: shippingCost,
          total
        },
        paymentMethod
      };
      
      // Llamada al API para crear la transacción
      const response = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la orden');
      }
      
      // Guardar la orden en localStorage antes de redirigir
      localStorage.setItem('pendingOrder', JSON.stringify({
        orderId: data.orderId,
        cart,
        shippingInfo,
        total
      }));
      
      // Redireccionar según el método de pago
      if (data.url) {
        // Redirección a la pasarela de pago (WebPay o MercadoPago)
        window.location.href = data.url;
        return;
      }
      
      // Si es otro método o pago exitoso directo
      clearCart();
      router.push(`/order-confirmation?id=${data.orderId}`);
      
    } catch (err) {
      console.error('Error en el checkout:', err);
      setError(err.message || 'Ocurrió un error al procesar tu orden');
    } finally {
      setLoading(false);
    }
  };

  // Componentes de la página
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
      
      <form onSubmit={handleCheckout} className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna de información del cliente */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Información de envío</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <Input
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Región *
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={shippingInfo.region}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Selecciona una región</option>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Metropolitana">Metropolitana</option>
                    <option value="Coquimbo">Coquimbo</option>
                    <option value="Biobío">Biobío</option>
                    <option value="La Araucanía">La Araucanía</option>
                    <option value="Arica y Parinacota">Arica y Parinacota</option>
                    <option value="Tarapacá">Tarapacá</option>
                    <option value="Antofagasta">Antofagasta</option>
                    <option value="Atacama">Atacama</option>
                    <option value="Libertador B. O'Higgins">Libertador B. O'Higgins</option>
                    <option value="Maule">Maule</option>
                    <option value="Ñuble">Ñuble</option>
                    <option value="Los Ríos">Los Ríos</option>
                    <option value="Los Lagos">Los Lagos</option>
                    <option value="Aysén">Aysén</option>
                    <option value="Magallanes">Magallanes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={shippingInfo.notes}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Instrucciones especiales para la entrega"
                />
              </div>
            </div>
          </div>
          
          {/* Columna de resumen del pedido */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>
                    {shippingCost === 0 ? 
                      <span className="text-emerald-600 font-medium">¡Gratis!</span> : 
                      `$${shippingCost.toLocaleString()}`
                    }
                  </span>
                </div>
                
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-base font-medium mb-3">Método de pago</h3>
              
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-md bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="webpay"
                    checked={paymentMethod === 'webpay'}
                    onChange={() => setPaymentMethod('webpay')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-3 flex-grow">
                    <span className="block font-medium">WebPay</span>
                    <span className="block text-sm text-gray-500">Paga con tarjeta de crédito o débito</span>
                  </span>
                  <img src="/images/payment/webpay-logo.png" alt="WebPay" className="h-8 ml-auto" />
                </label>
                
                <label className="flex items-center p-3 border rounded-md bg-white cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mercadopago"
                    checked={paymentMethod === 'mercadopago'}
                    onChange={() => setPaymentMethod('mercadopago')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-3 flex-grow">
                    <span className="block font-medium">MercadoPago</span>
                    <span className="block text-sm text-gray-500">Múltiples opciones de pago</span>
                  </span>
                  <img src="/images/payment/mercadopago-logo.png" alt="MercadoPago" className="h-8 ml-auto" />
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full py-3 flex items-center justify-center"
              disabled={loading || cart.length === 0}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                `Pagar $${total.toLocaleString()}`
              )}
            </Button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Al completar la compra, aceptas nuestros términos y condiciones y política de privacidad.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckOut;