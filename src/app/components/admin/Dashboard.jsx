import React, { useMemo } from "react";
import useSalesReport from "@/app/hooks/admin/useSalesReport";
import Table from "@/app/components/ui/Table";
import Link from "next/link";

export default function Dashboard({
  products = [],
  orders = [],
  onChangeTab,
  onOpenAddProductForm,
}) {
  const { allTimeData, monthlyData, formatCurrency } = useSalesReport();

  // Pedidos operativos: status definido y distinto de FINALIZADO/CANCELADO (no mira pago)
  const operationalOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    // Deduplicar por id/orderId
    const seen = new Set();
    const unique = [];
    for (const o of orders) {
      const key = o?.id || o?.orderId;
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(o);
      } else {
        console.log("DUPLICADO IGNORADO:", { id: o?.id, orderId: o?.orderId });
      }
    }

const result = unique.filter((o) => {
  const raw = o?.status;
  const s = String(raw ?? "").trim();         // puede ser "pendiente" del fallback
  const S = s.toUpperCase();

  const hasExplicitStatus = s.length > 0;

  // Señales de intento no autorizado (ruido)
  const pay = String(o?.paymentStatus || "").toLowerCase();
  const resp = o?.transactionDetails?.response_code;
  const trStatus = o?.transactionDetails?.status;

  const isUnauthorizedPending =
    pay === "pending" &&
    !(typeof resp === "number" && resp === 0) &&
    trStatus !== "AUTHORIZED";

  // Regla final: status definido, no FINALIZADO ni CANCELADO,
  // y excluir el fallback "pendiente" del hook o intentos no autorizados.
  const keep =
    hasExplicitStatus &&
    S !== "FINALIZADO" &&
    S !== "CANCELADO" &&
    s !== "pendiente" &&
    !isUnauthorizedPending;

  console.log("OPER_EVAL", {
    id: o?.id,
    orderNumber: o?.orderNumber,
    rawStatus: raw,
    normalized: S,
    hasExplicitStatus,
    pay,
    resp,
    trStatus,
    isUnauthorizedPending,
    keep,
  });

  return keep;
});


    console.log("OPER_RESULT_COUNT", result.length);
    return result;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => (p.stock || 0) < 5);
  }, [products]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date instanceof Date ? date : new Date(date));
  };

  const operationalColumns = [
    { key: "orderNumber", label: "Nº Orden" },
    {
      key: "customer",
      label: "Cliente",
      render: (row) => {
        if (row.customerName) return row.customerName;
        if (row.customer && typeof row.customer === "object") {
          const firstName = row.customer.firstName || "";
          const lastName = row.customer.lastName || "";
          return `${firstName} ${lastName}`.trim() || "Cliente sin nombre";
        }
        return "Cliente";
      },
    },
    { key: "date", label: "Fecha", render: (row) => formatDate(row.date) },
    {
      key: "total",
      label: "Total",
      render: (row) => (formatCurrency ? formatCurrency(row.total) : row.total),
      className: "text-right font-medium",
    },
  ];

  const featuredCount = useMemo(
    () => products.filter((p) => p.featured).length,
    [products]
  );

  return (
    <div className="bg-white rounded-sm shadow-sm">
      {/* Barra de resumen unificada */}
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-b border-gray-200">
        {/* Productos */}
        <div className="flex-1 flex items-center gap-3 bg-emerald-50 px-4 py-3">
          <div className="p-1.5 bg-emerald-100 rounded-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-wide">Productos</p>
            <p className="text-xl font-bold text-emerald-700 leading-tight">{products.length}</p>
            <p className="text-[11px] text-emerald-600">{featuredCount} destacados</p>
          </div>
        </div>

        {/* Pedidos */}
        <div className="flex-1 flex items-center gap-3 bg-blue-50 px-4 py-3">
          <div className="p-1.5 bg-blue-100 rounded-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-blue-800 uppercase tracking-wide">Pedidos</p>
            <p className="text-xl font-bold text-blue-700 leading-tight">{operationalOrders.length}</p>
            <p className="text-[11px] text-blue-600">En proceso</p>
          </div>
        </div>

        {/* Ventas mensuales */}
        <div className="flex-1 flex items-center gap-3 bg-amber-50 px-4 py-3">
          <div className="p-1.5 bg-amber-100 rounded-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-amber-800 uppercase tracking-wide">Ventas Mensual</p>
            <p className="text-xl font-bold text-amber-700 leading-tight">{monthlyData ? formatCurrency(monthlyData.totalSales) : "..."}</p>
            <p className="text-[11px] text-amber-600">{monthlyData?.salesCount || 0} ventas</p>
          </div>
        </div>

        {/* Total histórico */}
        <div className="flex-1 flex items-center gap-3 bg-purple-50 px-4 py-3">
          <div className="p-1.5 bg-purple-100 rounded-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-medium text-purple-800 uppercase tracking-wide">Total Histórico</p>
            <p className="text-xl font-bold text-purple-700 leading-tight">{allTimeData ? formatCurrency(allTimeData.totalSales) : "..."}</p>
            <p className="text-[11px] text-purple-600">{allTimeData?.salesCount || 0} ventas totales</p>
          </div>
        </div>
      </div>

      {/* Secciones principales del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3">
        {/* Pedidos en proceso */}
        <div className="lg:col-span-2 border border-gray-200 rounded-sm overflow-hidden">
          <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200 flex items-center gap-2">
            <span className="w-0.5 h-4 bg-blue-400 rounded-sm shrink-0"></span>
            <h3 className="text-sm font-medium text-gray-700">Pedidos en Proceso</h3>
          </div>
          {operationalOrders.length > 0 ? (
            <div className="p-2">
              <Table
                dense
                columns={operationalColumns}
                data={operationalOrders.slice(0, 5)}
                onRowClick={() => onChangeTab && onChangeTab("Pedidos")}
                emptyMessage="No hay pedidos en proceso"
                pagination={false}
              />
              {operationalOrders.length > 5 && (
                <div className="mt-2 text-right p-2">
                  <button
                    onClick={() => onChangeTab && onChangeTab("Pedidos")}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Ver todos los pedidos en proceso ({operationalOrders.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-5 text-center text-gray-500 text-sm">
              No hay pedidos en proceso
            </div>
          )}
        </div>

        {/* Productos con bajo stock */}
        <div className="border border-gray-200 rounded-sm overflow-hidden">
          <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200 flex items-center gap-2">
            <span className="w-0.5 h-4 bg-amber-400 rounded-sm shrink-0"></span>
            <h3 className="text-sm font-medium text-gray-700">Bajo Stock</h3>
          </div>
          <div className="p-2">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-1.5">
                {lowStockProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded-sm">
                    <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} className="h-9 w-9 object-cover rounded-sm" />
                      ) : (
                        <div className="h-9 w-9 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 012 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{product.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{product.category}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium ${product.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {product.stock || 0} disponibles
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center text-gray-500 text-sm">No hay productos con bajo stock</div>
            )}
            {lowStockProducts.length > 6 && (
              <div className="mt-2 text-right">
                <button onClick={() => onChangeTab && onChangeTab("Inventario")} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                  Ver todos ({lowStockProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-0.5 h-4 bg-emerald-500 rounded-sm shrink-0"></span>
          <h3 className="text-sm font-medium text-gray-700">Acciones Rápidas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onOpenAddProductForm && onOpenAddProductForm()} className="bg-emerald-600 text-white py-1.5 px-3 text-xs rounded-sm hover:bg-emerald-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>
    </div>
  );
}
