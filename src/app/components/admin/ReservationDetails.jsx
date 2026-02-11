"use client";
import React, { useState } from "react";
import {
  FaCopy,
  FaCheck,
  FaEdit,
  FaSave,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";

const ReservationDetails = ({
  reservation,
  updateReservationStatus,
  updateReservationQuantity,
  getStatusClass,
  formatDate,
  reservationStatuses,
}) => {
  const [copiedText, setCopiedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState(reservation.status || "pending");
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState(reservation.quantity || 1);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedText(field);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Actualizar estado de la reserva
  const handleStatusUpdate = async () => {
    if (!updateReservationStatus || newStatus === reservation.status) return;

    setIsProcessing(true);
    try {
      await updateReservationStatus(reservation.id, newStatus);
      console.log(`Estado actualizado a ${newStatus}`);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado de la reserva");
    } finally {
      setIsProcessing(false);
    }
  };

  // Actualizar cantidad de la reserva
  const handleQuantityUpdate = async () => {
    if (
      !updateReservationQuantity ||
      newQuantity === reservation.quantity ||
      newQuantity < 1
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await updateReservationQuantity(reservation.id, parseInt(newQuantity));
      setIsEditingQuantity(false);
      console.log(`Cantidad actualizada a ${newQuantity}`);
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      alert("No se pudo actualizar la cantidad de la reserva");
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString("es-CL")}` : "$0";
  };

  // Formatear número de teléfono para WhatsApp
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

  const statusLabels = {
    pending: "PENDIENTE",
    confirmed: "CONFIRMADA",
    cancelled: "CANCELADA",
    completed: "COMPLETADA",
  };

  const copyReservationData = () => {
    const data = `
ID Reserva: ${reservation.id}
Cliente: ${reservation.customerName}
Email: ${reservation.customerEmail}
Teléfono: ${reservation.customerPhone || "N/A"}
Producto: ${reservation.productTitle}
Precio: ${formatPrice(reservation.productPrice)}
Cantidad: ${reservation.quantity}
Total: ${formatPrice(reservation.total)}
Estado: ${statusLabels[reservation.status] || reservation.status}
Dirección: ${reservation.customerAddress || "N/A"}
Región: ${reservation.customerRegion || "N/A"}
Fecha: ${formatDate(reservation.createdAt)}
    `.trim();

    navigator.clipboard.writeText(data);
    setCopiedText("all-data");
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <tr>
      <td colSpan="8" className="p-0 border-b border-gray-200">
        <div className="bg-gray-50 p-4 space-y-4">
          {/* Información del cliente - 2 columnas en desktop */}
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
                    {reservation.customerName}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Email:</span>
                  <span className="col-span-2 flex items-center">
                    <span className="mr-1 truncate">
                      {reservation.customerEmail}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(reservation.customerEmail, "customer-email")
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
                      {reservation.customerPhone || "No especificado"}
                    </span>
                    {reservation.customerPhone && (
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleCopy(reservation.customerPhone, "phone")
                          }
                          className="text-gray-400 hover:text-gray-600 mr-2"
                          title="Copiar teléfono"
                        >
                          {copiedText === "phone" ? (
                            <FaCheck className="text-green-500" size={12} />
                          ) : (
                            <FaCopy size={12} />
                          )}
                        </button>

                        <a
                          href={`https://wa.me/${formatPhoneForWhatsapp(
                            reservation.customerPhone
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
                  <span className="col-span-2">
                    {reservation.customerAddress || "No especificada"}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Región:</span>
                  <span className="col-span-2">
                    {reservation.customerRegion || "No especificada"}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: Información del producto y estado */}
            <div className="bg-white rounded border border-gray-200 p-3">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                </svg>
                Información del Producto
              </h3>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Producto:</span>
                  <span className="col-span-2 font-medium">
                    {reservation.productTitle}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Precio:</span>
                  <span className="col-span-2 font-medium">
                    {formatPrice(reservation.productPrice)}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Cantidad:</span>
                  <span className="col-span-2">
                    {isEditingQuantity ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={newQuantity}
                          onChange={(e) => setNewQuantity(e.target.value)}
                          className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs"
                          disabled={isProcessing}
                        />
                        <button
                          onClick={handleQuantityUpdate}
                          disabled={isProcessing}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaSave size={12} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingQuantity(false);
                            setNewQuantity(reservation.quantity);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{reservation.quantity}</span>
                        <button
                          onClick={() => setIsEditingQuantity(true)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar cantidad"
                        >
                          <FaEdit size={12} />
                        </button>
                      </div>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Total:</span>
                  <span className="col-span-2 font-medium text-green-700">
                    {formatPrice(reservation.total)}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Fecha:</span>
                  <span className="col-span-2">
                    {formatDate(reservation.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado y acciones */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <h3 className="text-sm font-medium mb-2">Acciones</h3>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1  md:grid-cols-3 gap-2">
                <div className="md:col-span-2">
                  <button
                    onClick={copyReservationData}
                    className="w-full bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 flex items-center justify-center gap-2"
                  >
                    {copiedText === "all-data" ? (
                      <>
                        <FaCheck size={12} /> Datos Copiados
                      </>
                    ) : (
                      <>
                        <FaCopy size={12} /> Copiar Todos los Datos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ReservationDetails;
