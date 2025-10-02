import React from "react";

const BuyWspButton = ({ orderData, phoneNumber }) => {
  const generateWhatsAppMessage = () => {
    const { customer, cart, summary } = orderData;

    let message = `Hola, quiero realizar un pedido:\n\n`;

    // Agregar detalles del cliente
    message += `Nombre: ${customer.name}\n`;
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
      className="px-4 py-2 bg-[#b4cf66] text-white rounded hover:bg-[#87a644] transition"
    >
      Realizar compra por WhatsApp
    </button>
  );
};

export default BuyWspButton;