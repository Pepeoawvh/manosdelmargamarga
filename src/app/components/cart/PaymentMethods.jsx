const PaymentMethods = ({ paymentMethod, setPaymentMethod }) => {
  return (
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
            className="h-4 w-4 text--600[#b4cf66] focus:ring-[#6b554b]"
          />
          <span className="ml-3 flex-grow">
            <span className="block font-medium">WebPay</span>
            <span className="block text-sm text-gray-500">Paga con tarjeta de crédito o débito</span>
          </span>
          <img src="/webpay-logo.png" alt="WebPay" className="h-8 ml-auto" />
        </label>
        {/* MercadoPago eliminado temporalmente */}
      </div>
    </div>
  );
};

export default PaymentMethods;