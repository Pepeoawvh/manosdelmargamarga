import React, { useEffect, useMemo } from "react";
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

function downloadWorkbookBuffer(buffer, fileName) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function createStyledWorksheet(workbook, config) {
  const {
    name,
    title,
    metaRows = [],
    headers = [],
    rows = [],
    columnWidths = [],
    currencyColumns = [],
    centerColumns = [],
  } = config;

  const worksheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: metaRows.length + 3 }],
  });

  worksheet.properties.defaultRowHeight = 20;
  worksheet.columns = columnWidths.map((width) => ({ width }));

  const totalColumns = Math.max(headers.length, columnWidths.length, 1);
  const lastColumnLetter = worksheet.getColumn(totalColumns).letter;

  worksheet.mergeCells(`A1:${lastColumnLetter}1`);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "0F766E" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  metaRows.forEach((metaRow, index) => {
    const row = worksheet.getRow(index + 2);
    metaRow.forEach((value, colIndex) => {
      row.getCell(colIndex + 1).value = value;
    });
    row.font = { size: 10, color: { argb: "475569" } };
  });

  const headerRowIndex = metaRows.length + 3;
  const headerRow = worksheet.getRow(headerRowIndex);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "134E4A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  headerRow.height = 22;

  rows.forEach((rowValues, rowIndex) => {
    const row = worksheet.getRow(headerRowIndex + 1 + rowIndex);
    rowValues.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.alignment = {
        vertical: "middle",
        horizontal: centerColumns.includes(colIndex + 1) ? "center" : "left",
        wrapText: true,
      };
      if (currencyColumns.includes(colIndex + 1) && typeof value === "number") {
        cell.numFmt = '$ #,##0';
      }
    });

    const fillColor = rowIndex % 2 === 0 ? "FFFFFFFF" : "F8FAFC";
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "E5E7EB" } },
        left: { style: "thin", color: { argb: "E5E7EB" } },
        bottom: { style: "thin", color: { argb: "E5E7EB" } },
        right: { style: "thin", color: { argb: "E5E7EB" } },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
    });
  });

  worksheet.autoFilter = {
    from: { row: headerRowIndex, column: 1 },
    to: { row: headerRowIndex, column: headers.length || 1 },
  };

  return worksheet;
}

async function createWorkbook() {
  const ExcelJSModule = await import("exceljs");
  const ExcelJS = ExcelJSModule.default || ExcelJSModule;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GitHub Copilot";
  workbook.created = new Date();
  workbook.modified = new Date();
  return workbook;
}

async function saveWorkbook(workbook, fileName) {
  const buffer = await workbook.xlsx.writeBuffer();
  downloadWorkbookBuffer(buffer, fileName);
}

function buildSummaryRows(items) {
  return items.map(([label, value]) => [label, value]);
}

function safeItemsSummary(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((item) => `${item.quantity || 1}x ${item.title || item.name || "Producto"}`)
    .join(" | ");
}

function currencyDisplay(value) {
  if (typeof value !== "number") return value;
  return value;
}

function buildMetaRows(periodLabel) {
  return [
    ["Periodo", periodLabel],
    ["Generado", new Date().toLocaleString("es-CL")],
  ];
}

