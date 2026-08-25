"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import ShippingInfoForm from "./ShippingInfoForm";
import OrderSummary from "./OrderSummary";
import PaymentMethods from "./PaymentMethods";
import Button from "../../components/ui/Button";
import BuyWspButton from "./BuyWspButton";
import PaymentNotice from "../ui/Notice";
import Link from "next/link";

const CheckOut = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRetry = searchParams.get("retry") === "true";
  const isReservation = searchParams.get("type") === "reservation";

  const {
    cart,
    subtotal,
    savedShippingInfo,
    saveShippingInfo,
    startPaymentAttempt,
    cancelPaymentAttempt,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [paymentMethod] = useState("webpay"); // Siempre Webpay
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "Selecciona tu región",
    notes: "",
    shippingType: "Por pagar todo Chile",
  });

  const shippingCost = subtotal > 5 ? 0 : 0;
  const total = subtotal + shippingCost;

  // Cargar datos guardados si hay un reintento de pago
  useEffect(() => {
    if (isRetry && savedShippingInfo) {
      setShippingInfo(savedShippingInfo);
      setMessage("Tus datos se han recuperado. Puedes intentar nuevamente el pago.");
    }
  }, [isRetry, savedShippingInfo]);

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "region",
    ];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        setError(`El campo ${getFieldName(field)} es obligatorio`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError("El formato del email es inválido");
      return false;
    }

    const phoneRegex = /^\d{9,12}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s+/g, ""))) {
      setError("El teléfono debe contener entre 9 y 12 dígitos");
      return false;
    }

    return true;
  };

  const getFieldName = (field) => {
    const fieldNames = {
      firstName: "nombre",
      lastName: "apellido",
      email: "correo electrónico",
      phone: "teléfono",
      address: "dirección",
      city: "ciudad",
      region: "región",
    };
    return fieldNames[field] || field;
  };

  // Validación de stock previa al pago
  const validateStock = () => {
    if (!Array.isArray(cart) || cart.length === 0) return { ok: false, msg: "El carrito está vacío." };

    for (const it of cart) {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const stock = Number(it.stock ?? 0);
      if (!Number.isFinite(stock) || stock < 0) {
        return { ok: false, msg: `El producto "${it.title}" no tiene stock disponible.` };
      }
      if (qty > stock) {
        return {
          ok: false,
          msg: `La cantidad de "${it.title}" (${qty}) excede el stock disponible (${stock}).`,
        };
      }
    }
    return { ok: true };
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Chequeo de stock antes de iniciar la transacción
    const stockCheck = validateStock();
    if (!stockCheck.ok) {
      setError(stockCheck.msg);
      setLoading(false);
      return;
    }

    try {
      // Guardar info de envío en contexto para reintentos
      saveShippingInfo({ ...shippingInfo, lastPaymentMethod: "webpay" });

      // Marcar intento de pago (UX y diagnóstico)
      try {
        startPaymentAttempt?.(shippingInfo); // se pasa la info si el contexto la usa
        localStorage.setItem("lastPaymentAttempt", Date.now().toString());
      } catch {}

      // Llamar a la API
      const res = await fetch("/api/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customer: shippingInfo,
          summary: { subtotal, shippingCost, total },
          paymentMethod: "webpay",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar el pago");
      }

      if (data.url && data.token) {
        // UX: muestra feedback mientras se redirige
        setMessage("Redirigiendo a Webpay...");
        // Redirigir a Webpay con form POST
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.url;

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "token_ws";
        input.value = data.token;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error durante el pago");
      try {
        cancelPaymentAttempt?.();
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la reserva
  const handleReserveCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!validateForm()) {
        setLoading(false);
        return;
      }

      if (cart.length === 0) {
        setError("Tu carrito está vacío");
        setLoading(false);
        return;
      }

      // Guardar info de envío
      saveShippingInfo(shippingInfo);

      // Crear arreglo de reservas para cada producto en el carrito
      const reservationItems = cart.map(item => ({
        productId: item.id,
        productTitle: item.title,
        productPrice: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      // Enviar solicitud de reserva del carrito
      const res = await fetch("/api/create-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reservationItems,
          customer: shippingInfo,
          cartTotal: subtotal,
          timestamp: Date.now(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar la reserva");
      }

      // Mostrar confirmación de éxito
      setReservationSuccess(true);
      setReservationId(data.reservationId);
      setMessage("");
      setError(null);
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* <PaymentNotice /> */}
      <div className="p-4 md:p-6 border-b border-[#c4de86]">
        <h1 className="text-md font-bold text-gray-800">
          {isReservation ? "Formulario de Reserva" : "Finalizar Compra"}
        </h1>
        {isRetry && (
          <p className="text-sm text-amber-600 mt-1">
            Estás realizando un nuevo intento de pago. Tus datos se han mantenido.
          </p>
        )}
        {isReservation && (
          <p className="text-sm text-blue-600 mt-1">
            Completa el formulario para reservar los productos en tu carrito. Nos contactaremos pronto.
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

      {/* Mostrar confirmación de reserva exitosa */}
      {reservationSuccess && isReservation ? (
        <div className="p-8 text-center">
          <div className="mb-6">
            <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Registrada!</h2>
          <p className="text-gray-600 mb-4">
            Tu solicitud de reserva ha sido registrada correctamente.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Número de reserva: <span className="font-mono font-semibold">{reservationId}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Nos contactaremos pronto a través del email <span className="font-semibold">{shippingInfo.email}</span> o por Whatsapp al <span className="font-semibold">{shippingInfo.phone}</span> para confirmar tu reserva.
          </p>
          <Link href="/catalogo" className="inline-block px-6 py-2 bg-[#5e8c30] text-white rounded hover:bg-[#4a7326] transition-all">
            Volver al catálogo
          </Link>
        </div>
      ) : (
        <form className="p-4 md:p-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <ShippingInfoForm
                shippingInfo={shippingInfo}
                setShippingInfo={setShippingInfo}
              />
              {!isReservation && (
                <div className="mt-4">
                  <PaymentMethods
                    paymentMethod={paymentMethod}
                    setPaymentMethod={() => {}}
                    onlyWebpay={false}
                  />
                </div>
              )}
            </div>

            <div className="text-xs">
              {/* Condicional para OrderSummary: solo mostrar si NO es reserva */}
              {!isReservation && (
                <OrderSummary
                  cart={cart}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  total={total}
                />
              )}

              <div className="grid w-full justify-center space-y-4 mt-4">
                {!isReservation ? (
                  <>
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      Al realizar esta compra, aceptas nuestros{" "}
                      <Link href="/terminosycondiciones" className="underline hover:text-gray-700">
                        Términos y Condiciones
                      </Link>. Conforme al Art. 3° bis de la Ley N° 19.496, manifestamos expresamente que no nos adherimos al Derecho a Retracto en compras a distancia. Tampoco aplica el retracto para productos elaborados a pedido o personalizados.
                    </p>
                    <Button
                      type="button"
                      className="w-full bg-[#5e8c30] hover:bg-[#4d7528] py-3 items-center justify-center text-white rounded"
                      disabled={loading || cart.length === 0}
                      onClick={handleCheckout}
                    >
                      {loading ? "Redirigiendo..." : "Pagar con Webpay"}
                    </Button>

                    <BuyWspButton
                      orderData={{
                        customer: shippingInfo,
                        cart,
                        summary: { subtotal, shippingCost, total },
                      }}
                      phoneNumber="56322121504"
                    />
                  </>
                ) : (
                  <Button
                    type="button"
                    className="w-full bg-[#5e8c30] hover:bg-[#4a7326] py-3 items-center justify-center text-white rounded"
                    disabled={loading || cart.length === 0}
                    onClick={handleReserveCart}
                  >
                    {loading ? "Procesando reserva..." : "Confirmar Reserva"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {reservationSuccess && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Tu reserva ha sido registrada exitosamente. Te contactaremos pronto.
            </p>
          )}
          
          {!reservationSuccess && !isReservation && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Al completar la compra, aceptas nuestros <Link href="/terminosycondiciones">Términos y Condiciones</Link> y política de
              privacidad.
            </p>
          )}
          
          {!reservationSuccess && isReservation && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Al confirmar la reserva, aceptas que te contactemos por medio de Correo electrónico o Whatsapp para coordinar los detalles de tu reserva.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default CheckOut;