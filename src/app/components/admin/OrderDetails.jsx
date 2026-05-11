"use client";
import React, { useState, useEffect } from "react";
import {
  FaCopy,
  FaCheck,
  FaWhatsapp,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const OrderDetails = ({
  order,
  updateOrderStatus,
  getStatusClass,
  formatAddress,
  orderStatuses,
  assignOrderNumber,
  updateExternalOrderDetails,
}) => {
  const [copiedText, setCopiedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status || "PENDIENTE");

  // Estados para edición del número de orden
  const [isEditingOrderNumber, setIsEditingOrderNumber] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState(order.orderNumber || "");
  
  // Estado para controlar el error de la función no disponible
  const [assignOrderNumberAvailable, setAssignOrderNumberAvailable] = useState(false);
  const isExternalOrder = order?.sourceType === "external";

  const getOrderItems = (orderData) => {
    if (Array.isArray(orderData?.items) && orderData.items.length) return orderData.items;
    if (Array.isArray(orderData?.cart) && orderData.cart.length) return orderData.cart;
    if (Array.isArray(orderData?.products) && orderData.products.length) return orderData.products;
    return [];
  };

  const [isEditingExternalDetails, setIsEditingExternalDetails] = useState(false);
  const [externalDetailForm, setExternalDetailForm] = useState({
    customerName: order?.customerName || "",
    customerEmail: order?.customerEmail || "",
    customerPhone: order?.customer?.phone || "",
    paymentMethod: order?.paymentMethod || "efectivo",
    description: order?.description || "",
    notes: order?.customer?.notes || order?.notes || "",
    amount: order?.total || 0,
    items: getOrderItems(order).map((item) => ({
      title: item?.title || item?.name || "",
      quantity: String(Number(item?.quantity) || 1),
      price: String(Number(item?.price) || 0),
    })),
  });

  // Verificar si la prop assignOrderNumber está disponible
  useEffect(() => {
    if (typeof assignOrderNumber !== 'function') {
      setAssignOrderNumberAvailable(false);
    } else {
      setAssignOrderNumberAvailable(true);
    }
  }, [assignOrderNumber]);

  useEffect(() => {
    setExternalDetailForm({
      customerName: order?.customerName || "",
      customerEmail: order?.customerEmail || "",
      customerPhone: order?.customer?.phone || "",
      paymentMethod: order?.paymentMethod || "efectivo",
      description: order?.description || "",
      notes: order?.customer?.notes || order?.notes || "",
      amount: order?.total || 0,
      items: getOrderItems(order).map((item) => ({
        title: item?.title || item?.name || "",
        quantity: String(Number(item?.quantity) || 1),
        price: String(Number(item?.price) || 0),
      })),
    });
    setIsEditingExternalDetails(false);
  }, [order?.id]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedText(field);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Actualización del estado del pedido
  const handleStatusUpdate = async () => {
    if (!updateOrderStatus || newStatus === order.status) return;

    setIsProcessing(true);
    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (error) {
      alert("No se pudo actualizar el estado del pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderNumberUpdate = async () => {
    if (!assignOrderNumberAvailable) {
      alert("Error: No se puede actualizar el número de orden. La función no está disponible.");
      return;
    }
    
    if (!newOrderNumber.trim()) {
      alert("Por favor ingresa un número de orden válido");
      return;
    }
    
    setIsProcessing(true);
    try {
      const success = await assignOrderNumber(order.id, newOrderNumber.trim());
      
      if (success) {
        setIsEditingOrderNumber(false);
        alert("Número de orden actualizado correctamente");
      } else {
        alert("No se pudo asignar el número de orden");
      }
    } catch (error) {
      alert(`Error al asignar número de orden: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatear el precio para mostrar
  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString("es-CL")}` : "$0";
  };

  const orderItems = getOrderItems(order);

  const computedExternalTotal = externalDetailForm.items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + quantity * price;
  }, 0);

  const handleExternalFieldChange = (name, value) => {
    setExternalDetailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExternalItemChange = (index, field, value) => {
    setExternalDetailForm((prev) => {
      const items = [...prev.items];
      if (field === "quantity" || field === "price") {
        const validated = value.replace(/[^\d.]/g, "");
        const parts = validated.split(".");
        items[index] = {
          ...items[index],
          [field]: parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : validated,
        };
      } else {
        items[index] = { ...items[index], [field]: value };
      }
      return { ...prev, items };
    });
  };

  const addExternalItemRow = () => {
    setExternalDetailForm((prev) => ({
      ...prev,
      items: [...prev.items, { title: "", quantity: "1", price: "" }],
    }));
  };

  const removeExternalItemRow = (index) => {
    setExternalDetailForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? [{ title: "", quantity: "1", price: "" }]
          : prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSaveExternalDetails = async () => {
    if (typeof updateExternalOrderDetails !== "function") {
      alert("No está disponible la actualización de ventas externas");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        customerName: externalDetailForm.customerName,
        customerEmail: externalDetailForm.customerEmail,
        customerPhone: externalDetailForm.customerPhone,
        paymentMethod: externalDetailForm.paymentMethod,
        description: externalDetailForm.description,
        notes: externalDetailForm.notes,
        amount: computedExternalTotal > 0 ? computedExternalTotal : Number(externalDetailForm.amount),
        items: externalDetailForm.items,
      };

      const success = await updateExternalOrderDetails(order.id, payload);
      if (!success) {
        alert("No se pudo actualizar la venta externa");
        return;
      }

      setIsEditingExternalDetails(false);
      alert("Venta externa actualizada correctamente");
    } catch (error) {
      alert("Ocurrió un error al guardar la venta externa");
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para verificar si existe información de facturación
  const hasInvoiceData = () => {
    return (
      order.customer &&
      order.customer.needsInvoice &&
      order.customer.invoiceInfo
    );
  };

  // Función para formatear número de teléfono para WhatsApp
  const formatPhoneForWhatsapp = (phone) => {
    if (!phone) return "";

    // Eliminar caracteres no numéricos
    let cleaned = phone.replace(/\D/g, "");

    // Verificar si ya tiene código de país
    if (
      !cleaned.startsWith("56") &&
      cleaned.length === 9 &&
      cleaned.startsWith("9")
    ) {
      // Número chileno sin código de país (9XXXXXXXX) - añadir 56
      cleaned = "56" + cleaned;
    }

    return cleaned;
  };

  // Asegurarnos de que el botón sea clickeable
  const handleEditClick = () => {
    if (!assignOrderNumberAvailable) {
      alert("La función para asignar números de orden no está disponible");
      return;
    }
    setIsEditingOrderNumber(true);
    setNewOrderNumber(order.orderNumber || "");
  };

  return (
    <tr>
      <td colSpan="8" className="p-0 border-b border-gray-200">
        <div className="bg-gray-50 p-4 space-y-4">
          {/* Información del cliente y datos de facturación - 2 columnas en desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* COLUMNA 1: Información del cliente */}
            <div className="bg-white rounded-sm border border-gray-200 p-3">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Información del Cliente
              </h3>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="col-span-2 font-medium">
                    {order.customerName}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Email:</span>
                  <span className="col-span-2 flex items-center">
                    <span className="mr-1 truncate">{order.customerEmail}</span>
                    <button
                      onClick={() =>
                        handleCopy(order.customerEmail, "customer-email")
                      }
                      className="text-gray-400 hover:text-gray-600"
                      title="Copiar email"
                    >
                      {copiedText === "customer-email" ? (
                        <FaCheck className="text-green-500" size={12} />
                      ) : (
                        <FaCopy size={12} />
                      )}
                    </button>
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="col-span-2 flex items-center">
                    <span className="mr-1">
                      {order.customer?.phone || "No especificado"}
                    </span>
                    {order.customer?.phone && (
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleCopy(order.customer.phone, "customer-phone")
                          }
                          className="text-gray-400 hover:text-gray-600 mr-2"
                          title="Copiar teléfono"
                        >
                          {copiedText === "customer-phone" ? (
                            <FaCheck className="text-green-500" size={12} />
                          ) : (
                            <FaCopy size={12} />
                          )}
                        </button>

                        <a
                          href={`https://wa.me/${formatPhoneForWhatsapp(
                            order.customer.phone
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-green-600"
                          title="Enviar mensaje por WhatsApp"
                        >
                          <FaWhatsapp
                            size={14}
                            className="text-green-500 hover:text-green-600"
                          />
                        </a>
                      </div>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Dirección:</span>
                  <span className="col-span-2 text-xs break-words">
                    {formatAddress(order.customer)}
                  </span>
                </div>

                {order.customer?.notes && (
                  <div className="grid grid-cols-3 mt-2">
                    <span className="text-gray-500">Notas:</span>
                    <span className="col-span-2 text-xs italic text-gray-600">
                      {order.customer.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA 2: Información del pedido y facturación */}
            <div className="space-y-3">
              {/* Información general del pedido */}
              <div className="bg-white rounded-sm border border-gray-200 p-3">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Información del Pedido
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">ID:</span>
                    <span className="col-span-2 flex items-center">
                      <span className="mr-1 font-mono truncate">
                        {order.id}
                      </span>
                      <button
                        onClick={() => handleCopy(order.id, "order-id")}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar ID"
                      >
                        {copiedText === "order-id" ? (
                          <FaCheck className="text-green-500" size={12} />
                        ) : (
                          <FaCopy size={12} />
                        )}
                      </button>
                    </span>
                  </div>
                  
                  {/* Número de orden */}
                  <div className="grid grid-cols-3 mt-2">
                    <span className="text-gray-500">Número de orden:</span>
                    <span className="col-span-2 flex items-center">
                      {isEditingOrderNumber ? (
                        // Modo edición
                        <>
                          <input
                            type="text"
                            value={newOrderNumber}
                            onChange={(e) => setNewOrderNumber(e.target.value)}
                            className="border border-gray-300 rounded-sm px-2 py-1 text-xs mr-2 w-24"
                            placeholder="Ej: A001"
                            disabled={isProcessing}
                          />
                          <button
                            onClick={handleOrderNumberUpdate}
                            className="text-blue-500 hover:text-blue-700 mr-1"
                            title="Guardar"
                            disabled={isProcessing || !assignOrderNumberAvailable}
                          >
                            {isProcessing ? (
                              <span className="inline-block animate-spin">⟳</span>
                            ) : (
                              <FaSave size={12} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingOrderNumber(false);
                              setNewOrderNumber(order.orderNumber || "");
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Cancelar"
                            disabled={isProcessing}
                          >
                            <FaTimes size={12} />
                          </button>
                        </>
                      ) : (
                        // Modo visualización
                        <>
                          {order.orderNumber ? (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-sm text-xs font-medium mr-2">
                              #{order.orderNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 mr-2">No disponible</span>
                          )}
                          <button
                            onClick={handleEditClick}
                            className={`text-gray-400 hover:text-gray-600 ${!assignOrderNumberAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={assignOrderNumberAvailable ? "Editar número de orden" : "Funcionalidad no disponible"}
                            disabled={!assignOrderNumberAvailable}
                          >
                            <FaEdit size={12} />
                          </button>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="col-span-2">
                      {order.date ? new Date(order.date).toLocaleString() : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Total:</span>
                    <span className="col-span-2 font-medium">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  {/* Estado del pedido con selector */}
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Estado:</span>
                    <span className="col-span-2">
                      {updateOrderStatus ? (
                        <div className="flex items-center">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="text-xs rounded-sm border-gray-300 mr-2 py-1"
                            disabled={isProcessing}
                          >
                            {orderStatuses?.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {newStatus !== order.status && (
                            <button
                              onClick={handleStatusUpdate}
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm px-2 py-1 text-xs"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <span className="inline-block animate-spin">⟳</span>
                              ) : (
                                "Actualizar"
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status || "PENDIENTE"}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Pago:</span>
                    <span className="col-span-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${
                          order.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.paymentStatus === "completed"
                          ? "Completado"
                          : order.paymentStatus === "pending"
                          ? "Pendiente"
                          : "Fallido"}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Método:</span>
                    <span className="col-span-2 capitalize">
                      {order.paymentMethod || "No especificado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de facturación (condicional) */}
              {hasInvoiceData() && (
                <div className="bg-white rounded-sm border border-gray-200 p-3">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Información de Facturación
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="grid grid-cols-3">
                      <span className="text-gray-500">Representante:</span>
                      <span className="col-span-2">
                        {order.customer.invoiceInfo.representativeName ||
                          "No especificado"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3">
                      <span className="text-gray-500">RUT empresa:</span>
                      <span className="col-span-2 flex items-center">
                        <span className="mr-1 font-medium">
                          {order.customer.invoiceInfo.businessRut ||
                            "No especificado"}
                        </span>
                        {order.customer.invoiceInfo.businessRut && (
                          <button
                            onClick={() =>
                              handleCopy(
                                order.customer.invoiceInfo.businessRut,
                                "business-rut"
                              )
                            }
                            className="text-gray-400 hover:text-gray-600"
                            title="Copiar RUT"
                          >
                            {copiedText === "business-rut" ? (
                              <FaCheck className="text-green-500" size={12} />
                            ) : (
                              <FaCopy size={12} />
                            )}
                          </button>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-3">
                      <span className="text-gray-500">Dirección:</span>
                      <span className="col-span-2 break-words">
                        {order.customer.invoiceInfo.businessAddress ||
                          "No especificada"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3">
                      <span className="text-gray-500">Email facturación:</span>
                      <span className="col-span-2 flex items-center">
                        <span className="mr-1 truncate">
                          {order.customer.invoiceInfo.invoiceEmail ||
                            order.customerEmail}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              order.customer.invoiceInfo.invoiceEmail ||
                                order.customerEmail,
                              "invoice-email"
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                          title="Copiar email de facturación"
                        >
                          {copiedText === "invoice-email" ? (
                            <FaCheck className="text-green-500" size={12} />
                          ) : (
                            <FaCopy size={12} />
                          )}
                        </button>
                      </span>
                    </div>

                    {order.customer.invoiceInfo.additionalNotes && (
                      <div className="grid grid-cols-3">
                        <span className="text-gray-500">Observaciones:</span>
                        <span className="col-span-2 text-xs italic text-gray-600">
                          {order.customer.invoiceInfo.additionalNotes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isExternalOrder && (
            <div className="bg-white rounded-sm border border-gray-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Edición de Venta Externa</h3>
                {!isEditingExternalDetails ? (
                  <button
                    onClick={() => setIsEditingExternalDetails(true)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-50"
                  >
                    <FaEdit size={11} />
                    Editar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingExternalDetails(false);
                        setExternalDetailForm({
                          customerName: order?.customerName || "",
                          customerEmail: order?.customerEmail || "",
                          customerPhone: order?.customer?.phone || "",
                          paymentMethod: order?.paymentMethod || "efectivo",
                          description: order?.description || "",
                          notes: order?.customer?.notes || order?.notes || "",
                          amount: order?.total || 0,
                          items: getOrderItems(order).map((item) => ({
                            title: item?.title || item?.name || "",
                            quantity: String(Number(item?.quantity) || 1),
                            price: String(Number(item?.price) || 0),
                          })),
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-50"
                      disabled={isProcessing}
                    >
                      <FaTimes size={11} />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveExternalDetails}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                      disabled={isProcessing}
                    >
                      <FaSave size={11} />
                      Guardar cambios
                    </button>
                  </div>
                )}
              </div>

              {isEditingExternalDetails && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={externalDetailForm.customerName}
                      onChange={(e) => handleExternalFieldChange("customerName", e.target.value)}
                      placeholder="Nombre cliente"
                      className="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-xs"
                    />
                    <input
                      type="email"
                      value={externalDetailForm.customerEmail}
                      onChange={(e) => handleExternalFieldChange("customerEmail", e.target.value)}
                      placeholder="Correo"
                      className="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={externalDetailForm.customerPhone}
                      onChange={(e) => handleExternalFieldChange("customerPhone", e.target.value)}
                      placeholder="Teléfono"
                      className="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-xs"
                    />
                    <select
                      value={externalDetailForm.paymentMethod}
                      onChange={(e) => handleExternalFieldChange("paymentMethod", e.target.value)}
                      className="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-xs capitalize"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="webpay">Webpay</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={externalDetailForm.description}
                    onChange={(e) => handleExternalFieldChange("description", e.target.value)}
                    placeholder="Descripción de la venta"
                    className="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-xs"
                  />

                  <textarea
                    value={externalDetailForm.notes}
                    onChange={(e) => handleExternalFieldChange("notes", e.target.value)}
                    rows={2}
                    placeholder="Notas"
                    className="w-full rounded-sm border border-gray-300 px-2 py-1.5 text-xs"
                  />

                  <div className="overflow-x-auto border border-gray-200 rounded-sm">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-2 py-1 text-left">Producto</th>
                          <th className="px-2 py-1 text-right">Cant.</th>
                          <th className="px-2 py-1 text-right">Precio</th>
                          <th className="px-2 py-1 text-right">Subtotal</th>
                          <th className="px-2 py-1 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {externalDetailForm.items.map((item, index) => {
                          const quantity = Number(item.quantity) || 0;
                          const price = Number(item.price) || 0;
                          return (
                            <tr key={`editable-ext-item-${index}`} className="border-b border-gray-100">
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleExternalItemChange(index, "title", e.target.value)}
                                  placeholder="Nombre del producto"
                                  className="w-full rounded-sm border border-gray-300 px-2 py-1"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={item.quantity}
                                  onChange={(e) => handleExternalItemChange(index, "quantity", e.target.value)}
                                  className="w-16 ml-auto rounded-sm border border-gray-300 px-2 py-1 text-right"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={item.price}
                                  onChange={(e) => handleExternalItemChange(index, "price", e.target.value)}
                                  className="w-24 ml-auto rounded-sm border border-gray-300 px-2 py-1 text-right"
                                />
                              </td>
                              <td className="px-2 py-1 text-right font-medium text-gray-700">
                                {formatPrice(quantity * price)}
                              </td>
                              <td className="px-2 py-1 text-center">
                                <button
                                  onClick={() => removeExternalItemRow(index)}
                                  className="text-red-500 hover:text-red-700"
                                  type="button"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={addExternalItemRow}
                      className="text-xs px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-50"
                    >
                      Agregar producto
                    </button>
                    <div className="text-xs text-gray-700">
                      Total calculado: <span className="font-semibold">{formatPrice(computedExternalTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-sm border border-gray-200 p-3">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 3h2l.4 2M7 13h8l3-6H6.4M7 13L6.4 5M7 13l-1.2 3.6a1 1 0 00.95 1.32H15" />
              </svg>
              Productos del Pedido ({orderItems.length})
            </h3>

            {orderItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Producto</th>
                      <th className="px-2 py-1 text-right font-medium text-gray-500">Cantidad</th>
                      <th className="px-2 py-1 text-right font-medium text-gray-500">Precio</th>
                      <th className="px-2 py-1 text-right font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderItems.map((item, index) => {
                      const title = item?.title || item?.name || item?.productTitle || `Producto ${index + 1}`;
                      const quantity = Number(item?.quantity) || 1;
                      const price = Number(item?.price) || 0;
                      const subtotal = quantity * price;
                      return (
                        <tr key={`order-item-${index}`}>
                          <td className="px-2 py-1 text-gray-800">{title}</td>
                          <td className="px-2 py-1 text-right text-gray-700">{quantity}</td>
                          <td className="px-2 py-1 text-right text-gray-700">{formatPrice(price)}</td>
                          <td className="px-2 py-1 text-right font-medium text-gray-900">{formatPrice(subtotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No hay productos registrados para este pedido.</p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default OrderDetails;