import React, { useEffect, useMemo, useState } from "react";
import useSalesReport from "../../hooks/admin/useSalesReport";
import { Tab } from "@headlessui/react";
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
    developerCommissionRate,
    formatCurrency,
    fetchSalesData,
  } = useSalesReport();

  const [historicalYearFilter, setHistoricalYearFilter] = useState("all");
  const [historicalMonthFilter, setHistoricalMonthFilter] = useState("all");

  // Utilidad: short code (igual que en success)
  const shortCode = (id) =>
    id?.slice?.(-6)?.toUpperCase?.() || "N/D";

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const historicalBreakdown = allTimeData?.monthlyBreakdown || [];

  const availablePeriodsDesc = useMemo(() => {
    return [...historicalBreakdown].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [historicalBreakdown]);

  const availableSummaryYears = useMemo(() => {
    const yearsSet = new Set(availablePeriodsDesc.map((entry) => entry.year));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [availablePeriodsDesc]);

  const availableSummaryMonthsForYear = useMemo(() => {
    const monthsForYear = availablePeriodsDesc
      .filter((entry) => entry.year === Number(selectedYear))
      .map((entry) => entry.month);
    const uniqueMonths = Array.from(new Set(monthsForYear)).sort((a, b) => a - b);
    return uniqueMonths.map((monthNumber) => ({
      value: monthNumber - 1,
      label: months[monthNumber - 1],
    }));
  }, [availablePeriodsDesc, selectedYear, months]);

  useEffect(() => {
    if (!availablePeriodsDesc.length) return;

    const hasSelectedYear = availableSummaryYears.includes(Number(selectedYear));
    if (!hasSelectedYear) {
      const fallback = availablePeriodsDesc[0];
      setSelectedYear(fallback.year);
      setSelectedMonth(fallback.month - 1);
      return;
    }

    const hasSelectedMonth = availablePeriodsDesc.some(
      (entry) =>
        entry.year === Number(selectedYear) && entry.month === Number(selectedMonth) + 1
    );

    if (!hasSelectedMonth) {
      const firstMonthForYear = availablePeriodsDesc.find(
        (entry) => entry.year === Number(selectedYear)
      );
      if (firstMonthForYear) {
        setSelectedMonth(firstMonthForYear.month - 1);
      }
    }
  }, [
    availablePeriodsDesc,
    availableSummaryYears,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
  ]);

  const historicalYears = useMemo(() => {
    const yearsSet = new Set(historicalBreakdown.map((entry) => entry.year));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [historicalBreakdown]);

  const historicalMonthsForYear = useMemo(() => {
    if (historicalYearFilter === "all") {
      const monthSet = new Set(historicalBreakdown.map((entry) => entry.month));
      return Array.from(monthSet)
        .sort((a, b) => a - b)
        .map((monthNumber) => ({ value: monthNumber, label: months[monthNumber - 1] }));
    }
    const targetYear = Number(historicalYearFilter);
    const monthSet = new Set(
      historicalBreakdown
        .filter((entry) => entry.year === targetYear)
        .map((entry) => entry.month)
    );
    return Array.from(monthSet)
      .sort((a, b) => a - b)
      .map((monthNumber) => ({ value: monthNumber, label: months[monthNumber - 1] }));
  }, [historicalBreakdown, historicalYearFilter, months]);

  const filteredHistoricalBreakdown = useMemo(() => {
    return historicalBreakdown.filter((entry) => {
      const yearMatch =
        historicalYearFilter === "all" || entry.year === Number(historicalYearFilter);
      const monthMatch =
        historicalMonthFilter === "all" || entry.month === Number(historicalMonthFilter);
      return yearMatch && monthMatch;
    });
  }, [historicalBreakdown, historicalYearFilter, historicalMonthFilter]);

  const aggregateProductsFromBreakdown = (data, key) => {
    const productMap = new Map();
    data.forEach((entry) => {
      (entry[key] || []).forEach((product) => {
        const existing = productMap.get(product.id) || {
          id: product.id,
          name: product.name,
          quantity: 0,
          revenue: 0,
          price: Number(product.price) || 0,
        };
        productMap.set(product.id, {
          ...existing,
          quantity: existing.quantity + (Number(product.quantity) || 0),
          revenue: existing.revenue + (Number(product.revenue) || 0),
        });
      });
    });

    return Array.from(productMap.values());
  };

  const historicalTopByQuantity = useMemo(() => {
    return aggregateProductsFromBreakdown(filteredHistoricalBreakdown, "topProducts")
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredHistoricalBreakdown]);

  const historicalTopByRevenue = useMemo(() => {
    return aggregateProductsFromBreakdown(filteredHistoricalBreakdown, "topRevenueProducts")
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredHistoricalBreakdown]);

  return (
    <div className="bg-white rounded-sm shadow overflow-hidden">
      {/* Header con controles de filtro */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-0.5 h-5 bg-emerald-500 rounded-sm shrink-0"></span>
            <h2 className="text-base font-semibold text-gray-800">Informe de Ventas</h2>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchSalesData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-sm"
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
              <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
                <h3 className="text-lg font-semibold">
                  Resumen de {months[selectedMonth]} {selectedYear}
                </h3>

                <div className="flex items-end gap-2">
                  <div>
                    <label htmlFor="summaryMonth" className="block text-xs font-medium text-gray-600 mb-1">
                      Mes
                    </label>
                    <select
                      id="summaryMonth"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                    >
                      {availableSummaryMonthsForYear.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="summaryYear" className="block text-xs font-medium text-gray-600 mb-1">
                      Año
                    </label>
                    <select
                      id="summaryYear"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                    >
                      {availableSummaryYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Barra de estadísticas unificada */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                {/* Ventas Totales */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-sm px-4 py-3">
                  <div className="p-1.5 bg-emerald-100 rounded-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-wide">Ventas Totales</p>
                    <p className="text-xl font-bold text-emerald-700 leading-tight">{monthlyData ? formatCurrency(monthlyData.totalSales) : "..."}</p>
                    <p className="text-[11px] text-emerald-600">{monthlyData?.salesCount || 0} ventas</p>
                  </div>
                </div>

                {/* Ventas Online */}
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-sm px-4 py-3">
                  <div className="p-1.5 bg-blue-100 rounded-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-blue-800 uppercase tracking-wide">Ventas Online</p>
                    <p className="text-xl font-bold text-blue-700 leading-tight">{monthlyData ? formatCurrency(monthlyData.onlineSales) : "..."}</p>
                    <p className="text-[11px] text-blue-600">{monthlyData?.onlineCount || 0} a través de la tienda</p>
                  </div>
                </div>

                {/* Ventas Externas */}
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-sm px-4 py-3">
                  <div className="p-1.5 bg-amber-100 rounded-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-amber-800 uppercase tracking-wide">Ventas Externas</p>
                    <p className="text-xl font-bold text-amber-700 leading-tight">{monthlyData ? formatCurrency(monthlyData.externalSalesTotal) : "..."}</p>
                    <p className="text-[11px] text-amber-600">{monthlyData?.externalCount || 0} registradas manualmente</p>
                  </div>
                </div>

                {/* Comisión Dev */}
                <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-sm px-4 py-3">
                  <div className="p-1.5 bg-purple-100 rounded-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-purple-800 uppercase tracking-wide">Comisión Dev ({developerCommissionRate}%)</p>
                    <p className="text-xl font-bold text-purple-700 leading-tight">{monthlyData ? formatCurrency(monthlyData.developerCommission) : "..."}</p>
                    <p className="text-[11px] text-purple-600">
                      Web: {monthlyData ? formatCurrency(monthlyData.onlineCommission) : "..."} + Externas: {monthlyData ? formatCurrency(monthlyData.externalCommission) : "..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Producto más vendido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Producto Más Vendido
                  </h4>

                  {monthlyData?.topProduct ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-sm p-3 mr-4">
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
                            <p className="text-xs text-gray-500">Cantidad vendida</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {monthlyData.topProduct.quantity} unidades
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ingresos generados</p>
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

                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Producto con Mayores Ingresos
                  </h4>

                  {monthlyData?.topRevenueProduct ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-100 rounded-sm p-3 mr-4">
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
                          Precio: {formatCurrency(monthlyData.topRevenueProduct.price)}
                        </p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Cantidad vendida</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {monthlyData.topRevenueProduct.quantity} unidades
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ingresos generados</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatCurrency(monthlyData.topRevenueProduct.revenue)}
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
              <div className="bg-white border border-gray-200 rounded-sm p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Top Productos por Ventas
                </h4>

                {monthlyData?.topProducts && monthlyData.topProducts.length > 0 ? (
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
              <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
                <h3 className="text-lg font-semibold">
                  Detalle de Ventas - {months[selectedMonth]} {selectedYear}
                </h3>

                <div className="flex items-end gap-2">
                  <div>
                    <label htmlFor="detailMonth" className="block text-xs font-medium text-gray-600 mb-1">
                      Mes
                    </label>
                    <select
                      id="detailMonth"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                    >
                      {availableSummaryMonthsForYear.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="detailYear" className="block text-xs font-medium text-gray-600 mb-1">
                      Año
                    </label>
                    <select
                      id="detailYear"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                    >
                      {availableSummaryYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
                                  {order.orderNumber || `#${shortCode(order.id)}`}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {order.customer}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-sm 
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
                                  {Array.isArray(order.items) && order.items.length > 0 ? (
                                    <ul className="list-disc pl-4">
                                      {order.items.slice(0, 3).map((item, index) => (
                                        <li key={index} className="truncate max-w-xs">
                                          {item.quantity}x {item.title || item.name}
                                        </li>
                                      ))}
                                      {order.items.length > 3 && (
                                        <li className="text-gray-400 italic">
                                          +{order.items.length - 3} más...
                                        </li>
                                      )}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-400">Sin productos</span>
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
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Comisión
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
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-sm ${
                                      sale.hasCommission
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {sale.hasCommission ? "Con comisión" : "Sin comisión"}
                                  </span>
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
              <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
                <h3 className="text-lg font-semibold">Histórico de Ventas</h3>

                <div className="flex items-end gap-2">
                  <div>
                    <label htmlFor="historicalYear" className="block text-xs font-medium text-gray-600 mb-1">
                      Año
                    </label>
                    <select
                      id="historicalYear"
                      value={historicalYearFilter}
                      onChange={(e) => {
                        setHistoricalYearFilter(e.target.value);
                        setHistoricalMonthFilter("all");
                      }}
                      className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                    >
                      <option value="all">Todos</option>
                      {historicalYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="historicalMonth" className="block text-xs font-medium text-gray-600 mb-1">
                      Mes
                    </label>
                    <select
                      id="historicalMonth"
                      value={historicalMonthFilter}
                      onChange={(e) => setHistoricalMonthFilter(e.target.value)}
                      className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                    >
                      <option value="all">Todos</option>
                      {historicalMonthsForYear.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tarjetas de estadísticas generales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 border border-purple-100 rounded-sm p-4">
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

                <div className="bg-blue-50 border border-blue-100 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Pedidos Online
                  </h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {allTimeData ? formatCurrency(allTimeData.onlineSales) : "-"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {allTimeData?.onlineCount || 0} pedidos online registrados
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">
                    Ventas Externas
                  </h4>
                  <p className="text-2xl font-bold text-amber-700">
                    {allTimeData ? formatCurrency(allTimeData.externalSalesTotal) : "-"}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {allTimeData?.externalCount || 0} ventas externas registradas
                  </p>
                </div>
              </div>

              {/* Gráfico de ventas por mes */}
              <div className="bg-white border border-gray-200 rounded-sm p-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Evolución de Ventas
                </h4>

                {filteredHistoricalBreakdown && filteredHistoricalBreakdown.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={filteredHistoricalBreakdown}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="yearMonth"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const [year, month] = String(value).split("-");
                            const monthLabel = months[Number(month) - 1] || value;
                            return `${monthLabel.substring(0, 3)}-${year?.slice?.(2) || ""}`;
                          }}
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
                          formatter={(value) => [formatCurrency(value), "Ventas"]}
                          labelFormatter={(value) => {
                            const [year, month] = String(value).split("-");
                            const monthLabel = months[Number(month) - 1] || value;
                            return `${monthLabel} ${year}`;
                          }}
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
              <div className="bg-white border border-gray-200 rounded-sm p-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Top 10 Productos por Ventas
                </h4>

                {historicalTopByQuantity.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={historicalTopByQuantity}
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
                            value.length > 20 ? `${value.substring(0, 20)}...` : value
                          }
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" name="Cantidad Vendida" fill="#3b82f6" />
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
              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Top Productos por Ingresos
                </h4>

                {historicalTopByRevenue.length > 0 ? (
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
                        {historicalTopByRevenue.map((product) => (
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
