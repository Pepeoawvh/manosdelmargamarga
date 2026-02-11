"use client";
import React, { useState, useMemo } from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaCopy,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import useAdminPanel from "@/app/hooks/admin/useAdminPanel";
import ReservationDetails from "./ReservationDetails";

const ReservationTable = ({ reservations: initialReservations = [], formatDate = () => "" }) => {
  const [expandedReservationId, setExpandedReservationId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [filterStatus, setFilterStatus] = useState("TODOS");

  const {
    updateReservationStatus,
    updateReservationQuantity,
    deleteReservation,
  } = useAdminPanel();

  // Estados disponibles para las reservas
  const reservationStatuses = ["pending", "confirmed", "cancelled", "completed"];

  const statusLabels = {
    pending: "PENDIENTE",
    confirmed: "CONFIRMADA",
    cancelled: "CANCELADA",
    completed: "COMPLETADA",
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (reservationId) => {
    try {
      if (typeof deleteReservation !== "function") {
        alert("Error: La función de eliminación no está disponible");
        return;
      }
      const success = await deleteReservation(reservationId);
      if (success) {
        setDeleteConfirmation(null);
        alert("Reserva eliminada correctamente");
      } else {
        alert("No se pudo eliminar la reserva.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert(`Error al eliminar la reserva: ${error.message}`);
    }
  };

  // Filtrar y ordenar reservas
  const filteredAndSortedReservations = useMemo(() => {
    let filtered = initialReservations || [];

    if (filterStatus !== "TODOS") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [initialReservations, filterStatus, sortConfig]);

  return (
    <div className="space-y-4">
      {/* Controles de filtro */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">
            Filtrar por Estado:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="TODOS">Todas</option>
            {reservationStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Total: {filteredAndSortedReservations.length} reserva(s)
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-blue-200"
                onClick={() =>
                  setSortConfig({
                    key: "createdAt",
                    direction:
                      sortConfig.key === "createdAt" &&
                      sortConfig.direction === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Fecha
                {sortConfig.key === "createdAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-300">
            {filteredAndSortedReservations.length > 0 ? (
              filteredAndSortedReservations.map((reservation, index) => (
                <React.Fragment
                  key={`reservation-${reservation.id || index}`}
                >
                  {/* Fila principal */}
                  <tr
                    className={
                      expandedReservationId === reservation.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    {/* Fecha */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                      {formatDate(reservation.createdAt)}
                    </td>

                    {/* Cliente */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-900">
                          {reservation.customerName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {reservation.customerEmail}
                        </span>
                      </div>
                    </td>

                    {/* Producto */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-900">
                        {reservation.productTitle}
                      </span>
                    </td>

                    {/* Cantidad */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900 font-medium">
                      {reservation.quantity}
                    </td>

                    {/* Total */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center font-bold text-green-700">
                      ${reservation.total?.toLocaleString("es-CL") || 0}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusClass(
                          reservation.status
                        )}`}
                      >
                        {statusLabels[reservation.status] || "PENDIENTE"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Botón expandir detalles */}
                        <button
                          onClick={() =>
                            setExpandedReservationId(
                              expandedReservationId === reservation.id
                                ? null
                                : reservation.id
                            )
                          }
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Ver detalles"
                        >
                          {expandedReservationId === reservation.id ? (
                            <FaChevronUp size={16} />
                          ) : (
                            <FaChevronDown size={16} />
                          )}
                        </button>

                        {/* Botón eliminar */}
                        <button
                          onClick={() =>
                            setDeleteConfirmation(reservation.id)
                          }
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar reserva"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila de confirmación de eliminación */}
                  {deleteConfirmation === reservation.id && (
                    <tr className="bg-red-50">
                      <td colSpan="7" className="px-3 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-700 font-medium">
                            ¿Eliminar esta reserva? Esta acción no se puede deshacer.
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleDelete(reservation.id)
                              }
                              className="py-1 px-3 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Confirmar eliminación
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation(null)
                              }
                              className="py-1 px-3 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Fila de detalles expandida */}
                  {expandedReservationId === reservation.id && (
                    <ReservationDetails
                      reservation={reservation}
                      updateReservationStatus={updateReservationStatus}
                      updateReservationQuantity={updateReservationQuantity}
                      getStatusClass={getStatusClass}
                      formatDate={formatDate}
                      reservationStatuses={reservationStatuses}
                    />
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  No se encontraron reservas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationTable;
