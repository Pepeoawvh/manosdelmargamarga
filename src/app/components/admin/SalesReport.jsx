import React, { useState } from "react";
import useSalesReport from "../../hooks/admin/useSalesReport";
import { Tab } from "@headlessui/react";
import ExternalSaleForm from "./ExternalSalesForm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SalesReport() {
  const {
    loading,
    error,
    monthlyData,
    allTimeData,
    orders,
    externalSales,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    months,
    years,
    addExternalSale,
    formatCurrency,
    fetchSalesData,
  } = useSalesReport();

  const [showForm, setShowForm] = useState(false);

  const handleAddExternalSale = async (saleData) => {
    const result = await addExternalSale(saleData);
    if (result.success) {
      setShowForm(false);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header con controles de filtro */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Informe de Ventas</h2>

          <div className="flex gap-4 items-center">
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mes
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Año
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="mt-auto px-4 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700"
            >
              Agregar Venta Externa
            </button>
          </div>
        </div>
      </div>

      {/* Formulario de venta externa (condicional) */}
      {showForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <ExternalSaleForm
            onSubmit={handleAddExternalSale}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Contenido principal */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchSalesData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                classNames(
                  "py-4 px-6 text-sm font-medium leading-5 focus:outline-none",
                  selected
                    ? "text-emerald-700 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-gray-700"
                )
              }
            >
              Resumen Mensual
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "py-4 px-6 text-sm font-medium leading-5 focus:outline-none",
                  selected
                    ? "text-emerald-700 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-gray-700"
                )
              }
            >
              Detalles de Ventas
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "py-4 px-6 text-sm font-medium leading-5 focus:outline-none",
                  selected
                    ? "text-emerald-700 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-gray-700"
                )
              }
            >
              Histórico General
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* PANEL 1: RESUMEN MENSUAL */}
            <Tab.Panel className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Resumen de {months[selectedMonth]} {selectedYear}
              </h3>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-emerald-800 mb-1">
                    Ventas Totales
                  </h4>
                  <p className="text-2xl font-bold text-emerald-700">
                    {monthlyData ? formatCurrency(monthlyData.totalSales) : "-"}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {monthlyData?.salesCount || 0} ventas totales
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Ventas Online
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {monthlyData
                      ? formatCurrency(monthlyData.onlineSales)
                      : "-"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {monthlyData?.onlineCount || 0} ventas a través de la tienda
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Ventas Externas
                  </h4>
                  <p className="text-2xl font-bold text-yellow-700">
                    {monthlyData
                      ? formatCurrency(monthlyData.externalSalesTotal)
                      : "-"}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {monthlyData?.externalCount || 0} ventas registradas
                    manualmente
                  </p>
                </div>
              </div>

              {/* Producto más vendido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Producto Más Vendido
                  </h4>

                  {monthlyData?.topProduct ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-md p-3 mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-gray-800">
                          {monthlyData.topProduct.name}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          Precio: {formatCurrency(monthlyData.topProduct.price)}
                        </p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              Cantidad vendida
                            </p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {monthlyData.topProduct.quantity} unidades
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Ingresos generados
                            </p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatCurrency(monthlyData.topProduct.revenue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay datos de productos para este período
                    </p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Producto con Mayores Ingresos
                  </h4>

                  {monthlyData?.topRevenueProduct ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-md p-3 mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-gray-800">
                          {monthlyData.topRevenueProduct.name}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          Precio:{" "}
                          {formatCurrency(monthlyData.topRevenueProduct.price)}
                        </p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              Cantidad vendida
                            </p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {monthlyData.topRevenueProduct.quantity} unidades
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Ingresos generados
                            </p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatCurrency(
                                monthlyData.topRevenueProduct.revenue
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay datos de productos para este período
                    </p>
                  )}
                </div>
              </div>

              {/* Top 5 productos */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Top Productos por Ventas
                </h4>

                {monthlyData?.topProducts &&
                monthlyData.topProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio Unitario
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ingresos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthlyData.topProducts.slice(0, 5).map((product) => (
                          <tr key={product.id}>
                            <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500">
                              {product.quantity}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-gray-900">
                              {formatCurrency(product.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay datos de productos para este período
                  </p>
                )}
              </div>
            </Tab.Panel>

            {/* PANEL 2: DETALLE DE VENTAS */}
            <Tab.Panel className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Detalle de Ventas - {months[selectedMonth]} {selectedYear}
              </h3>

              <Tab.Group>
                <Tab.List className="flex border-b border-gray-200 mb-4">
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        "py-2 px-4 text-sm font-medium leading-5 focus:outline-none",
                        selected
                          ? "text-emerald-700 border-b-2 border-emerald-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    Ventas Online ({orders.length})
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        "py-2 px-4 text-sm font-medium leading-5 focus:outline-none",
                        selected
                          ? "text-emerald-700 border-b-2 border-emerald-500"
                          : "text-gray-500 hover:text-gray-700"
                      )
                    }
                  >
                    Ventas Externas ({externalSales.length})
                  </Tab>
                </Tab.List>

                <Tab.Panels>
                  {/* Tabla de ventas online */}
                  <Tab.Panel>
                    {orders.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        No hay ventas online para este período
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Fecha
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Nº Orden
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Cliente
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Estado
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Productos
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(order.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {order.orderNumber}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {order.customer}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${
                                      order.status === "FINALIZADO"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "ENVIADO"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                  {formatCurrency(order.total)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {Array.isArray(order.items) &&
                                  order.items.length > 0 ? (
                                    <ul className="list-disc pl-4">
                                      {order.items
                                        .slice(0, 3)
                                        .map((item, index) => (
                                          <li
                                            key={index}
                                            className="truncate max-w-xs"
                                          >
                                            {item.quantity}x {item.title}
                                          </li>
                                        ))}
                                      {order.items.length > 3 && (
                                        <li className="text-gray-400 italic">
                                          +{order.items.length - 3} más...
                                        </li>
                                      )}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-400">
                                      Sin productos
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Panel>

                  {/* Tabla de ventas externas */}
                  <Tab.Panel>
                    {externalSales.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        No hay ventas externas para este período
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Fecha
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Cliente
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Descripción
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Método de Pago
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Monto
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {externalSales.map((sale) => (
                              <tr key={sale.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(sale.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {sale.customer}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {sale.description}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                                  {sale.paymentMethod}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                  {formatCurrency(sale.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </Tab.Panel>

            {/* PANEL 3: HISTÓRICO GENERAL */}
            <Tab.Panel className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Histórico de Ventas
              </h3>

              {/* Tarjetas de estadísticas generales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">
                    Ventas Totales Históricas
                  </h4>
                  <p className="text-2xl font-bold text-purple-700">
                    {allTimeData ? formatCurrency(allTimeData.totalSales) : "-"}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {allTimeData?.salesCount || 0} ventas totales registradas
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Pedidos Online
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {allTimeData?.onlineCount || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Ventas realizadas a través de la tienda
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">
                    Ventas Externas
                  </h4>
                  <p className="text-2xl font-bold text-amber-700">
                    {allTimeData?.externalCount || 0}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Ventas registradas manualmente
                  </p>
                </div>
              </div>

              {/* Gráfico de ventas por mes */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Evolución de Ventas
                </h4>

                {allTimeData?.chartData && allTimeData.chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={allTimeData.chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="monthName"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => value.substring(0, 3)}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("es", {
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(value)
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Ventas",
                          ]}
                          labelFormatter={(value) =>
                            `${value} ${
                              allTimeData.chartData.find(
                                (d) => d.monthName === value
                              )?.year
                            }`
                          }
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total de Ventas"
                          stroke="#047857"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    No hay suficientes datos para generar un gráfico
                  </p>
                )}
              </div>

              {/* Gráfico de productos más vendidos */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Top 10 Productos por Ventas
                </h4>

                {allTimeData?.topProducts &&
                allTimeData.topProducts.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={allTimeData.topProducts.slice(0, 10)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={150}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            value.length > 20
                              ? `${value.substring(0, 20)}...`
                              : value
                          }
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="quantity"
                          name="Cantidad Vendida"
                          fill="#3b82f6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    No hay suficientes datos para generar un gráfico
                  </p>
                )}
              </div>

              {/* Tabla de productos más vendidos por ingresos */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Top Productos por Ingresos
                </h4>

                {allTimeData?.topRevenueProducts &&
                allTimeData.topRevenueProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Producto
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Precio
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Unidades
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Ingresos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allTimeData.topRevenueProducts
                          .slice(0, 10)
                          .map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                {product.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                                {formatCurrency(product.revenue)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay datos de productos disponibles
                  </p>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
}
