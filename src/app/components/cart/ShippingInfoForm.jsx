import Input from '../../components/ui/Input';

const ShippingInfoForm = ({ shippingInfo, setShippingInfo }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Información de envío</h2>
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              name="firstName"
              value={shippingInfo.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Apellido *"
              name="lastName"
              value={shippingInfo.lastName}
              onChange={handleInputChange}
              required
            />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label="Email *"
              name="email"
              type="email"
              value={shippingInfo.email}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Teléfono *"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleInputChange}
              required
            />
        </div>
        <Input
          label="Dirección *"
          name="address"
          value={shippingInfo.address}
          onChange={handleInputChange}
          required
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label="Ciudad *"
              name="city"
              value={shippingInfo.city}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Región *"
              name="region"
              value={shippingInfo.region}
              onChange={handleInputChange}
              required
            />
        </div>
        <div>
          <label htmlFor="shippingType" className="block text-sm font-medium text-gray-700">
            Tipo de envío *
          </label>
          <select
            id="shippingType"
            name="shippingType"
            value={shippingInfo.shippingType || 'Por pagar todo Chile'}
            onChange={handleInputChange}
            className="block w-full mt-1 rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="Por pagar todo Chile">Por pagar todo Chile</option>
            {/* Aquí puedes agregar más opciones en el futuro */}
          </select>
        </div>
        <textarea
          name="notes"
          rows="1"
          value={shippingInfo.notes}
          onChange={handleInputChange}
          className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Notas adicionales"
        />
      </div>
    </div>
  );
};

export default ShippingInfoForm;