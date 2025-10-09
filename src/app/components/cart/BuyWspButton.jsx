import React from "react";

const BuyWspButton = ({ orderData, phoneNumber }) => {
  const generateWhatsAppMessage = () => {
    const { customer, cart, summary } = orderData;

    let message = `Hola, quiero realizar un pedido:\n\n`;

    // Agregar detalles del cliente
    message += `Nombre: ${customer.firstName},${customer.lastName}\n`;
    message += `Teléfono: ${customer.phone}\n`;
    message += `Email: ${customer.email}\n`;
    message += `Dirección: ${customer.address}, ${customer.city}, ${customer.region}\n\n`;

    // Agregar detalles de los productos
    cart.forEach((item) => {
      message += `- ${item.title} (Cantidad: ${item.quantity}) - $${(item.price * item.quantity).toLocaleString("es-CL")}\n`;
    });

    // Agregar totales
    message += `\nSubtotal: $${summary.subtotal.toLocaleString("es-CL")}`;
    message += summary.shippingCost === 0
      ? `\nEnvío: Por pagar (Bluexpress)`
      : `\nEnvío: $${summary.shippingCost.toLocaleString("es-CL")}`;
    message += `\nTotal: $${summary.total.toLocaleString("es-CL")}\n\n`;

    message += `Por favor, envíenme los datos de transferencia para completar mi compra. ¡Gracias!`;

    return encodeURIComponent(message); // Codificar el mensaje para URL
  };

  const handleClick = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-sm text-shadow-md bg-[#9acb05] hover:bg-[#b4cf66] py-3 px-16 items-center justify-center text-white rounded transition-colors"
    >
      Pagar con Transferencia 
      </button>
  );
};

export default BuyWspButton;