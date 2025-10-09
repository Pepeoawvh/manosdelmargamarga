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
import { firestoreDB } from "../../../lib/firebase/config";

const CheckOut = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRetry = searchParams.get("retry") === "true";

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

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Guardar info de envío en contexto para reintentos
      saveShippingInfo({ ...shippingInfo, lastPaymentMethod: "webpay" });

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
        // Redirigir a Webpay
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
      console.error("handleCheckout error:", err);
      setError(err.message || "Ocurrió un error durante el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <PaymentNotice />
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
          <div>
            <ShippingInfoForm
              shippingInfo={shippingInfo}
              setShippingInfo={setShippingInfo}
            />
            <div className="mt-4">
              <PaymentMethods
                paymentMethod={paymentMethod}
                setPaymentMethod={() => {}}
                onlyWebpay={false} // opcional, para deshabilitar selector
              />
            </div>
          </div>

          <div className="text-xs">
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
            />

            <div className="grid w-full justify-center space-y-4 mt-4 mb-4">
                          <Button
                type="button"
                className="w-full text-lg  bg-[#6e2779] hover:bg-[#a83cb9] py-3 items-center justify-center text-white rounded transition-colors"
                disabled={loading || cart.length === 0}
                onClick={handleCheckout}
              >
                {loading ? "Procesando..." : "Pagar con WebPay"}
              </Button>
              <BuyWspButton
                orderData={{ customer: shippingInfo, cart, summary: { subtotal, shippingCost, total } }}
                phoneNumber="56322121504"
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
