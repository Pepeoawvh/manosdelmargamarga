const OrderSummary = ({ cart, subtotal, shippingCost, total }) => {
  // Formateador robusto CLP
  const fmtMoney = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(0);
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  };

  const safeNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeCart = Array.isArray(cart) ? cart : [];
  const subtotalN = safeNumber(subtotal);
  const shippingN = safeNumber(shippingCost);
  const totalN = safeNumber(total);

  if (!safeCart.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-600 text-center">No hay productos en el pedido.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
      <div className="bg-gray-50 rounded-lg p-4 mb-2">
      <h3 className="text:sm font-semibold mb-4">Productos:</h3>
        {safeCart.map((item) => {
          const price = safeNumber(item?.price);
          const qty = safeNumber(item?.quantity, 1);
          const lineTotal = price * qty;
          return (
            <div key={item?.id ?? `${item?.title}-${Math.random()}`} className="flex justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{item?.title ?? 'Producto'}</p>
                <p className="text-sm text-gray-500">Cantidad: {qty}</p>
              </div>
              <p className="font-medium">{fmtMoney(lineTotal)}</p>
            </div>
          );
        })}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between mb-4 text-sm">
            <span>Subtotal:</span>
            <span>{fmtMoney(subtotalN)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Envío:</span>
            <span className="flex items-center px-4">
              {shippingN === 0 ? (
                <span className="text-[#467302] mx-24 border rounded p-4 mb-8 font-medium">
                  ¡Tu pedido será enviado en servicio regular Bluexpress Por pagar al domicilio ingresado. Si necesitas que tu pedido incluya costo de envio contactanos con el boton de whatsapp y te atenderemos inmediatamente!
                </span>
              ) : (
                fmtMoney(shippingN)
              )}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Total</span>
            <span>{fmtMoney(totalN)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
