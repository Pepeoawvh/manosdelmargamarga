"use client";
import { useState } from "react";
import React from "react";
import OrderDetails from "./OrderDetails";

const OrderTable = ({
  orders = [],
  expandedOrderId,
  setExpandedOrderId,
  requestSort,
  getPaymentStatusClass,
  getPaymentStatusText,
  getStatusClass,
  formatDate,
  updateOrderStatus,
  // Agregar esta nueva función
  assignOrderNumber,
}) => {
  const [copiedText, setCopiedText] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  // Nuevos estados para manejar la asignación manual de números de orden
  const [editingOrderNumber, setEditingOrderNumber] = useState(null);
  const [orderNumberInput, setOrderNumberInput] = useState("");

  // Estados disponibles para el pedido
  const orderStatuses = [
    "PENDIENTE",
    "EMPACADO S/ETIQ.",
    "EMP. CON ETIQUETA",
    "ENVIADO",
    "FINALIZADO",
    "ESPERANDO RETIRO",
    "RETIRADO POR CLIENTE",
    "RESERVADO",
    "CANCELADO",
  ];

  const formatAddress = (customer) => {
    if (!customer) return "Dirección no disponible";

    const { address, city, state, postalCode, country, comuna, region } =
      customer;

    const addressParts = [];

    if (address) addressParts.push(address);

    // Adaptamos para formato chileno o internacional
    if (comuna) addressParts.push(comuna);
    else if (city) addressParts.push(city);

    if (region) addressParts.push(region);
    else if (state) addressParts.push(state);

    if (postalCode) addressParts.push(postalCode);
    if (country) addressParts.push(country);

    return addressParts.join(", ");
  };

  // Función para copiar texto al portapapeles
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedText(field);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Nueva función para manejar la asignación de número de orden
  const handleAssignOrderNumber = async (orderId) => {
    if (!orderNumberInput.trim()) {
      alert("Por favor ingrese un número de orden válido");
      return;
    }

    try {
      const success = await assignOrderNumber(orderId, orderNumberInput);

      if (success) {
        console.log(
          `Número de orden ${orderNumberInput} asignado correctamente al pedido ${orderId}`
        );
        setEditingOrderNumber(null);
        setOrderNumberInput("");
      } else {
        alert("No se pudo asignar el número de orden. Inténtelo nuevamente.");
      }
    } catch (error) {
      console.error("Error al asignar número de orden:", error);
      alert(`Error al asignar número de orden: ${error.message}`);
    }
  };

  // Función para manejar cambio de estado directamente desde la fila
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log(
        `Intentando cambiar estado de pedido ${orderId} a ${newStatus}`
      );

      // Verificar si updateOrderStatus está definido
      if (typeof updateOrderStatus !== "function") {
        console.error("updateOrderStatus no es una función válida");
        alert("Error: La función de actualización no está disponible");
        return;
      }

      // Llamar a la función de actualización
      const success = await updateOrderStatus(orderId, newStatus);

      if (success) {
        console.log(`Estado actualizado correctamente a: ${newStatus}`);
        // Cerrar el dropdown después de la actualización exitosa
        setEditingStatus(null);
      } else {
        console.error("No se pudo actualizar el estado");
        alert(
          "No se pudo actualizar el estado del pedido. Verifica la consola para más detalles."
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert(`Error al actualizar el estado del pedido: ${error.message}`);
    }
  };

  // Filtrar pedidos únicos y con estado de pago válido
  const uniqueOrders = orders.reduce((acc, order) => {
    if (
      !acc.some((o) => o.id === order.id) && // Evitar duplicados
      (order.paymentStatus === "completed" ||
        order.paymentStatus === "failed" ||
        order.paymentStatus === "aborted") // Mostrar tanto completados como rechazados
    ) {
      acc.push(order);
    }
    return acc;
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-green-100">
          <tr>
            {/* Número de Orden */}
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("orderNumber")}
            >
              N° Orden
            </th>

            <th
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort && requestSort("date")}
            >
              Fecha
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort && requestSort("customerName")}
            >
              Cliente
            </th>
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort && requestSort("total")}
            >
              Total
            </th>
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort && requestSort("paymentStatus")}
            >
              Pago
            </th>
            <th
              className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort && requestSort("status")}
            >
              Estado
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-3 00">
          {uniqueOrders.length > 0 ? (
            uniqueOrders.map((order, index) => (
              <React.Fragment key={`order-row-${order.id || index}`}>
                <tr
                  className={
                    expandedOrderId === order.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }
                >
                  {/* CELDA: Número de pedido - NUEVA IMPLEMENTACIÓN CON ASIGNACIÓN MANUAL */}
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {editingOrderNumber === order.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={orderNumberInput}
                          onChange={(e) => setOrderNumberInput(e.target.value)}
                          className="w-24 px-2 py-1 text-xs border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          placeholder="P001MMAA"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAssignOrderNumber(order.id);
                            } else if (e.key === "Escape") {
                              setEditingOrderNumber(null);
                              setOrderNumberInput("");
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAssignOrderNumber(order.id)}
                          className="p-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                          title="Guardar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrderNumber(null);
                            setOrderNumberInput("");
                          }}
                          className="p-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          title="Cancelar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : order.orderNumber ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                        {order.orderNumber}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingOrderNumber(order.id);
                          setOrderNumberInput("");
                        }}
                        className="px-2 py-1 text-xs border border-amber-300 text-amber-700 rounded-full hover:bg-amber-50"
                      >
                        Asignar NºOrden
                      </button>
                    )}
                  </td>

                  {/* Resto de las celdas permanecen igual */}
                  {/* Fecha */}
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(order.date)}
                  </td>

                  {/* Nombre del cliente */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-900">
                        {order.customerName}
                      </span>
                      <button
                        className="text-xs text-gray-500 text-left hover:text-blue-600 hover:underline"
                        onClick={() =>
                          copyToClipboard(
                            order.customerEmail,
                            `email-${order.id}`
                          )
                        }
                        title="Copiar email"
                      >
                        {order.customerEmail}
                        {copiedText === `email-${order.id}` && (
                          <span className="ml-1 text-green-600 text-xs">✓</span>
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-center font-medium text-gray-900">
                    ${order.total?.toLocaleString() || 0}
                  </td>

                  {/* Estado de pago */}
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getPaymentStatusClass(
                        order.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </td>

                  {/* Estado de procesamiento */}
                  <td className="px-3 py-2 whitespace-nowrap text-center relative">
                    {editingStatus === order.id ? (
                      <div className="absolute z-10 left-0 right-0 top-0 p-2 bg-white shadow-lg border border-gray-200 rounded">
                        <select
                          value={order.status || "PENDIENTE"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              // Usar el ID real del documento (no orderId)
                              await handleStatusChange(order.id, newStatus);
                            } catch (error) {
                              console.error(
                                "Error al aplicar cambio de estado:",
                                error
                              );
                            }
                          }}
                          autoFocus
                          className="w-full py-1 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(order.id)}
                        className={`text-xs font-medium px-2 py-1 rounded-full w-full flex items-center justify-center ${getStatusClass(
                          order.status
                        )}`}
                        title="Haz clic para cambiar el estado"
                      >
                        {order.status || "PENDIENTE"}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Botón de ver detalles */}
                      <button
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === order.id ? null : order.id
                          )
                        }
                        className="py-1 px-3 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center transition-colors"
                      >
                        {expandedOrderId === order.id ? (
                          <>
                            {/* Ícono de flecha hacia arriba - más intuitivo para "cerrar" */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            Ocultar detalles
                          </>
                        ) : (
                          <>
                            {/* Ícono de flecha hacia abajo - más intuitivo para "expandir" */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                            Ver detalles
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Fila expandible para mostrar los detalles del pedido */}
                {expandedOrderId === order.id && (
                  <OrderDetails
                    order={order}
                    updateOrderStatus={updateOrderStatus}
                    getStatusClass={getStatusClass}
                    formatAddress={formatAddress}
                    orderStatuses={orderStatuses}
                    assignOrderNumber={assignOrderNumber} // <-- Añade esta línea
                  />
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="px-3 py-6 text-center text-sm text-gray-500"
              >
                No se encontraron pedidos con los filtros seleccionados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
