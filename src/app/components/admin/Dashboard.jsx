import React, { useEffect, useState } from 'react';
import useSalesReport from '@/app/hooks/admin/useSalesReport';
import Table from '@/app/components/ui/Table';
import Link from 'next/link';

export default function Dashboard({ products, orders, onChangeTab, onOpenAddProductForm }) {
  const { allTimeData, monthlyData, formatCurrency } = useSalesReport();
  
  // Estados para información derivada
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  // Procesar datos cuando cambian
  useEffect(() => {
    // Filtrar pedidos pendientes
    if (Array.isArray(orders)) {
      const pending = orders.filter(order => order.status === "PENDIENTE");
      setPendingOrders(pending);
    }
    
    // Filtrar productos con bajo stock
    if (Array.isArray(products)) {
      const lowStock = products.filter(p => (p.stock || 0) < 5);
      setLowStockProducts(lowStock);
    }
  }, [products, orders]);
  
  // Formato de fecha simplificado
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date instanceof Date ? date : new Date(date));
  };

  // Columnas para la tabla de pedidos pendientes
  const pendingOrdersColumns = [
    { key: 'orderNumber', label: 'Nº Orden' },
    { 
      key: 'customer', 
      label: 'Cliente',
      render: (row) => {
        // Si customerName existe, úsalo
        if (row.customerName) {
          return row.customerName;
        }
        // Si customer es un objeto, intenta formatearlo
        if (row.customer && typeof row.customer === 'object') {
          const firstName = row.customer.firstName || '';
          const lastName = row.customer.lastName || '';
          return `${firstName} ${lastName}`.trim() || 'Cliente sin nombre';
        }
        // Fallback
        return 'Cliente';
      }
    },
    { key: 'date', label: 'Fecha', render: (row) => formatDate(row.date) },
    { 
      key: 'total', 
      label: 'Total', 
      render: (row) => formatCurrency ? formatCurrency(row.total) : row.total,
      className: 'text-right font-medium'
    }
  ];
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-emerald-800">Productos</h3>
              <p className="text-xl font-bold text-emerald-700">{products.length}</p>
              <p className="text-xs text-emerald-600">
                {products.filter(p => p.featured).length} destacados
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Pedidos</h3>
              <p className="text-xl font-bold text-blue-700">{Array.isArray(orders) ? orders.length : 0}</p>
              <p className="text-xs text-blue-600">
                {pendingOrders.length} pendientes
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Ventas Mensual</h3>
              <p className="text-xl font-bold text-amber-700">
                {monthlyData ? formatCurrency(monthlyData.totalSales) : "..."}
              </p>
              <p className="text-xs text-amber-600">
                {monthlyData?.salesCount || 0} ventas
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800">Total Histórico</h3>
              <p className="text-xl font-bold text-purple-700">
                {allTimeData ? formatCurrency(allTimeData.totalSales) : "..."}
              </p>
              <p className="text-xs text-purple-600">
                {allTimeData?.salesCount || 0} ventas totales
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secciones principales del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Pedidos pendientes */}
        <div className="lg:col-span-2 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">Pedidos Pendientes</h3>
          </div>
          {pendingOrders.length > 0 ? (
            <div className="p-2">
              <Table 
                columns={pendingOrdersColumns}
                data={pendingOrders.slice(0, 5)}
                onRowClick={(row) => {
                  // Cambiar a pestaña de pedidos
                  onChangeTab && onChangeTab("Pedidos");
                }}
                emptyMessage="No hay pedidos pendientes"
                pagination={false}
              />
              {pendingOrders.length > 5 && (
                <div className="mt-2 text-right p-2">
                  <button 
                    onClick={() => onChangeTab && onChangeTab("Pedidos")}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Ver todos los pedidos pendientes ({pendingOrders.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500 text-sm">
              No hay pedidos pendientes
            </div>
          )}
        </div>

        {/* Productos con bajo stock */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">Bajo Stock</h3>
          </div>
          <div className="p-2">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 6).map(product => (
                  <div key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.category}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock || 0} disponibles
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500 text-sm">
                No hay productos con bajo stock
              </div>
            )}
            {lowStockProducts.length > 6 && (
              <div className="mt-2 text-right">
                <button 
                  onClick={() => onChangeTab && onChangeTab("Inventario")}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Ver todos ({lowStockProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
 {/* Acciones rápidas */}
 <div className="border-t border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onOpenAddProductForm && onOpenAddProductForm()}
            className="bg-emerald-600 text-white py-1.5 px-3 text-xs rounded hover:bg-emerald-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>
    </div>
  );
}