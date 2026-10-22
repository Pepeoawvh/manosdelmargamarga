import React, { useState } from 'react';

export default function ExternalSaleForm({ onSubmit, onCancel, existingProducts = [] }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    description: '',
    amount: '',
    paymentMethod: 'efectivo',
    status: 'FINALIZADO',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    hasCommission: true,
    items: [{ title: '', quantity: '1', price: '' }],
  });

  const computedTotal = formData.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const normalizedProducts = (Array.isArray(existingProducts) ? existingProducts : [])
    .map((product) => ({
      id: product?.id || '',
      title: String(product?.title || product?.name || '').trim(),
      price: Number(product?.price) || 0,
    }))
    .filter((product) => product.title);

  const productsByTitle = normalizedProducts.reduce((acc, product) => {
    const key = product.title.toLowerCase();
    if (!acc[key]) {
      acc[key] = product;
    }
    return acc;
  }, {});

  const uniqueProductTitles = Object.values(productsByTitle)
    .map((product) => product.title)
    .sort((a, b) => a.localeCompare(b, 'es'));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    if (name === 'amount') {
      // Solo permitir números y un punto decimal
      const validated = value.replace(/[^\d.]/g, '');
      // Asegurar que solo haya un punto decimal
      const parts = validated.split('.');
      const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : validated;
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const sanitizedItems = formData.items
      .map((item) => ({
        title: String(item.title || '').trim(),
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
      }))
      .filter((item) => item.title && item.quantity > 0 && item.price >= 0);
    
    // Convertir monto a número
    const dataToSubmit = {
      ...formData,
      items: sanitizedItems,
      amount: computedTotal > 0 ? computedTotal : parseFloat(formData.amount) || 0,
    };
    
    onSubmit(dataToSubmit);
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      if (field === 'quantity' || field === 'price') {
        const validated = value.replace(/[^\d.]/g, '');
        const parts = validated.split('.');
        nextItems[index] = {
          ...nextItems[index],
          [field]: parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : validated,
        };
      } else {
        nextItems[index] = { ...nextItems[index], [field]: value };

        if (field === 'title') {
          const matchedProduct = productsByTitle[String(value || '').trim().toLowerCase()];
          if (matchedProduct) {
            const currentPrice = Number(nextItems[index].price) || 0;
            if (currentPrice <= 0) {
              nextItems[index].price = String(matchedProduct.price || 0);
            }
          }
        }
      }
      return { ...prev, items: nextItems };
    });
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { title: '', quantity: '1', price: '' }],
    }));
  };

  const removeItemRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? [{ title: '', quantity: '1', price: '' }]
          : prev.items.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">Registrar Venta Externa</h3>
        <button 
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="customerName" className="block text-xs font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-xs font-medium text-gray-700 mb-1">
              Email cliente
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-xs font-medium text-gray-700 mb-1">
              Teléfono cliente
            </label>
            <input
              type="text"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
              placeholder="+56 9 ..."
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-xs font-medium text-gray-700 mb-1">
              Monto manual (opcional)
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
              placeholder="0"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Si agregas productos abajo, el total se calcula automáticamente.
            </p>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="paymentMethod" className="block text-xs font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
              Estado del pedido
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="EMPACADO S/ETIQ.">EMPACADO S/ETIQ.</option>
              <option value="EMP. CON ETIQUETA">EMP. CON ETIQUETA</option>
              <option value="ENVIADO">ENVIADO</option>
              <option value="ESPERANDO RETIRO">ESPERANDO RETIRO</option>
              <option value="RETIRADO POR CLIENTE">RETIRADO POR CLIENTE</option>
              <option value="FINALIZADO">FINALIZADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-start gap-2 p-2 border border-gray-200 bg-gray-50 rounded-sm">
              <input
                type="checkbox"
                name="hasCommission"
                checked={formData.hasCommission}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded-sm border-gray-300 text-slate-700 focus:ring-slate-500"
              />
              <span>
                <span className="block text-xs font-medium text-gray-800">Con comisión para desarrollador</span>
                <span className="block text-[11px] text-gray-600">Si está activo, esta venta externa se incluirá en el cálculo de comisión.</span>
              </span>
            </label>
          </div>
          
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Detalle del pedido
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="h-7 px-2 text-xs border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
              >
                + Agregar producto
              </button>
            </div>

            <div className="space-y-1.5">
              {formData.items.map((item, index) => (
                <div key={`item-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-1.5 border border-gray-200 rounded-sm p-1.5 bg-gray-50/30">
                  <div className="md:col-span-7">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      list={`product-suggestions-${index}`}
                      className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
                      placeholder="Nombre del producto"
                    />
                    <datalist id={`product-suggestions-${index}`}>
                      {uniqueProductTitles.map((title) => {
                        const product = productsByTitle[title.toLowerCase()];
                        return (
                          <option key={`${index}-${title}`} value={title}>
                            {product ? `$${(Number(product.price) || 0).toLocaleString('es-CL')}` : ''}
                          </option>
                        );
                      })}
                    </datalist>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
                      placeholder="Cant."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-300 rounded-sm text-sm"
                      placeholder="Precio unitario"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="h-8 px-2 text-xs border border-red-300 text-red-700 rounded-sm hover:bg-red-50"
                      aria-label={`Eliminar producto ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-0.5">
              <p className="text-[11px] text-gray-500">
                Busca un producto existente o escribe uno nuevo (texto libre).
              </p>
              <p className="text-[11px] text-amber-700">
                Este ingreso no descuenta stock automáticamente. El ajuste de inventario debe hacerse manualmente.
              </p>
            </div>

            <div className="mt-2 text-xs text-gray-700 font-semibold">
              Total calculado por productos: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(computedTotal || 0)}
            </div>
          </div>
          
          <div className="md:col-span-3">
            <label htmlFor="notes" className="block text-xs font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-sm text-sm"
              placeholder="Información adicional sobre la venta"
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end mt-3 space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-8 px-3 bg-slate-700 text-white rounded-sm text-xs font-medium hover:bg-slate-800"
          >
            Guardar Venta
          </button>
        </div>
      </form>
    </div>
  );
}