function buildHistoricalMetaRows(periodLabel) {
  return [
    ["Periodo analizado", periodLabel],
    ["Generado", new Date().toLocaleString("es-CL")],
  ];
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

  const monthlyChannelData = useMemo(() => {
    if (!monthlyData) return [];
    return [
      { name: "Online", total: monthlyData.onlineSales || 0 },
      { name: "Externas", total: monthlyData.externalSalesTotal || 0 },
    ];
  }, [monthlyData]);

  const monthlyTopProductsChart = useMemo(() => {
    if (!monthlyData?.topProducts?.length) return [];
    return monthlyData.topProducts.slice(0, 8);
  }, [monthlyData]);

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
    return aggregateProductsFromBreakdown(historicalBreakdown, "topProducts")
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [historicalBreakdown]);

  const historicalTopByRevenue = useMemo(() => {
    return aggregateProductsFromBreakdown(historicalBreakdown, "topRevenueProducts")
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [historicalBreakdown]);

  const annualSummary = useMemo(() => {
    const byYear = new Map();
    historicalBreakdown.forEach((entry) => {
      const curr = byYear.get(entry.year) || {
        year: entry.year,
        total: 0,
        onlineSales: 0,
        externalSalesTotal: 0,
        count: 0,
        monthsWithData: 0,
      };

      byYear.set(entry.year, {
        ...curr,
        total: curr.total + (Number(entry.total) || 0),
        onlineSales: curr.onlineSales + (Number(entry.onlineSales) || 0),
        externalSalesTotal: curr.externalSalesTotal + (Number(entry.externalSalesTotal) || 0),
        count: curr.count + (Number(entry.count) || 0),
        monthsWithData: curr.monthsWithData + 1,
      });
    });

    return Array.from(byYear.values()).sort((a, b) => b.year - a.year);
  }, [historicalBreakdown]);

  const historicalPeriodLabel = useMemo(() => {
    if (!availablePeriodsDesc.length) return "Sin períodos";
    const newest = availablePeriodsDesc[0];
    const oldest = availablePeriodsDesc[availablePeriodsDesc.length - 1];
    return `${months[oldest.month - 1]} ${oldest.year} - ${months[newest.month - 1]} ${newest.year}`;
  }, [availablePeriodsDesc, months]);

  const exportMonthlyReport = async () => {
    if (!monthlyData) return;

    const periodLabel = `${months[selectedMonth]} ${selectedYear}`;
    const workbook = await createWorkbook();
    const fileMonth = String(selectedMonth + 1).padStart(2, "0");

    createStyledWorksheet(workbook, {
      name: "Resumen",
      title: "Reporte mensual general",
      metaRows: buildMetaRows(periodLabel),
      headers: ["Indicador", "Valor"],
      rows: buildSummaryRows([
        ["Ventas totales", formatCurrency(monthlyData.totalSales || 0)],
        ["Ventas online", formatCurrency(monthlyData.onlineSales || 0)],
        ["Ventas externas", formatCurrency(monthlyData.externalSalesTotal || 0)],
        ["Cantidad total de ventas", monthlyData.salesCount || 0],
        ["Cantidad ventas online", monthlyData.onlineCount || 0],
        ["Cantidad ventas externas", monthlyData.externalCount || 0],
        ["Ventas externas con comisión", monthlyData.externalWithCommissionCount || 0],
        [`Comisión dev ${developerCommissionRate}%`, formatCurrency(monthlyData.developerCommission || 0)],
        ["Comisión online", formatCurrency(monthlyData.onlineCommission || 0)],
        ["Comisión externas", formatCurrency(monthlyData.externalCommission || 0)],
      ]),
      columnWidths: [34, 20],
      centerColumns: [2],
    });

    createStyledWorksheet(workbook, {
      name: "Top productos",
      title: "Top productos del mes",
      metaRows: buildMetaRows(periodLabel),
      headers: ["Producto", "Precio unitario", "Cantidad", "Ingresos"],
      rows: (monthlyData.topProducts || []).map((product) => [
        product.name,
        currencyDisplay(product.price || 0),
        product.quantity || 0,
        currencyDisplay(product.revenue || 0),
      ]),
      columnWidths: [42, 18, 12, 18],
      currencyColumns: [2, 4],
      centerColumns: [3],
    });

    createStyledWorksheet(workbook, {
      name: "Ventas online",
      title: "Detalle de ventas online",
      metaRows: buildMetaRows(periodLabel),
      headers: ["Fecha", "Orden", "Cliente", "Estado", "Metodo de pago", "Total", "Productos"],
      rows: orders.map((order) => [
        formatDate(order.date),
        order.orderNumber || `#${shortCode(order.id)}`,
        order.customer,
        order.status,
        order.paymentMethod || "webpay",
        currencyDisplay(order.total || 0),
        safeItemsSummary(order.items),
      ]),
      columnWidths: [14, 14, 28, 18, 18, 14, 60],
      currencyColumns: [6],
      centerColumns: [1, 2, 4, 5],
    });

    createStyledWorksheet(workbook, {
      name: "Ventas externas",
      title: "Detalle de ventas externas",
      metaRows: buildMetaRows(periodLabel),
      headers: ["Fecha", "Cliente", "Descripcion", "Metodo de pago", "Comision", "Monto"],
      rows: externalSales.map((sale) => [
        formatDate(sale.date),
        sale.customer,
        sale.description,
        sale.paymentMethod,
        sale.hasCommission ? "Si" : "No",
        currencyDisplay(sale.total || 0),
      ]),
      columnWidths: [14, 28, 48, 18, 14, 14],
      currencyColumns: [6],
      centerColumns: [1, 4, 5],
    });

    await saveWorkbook(workbook, `reporte-mensual-${selectedYear}-${fileMonth}.xlsx`);
  };

  const exportHistoricalReport = async () => {
    if (!allTimeData) return;
    const workbook = await createWorkbook();

    createStyledWorksheet(workbook, {
      name: "Resumen",
      title: "Informe general historico",
      metaRows: buildHistoricalMetaRows(historicalPeriodLabel),
      headers: ["Indicador", "Valor"],
      rows: buildSummaryRows([
        ["Ventas totales historicas", formatCurrency(allTimeData.totalSales || 0)],
        ["Ventas online historicas", formatCurrency(allTimeData.onlineSales || 0)],
        ["Ventas externas historicas", formatCurrency(allTimeData.externalSalesTotal || 0)],
        ["Cantidad total de ventas", allTimeData.salesCount || 0],
        ["Cantidad pedidos online", allTimeData.onlineCount || 0],
        ["Cantidad ventas externas", allTimeData.externalCount || 0],
      ]),
      columnWidths: [34, 20],
      centerColumns: [2],
    });

    createStyledWorksheet(workbook, {
      name: "Ventas mensuales",
      title: "Ventas mensuales historicas",
      metaRows: buildHistoricalMetaRows(historicalPeriodLabel),
      headers: ["Periodo", "Ventas web", "Ventas externas", "Ventas totales", "Cantidad ventas"],
      rows: historicalBreakdown.map((entry) => [
        `${months[entry.month - 1]} ${entry.year}`,
        currencyDisplay(entry.onlineSales || 0),
        currencyDisplay(entry.externalSalesTotal || 0),
        currencyDisplay(entry.total || 0),
        entry.count || 0,
      ]),
      columnWidths: [18, 16, 18, 18, 16],
      currencyColumns: [2, 3, 4],
      centerColumns: [5],
    });

    createStyledWorksheet(workbook, {
      name: "Resumen anual",
      title: "Resumen anual consolidado",
      metaRows: buildHistoricalMetaRows(historicalPeriodLabel),
      headers: ["Año", "Ventas totales", "Online", "Externas", "Cantidad ventas", "Meses con datos"],
      rows: annualSummary.map((row) => [
        row.year,
        currencyDisplay(row.total || 0),
        currencyDisplay(row.onlineSales || 0),
        currencyDisplay(row.externalSalesTotal || 0),
        row.count || 0,
        row.monthsWithData || 0,
      ]),
      columnWidths: [10, 18, 16, 16, 16, 16],
      currencyColumns: [2, 3, 4],
      centerColumns: [1, 5, 6],
    });

    createStyledWorksheet(workbook, {
      name: "Top unidades",
      title: "Top productos historicos por unidades",
      metaRows: buildHistoricalMetaRows(historicalPeriodLabel),
      headers: ["Producto", "Precio unitario", "Cantidad", "Ingresos"],
      rows: historicalTopByQuantity.map((product) => [
        product.name,
        currencyDisplay(product.price || 0),
        product.quantity || 0,
        currencyDisplay(product.revenue || 0),
      ]),
      columnWidths: [40, 18, 12, 18],
      currencyColumns: [2, 4],
      centerColumns: [3],
    });

    createStyledWorksheet(workbook, {
      name: "Top ingresos",
      title: "Top productos historicos por ingresos",
      metaRows: buildHistoricalMetaRows(historicalPeriodLabel),
      headers: ["Producto", "Precio unitario", "Cantidad", "Ingresos"],
      rows: historicalTopByRevenue.map((product) => [
        product.name,
        currencyDisplay(product.price || 0),
        product.quantity || 0,
        currencyDisplay(product.revenue || 0),
      ]),
      columnWidths: [40, 18, 12, 18],
      currencyColumns: [2, 4],
      centerColumns: [3],
    });

    await saveWorkbook(workbook, "informe-general-historico.xlsx");
  };

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
                <div>
                  <h3 className="text-lg font-semibold">
                    Resumen de {months[selectedMonth]} {selectedYear}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Exportable a Google Sheets o Excel en formato XLSX
                  </p>
                </div>

                <div className="flex flex-wrap items-end gap-2 justify-end">
                  <button
                    type="button"
                    onClick={exportMonthlyReport}
                    className="h-9 px-3 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-sm text-sm font-medium hover:bg-emerald-100 transition-colors"
                  >
                    Descargar Mes XLSX
                  </button>
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

              {/* Gráficos del período seleccionado */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Distribución de Ventas del Mes
                  </h4>

                  {monthlyChannelData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyChannelData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis
                            tickFormatter={(value) =>
                              new Intl.NumberFormat("es", {
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(value)
                            }
                          />
                          <Tooltip formatter={(value) => [formatCurrency(value), "Ventas"]} />
                          <Legend />
                          <Bar dataKey="total" name="Monto" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-10">
                      No hay datos para este período
                    </p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Top Productos del Mes (Unidades)
                  </h4>

                  {monthlyTopProductsChart.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyTopProductsChart}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={140}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) =>
                              value.length > 18 ? `${value.substring(0, 18)}...` : value
                            }
                          />
                          <Tooltip
                            formatter={(value, key) =>
                              key === "quantity"
                                ? [`${value} unidades`, "Cantidad"]
                                : [formatCurrency(value), "Ingresos"]
                            }
                          />
                          <Legend />
                          <Bar dataKey="quantity" name="Cantidad" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-10">
                      No hay productos vendidos para este período
                    </p>
                  )}
                </div>
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
                <div>
                  <h3 className="text-lg font-semibold">Histórico General de Ventas</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Período analizado: {historicalPeriodLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportHistoricalReport}
                  className="h-9 px-3 border border-blue-200 bg-blue-50 text-blue-800 rounded-sm text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Descargar Histórico XLSX
                </button>
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
                  Ventas por Mes: Web vs Externas
                </h4>

                {historicalBreakdown && historicalBreakdown.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={historicalBreakdown}
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
                          formatter={(value, name) => [formatCurrency(value), name]}
                          labelFormatter={(value) => {
                            const [year, month] = String(value).split("-");
                            const monthLabel = months[Number(month) - 1] || value;
                            return `${monthLabel} ${year}`;
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="onlineSales"
                          name="Ventas Web"
                          stroke="#2563eb"
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="externalSalesTotal"
                          name="Ventas Externas"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
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

              {/* Resumen anual */}
              <div className="bg-white border border-gray-200 rounded-sm p-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Resumen Anual Consolidado
                </h4>

                {annualSummary.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Totales</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Externas</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Meses con Datos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {annualSummary.map((row) => (
                          <tr key={row.year} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.year}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(row.total)}</td>
                            <td className="px-4 py-3 text-sm text-right text-blue-700">{formatCurrency(row.onlineSales)}</td>
                            <td className="px-4 py-3 text-sm text-right text-amber-700">{formatCurrency(row.externalSalesTotal)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-700">{row.count}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-700">{row.monthsWithData}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay datos históricos para consolidar
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
