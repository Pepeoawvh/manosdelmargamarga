const OrderSummary = ({ cart, subtotal, shippingCost, total }) => {
  if (!cart || cart.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-600 text-center">No hay productos en el pedido.</p>
      </div>
    );
  }

  return (
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
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Envío:</span>
            <span className="flex items-center px-4">
              {shippingCost === 0 ? (
                <span className="text-amber-600 font-medium">¡Tu pedido será enviado en servicio regular Bluexpress Por pagar al domicilio ingresado. Si necesitas que tu pedido incluya costo de envio contactanos con el boton de whatsapp y te atenderemos inmediatamente!</span>
              ) : (
                `$${shippingCost.toLocaleString()}`
              )}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;