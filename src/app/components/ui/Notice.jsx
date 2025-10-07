"use client";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import BuyWspButton from "../../components/cart/BuyWspButton";

export default function PaymentNotice({ cart, shippingInfo, summary }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true); // Abrir automáticamente al montar
  }, []);

  if (!isOpen) return null;

  // Manejar clic en backdrop
  const handleBackdropClick = (e) => {
    if (e.target.id === "payment-notice-backdrop") {
      setIsOpen(false);
    }
  };

  return (
    <div
      id="payment-notice-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div className="bg-[#ebead6] text-gray-800 rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        {/* Botón de cerrar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <IoClose size={24} />
        </button>

        {/* Título y mensaje */}
        <h2 className=" text-center text-xl font-semibold mb-4">🌳 ¡Hola! 🌳</h2>
        <p className="mb-4 text-sm">
          Actualmente estamos realizando ajustes en la pasarela de pago Transbank. Por el momento no está operativa.
        </p>
        <p className="text-sm font-bold mb-6">
          Para realizar tu compra, rellena los datos del formulario y presiona el botón "Realizar compra por Whatsapp". 
        </p>
        <p className="text-center">¡Te atenderemos a la brevedad!</p>

        
      </div>
    </div>
  );
}
