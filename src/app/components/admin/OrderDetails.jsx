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
}) => {
  const [copiedText, setCopiedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status || "PENDIENTE");

  // Estados para edición del número de orden
  const [isEditingOrderNumber, setIsEditingOrderNumber] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState(order.orderNumber || "");
  
  // Estado para controlar el error de la función no disponible
  const [assignOrderNumberAvailable, setAssignOrderNumberAvailable] = useState(false);

  // Verificar si la prop assignOrderNumber está disponible
  useEffect(() => {
    if (typeof assignOrderNumber !== 'function') {
      console.warn("La función assignOrderNumber no está disponible");
      setAssignOrderNumberAvailable(false);
    } else {
      console.log("Función assignOrderNumber está disponible");
      setAssignOrderNumberAvailable(true);
    }
  }, [assignOrderNumber]);

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
      console.log(`Estado actualizado a ${newStatus}`);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado del pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderNumberUpdate = async () => {
    if (!assignOrderNumberAvailable) {
      console.error("La función assignOrderNumber no está disponible");
      alert("Error: No se puede actualizar el número de orden. La función no está disponible.");
      return;
    }
    
    if (!newOrderNumber.trim()) {
      alert("Por favor ingresa un número de orden válido");
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log(`Asignando número de orden: ${newOrderNumber} a pedido ID: ${order.id}`);
      const success = await assignOrderNumber(order.id, newOrderNumber.trim());
      
      if (success) {
        setIsEditingOrderNumber(false);
        console.log("Número de orden asignado correctamente");
        alert("Número de orden actualizado correctamente");
      } else {
        console.error("No se pudo asignar el número de orden");
        alert("No se pudo asignar el número de orden");
      }
    } catch (error) {
      console.error("Error al asignar número de orden:", error);
      alert(`Error al asignar número de orden: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatear el precio para mostrar
  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString("es-CL")}` : "$0";
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
            <div className="bg-white rounded border border-gray-200 p-3">
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
              <div className="bg-white rounded border border-gray-200 p-3">
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
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs mr-2 w-24"
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
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
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
                            className="text-xs rounded border-gray-300 mr-2 py-1"
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
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 text-xs"
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
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
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
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                <div className="bg-white rounded border border-gray-200 p-3">
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

          {/* Productos del pedido */}
          <div className="bg-white rounded border border-gray-200">
            <h3 className="text-sm font-medium p-3 border-b">
              Productos ({order.cart?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.cart && order.cart.length > 0 ? (
                    order.cart.map((item, index) => (
                      <tr key={`item-${index}`} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-normal">
                          <div className="flex items-start">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title || item.name}
                                className="w-10 h-10 object-cover rounded mr-2"
                                onError={(e) => {
                                  e.target.src = "/placeholder.png";
                                }}
                              />
                            )}
                            <div>
                              <div className="text-xs font-medium">
                                {item.title || item.name || "Producto"}
                              </div>
                              {item.sku && (
                                <div className="text-xs text-gray-500">
                                  SKU: {item.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-center">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-3 py-2 text-xs text-center">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-xs text-right font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-3 py-2 text-center text-sm text-gray-500"
                      >
                        No hay productos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-3 py-2 text-right text-xs font-medium text-gray-500"
                    >
                      Subtotal:
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium">
                      {formatPrice(order.summary?.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="3"
                      className="px-3 py-2 text-right text-xs font-medium text-gray-500"
                    >
                      Envío:
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-medium">
                      {formatPrice(order.summary?.shipping)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="3"
                      className="px-3 py-2 text-right text-xs font-medium text-gray-700"
                    >
                      Total:
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-bold">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default OrderDetails;