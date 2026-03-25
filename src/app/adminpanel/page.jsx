"use client";
import useAdminPanel from "../hooks/admin/useAdminPanel";
import ProductForm from "../components/product/ProductForm";
import InventoryManager from "../components/admin/InventoryManager";
import TabSystem from "../components/ui/TabSystem";
import OrderTable from "../components/admin/OrderTable";
import ReservationTable from "../components/admin/ReservationTable";
import CarouselManager from "@/app/components/admin/CarouselManager";
import SalesReport from "../components/admin/SalesReport";
import Dashboard from "../components/admin/Dashboard";
import ExternalSaleForm from "../components/admin/ExternalSalesForm";
import { useState, useEffect, useMemo } from "react";

export default function AdminPanel() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoggedIn,
    showForm,
    setShowForm,
    editingProduct,
    setEditingProduct,
    products,
    orders,
    externalOrders,
    loading,
    loadingOrders,
    loadingExternalOrders,
    reservations,
    loadingReservations,
    // Handlers
    handleLogin,
    handleLogout,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleFeatured,
    // Funciones para pedidos
    formatDate,
    getPaymentStatusClass,
    getPaymentStatusText,
    getStatusClass,
    updateOrderStatus,
    updateExternalSaleStatus,
    updateExternalSaleOrderDetails,
    formatAddress,
    addExternalSaleOrder,
    // Funciones para reservas
    deleteReservation,
    updateReservationStatus,
    updateReservationQuantity,
    // IMPORTANTE: Asegúrate de extraer esta función del hook
    assignOrderNumber,
  } = useAdminPanel();

  // Estado para controlador de cliente
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validación de email
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Sanitización de inputs
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, "");
  };

  // Handlers para cambios en inputs
  const handleEmailChange = (e) => {
    const sanitizedEmail = sanitizeInput(e.target.value);
    setEmail(sanitizedEmail);
  };

  const handlePasswordChange = (e) => {
    const sanitizedPassword = sanitizeInput(e.target.value);
    setPassword(sanitizedPassword);
  };

  // Handler para submit con validación
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      alert("Por favor, ingresa un correo electrónico válido");
      return;
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    handleLogin(e);
  };

  // Componente para la pestaña del Dashboard
  const DashboardTab = ({ onChangeTab, onOpenAddProductForm }) => (
    <Dashboard 
      products={products} 
      orders={orders} 
      onChangeTab={onChangeTab}
      onOpenAddProductForm={onOpenAddProductForm}
    />
  );
  const OrdersTab = () => {
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [showExternalForm, setShowExternalForm] = useState(false);
    const [orderTypeFilter, setOrderTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

    const normalizedWebOrders = useMemo(
      () =>
        (Array.isArray(orders) ? orders : []).map((order) => ({
          ...order,
          sourceType: "web",
          isExternalSale: false,
        })),
      [orders]
    );

    const normalizedExternalOrders = useMemo(
      () =>
        (Array.isArray(externalOrders) ? externalOrders : []).map((order) => ({
          ...order,
          sourceType: "external",
          isExternalSale: true,
        })),
      [externalOrders]
    );

    const requestCombinedSort = (field) => {
      setSortConfig((prev) => ({
        key: field,
        direction: prev.key === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    };

    const combinedOrders = useMemo(() => {
      const merged = [...normalizedWebOrders, ...normalizedExternalOrders];

      const filtered = merged.filter((order) => {
        if (orderTypeFilter === "web" && order.sourceType !== "web") return false;
        if (orderTypeFilter === "external" && order.sourceType !== "external") return false;

        if (statusFilter !== "all" && (order.status || "") !== statusFilter) return false;

        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;

        const dateObj = new Date(order.date);
        const dateFormats = Number.isNaN(dateObj.getTime())
          ? []
          : [
              dateObj.toLocaleDateString("es-CL"),
              dateObj.toLocaleDateString("es-ES"),
              dateObj.toISOString().slice(0, 10),
            ];

        const searchableFields = [
          order.customerName,
          order.customerEmail,
          order.orderNumber,
          order.orderShortCode,
          order.description,
          ...dateFormats,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        return searchableFields.some((value) => value.includes(query));
      });

      const sorted = [...filtered].sort((a, b) => {
        const direction = sortConfig.direction === "asc" ? 1 : -1;

        if (sortConfig.key === "date") {
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        if (sortConfig.key === "total") {
          return direction * ((Number(a.total) || 0) - (Number(b.total) || 0));
        }

        const aValue = String(a?.[sortConfig.key] || "").toLowerCase();
        const bValue = String(b?.[sortConfig.key] || "").toLowerCase();
        return direction * aValue.localeCompare(bValue);
      });

      return sorted;
    }, [
      normalizedWebOrders,
      normalizedExternalOrders,
      orderTypeFilter,
      statusFilter,
      searchTerm,
      sortConfig,
    ]);

    const availableStatuses = useMemo(() => {
      const statuses = new Set(
        [...normalizedWebOrders, ...normalizedExternalOrders]
          .map((order) => order.status)
          .filter(Boolean)
      );
      return Array.from(statuses).sort((a, b) => a.localeCompare(b));
    }, [normalizedWebOrders, normalizedExternalOrders]);

    const handleAddExternalSale = async (saleData) => {
      const result = await addExternalSaleOrder(saleData);
      if (result.success) {
        setShowExternalForm(false);
      } else {
        alert(result.error || "No se pudo registrar la venta externa");
      }
    };

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
      const order = combinedOrders.find((item) => item.id === orderId);

      if (order?.sourceType === "external") {
        return updateExternalSaleStatus(orderId, newStatus);
      }

      return updateOrderStatus(orderId, newStatus);
    };

    // Logging para verificar disponibilidad de la función
    console.log(
      "¿assignOrderNumber está disponible?",
      typeof assignOrderNumber === "function"
    );

    return (
      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-gray-700">Gestión de Pedidos</h2>
            <p className="text-xs text-gray-500 mt-1">
              Pedidos web y ventas externas en una sola vista operativa.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-full">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Filtrar por:
                </label>
              </div>

              <div>
                <label htmlFor="orderTypeFilter" className="block text-xs font-medium text-gray-600 mb-1">
                  Tipo
                </label>
                <select
                  id="orderTypeFilter"
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="web">Solo Web</option>
                  <option value="external">Solo Externas</option>
                </select>
              </div>

              <div>
                <label htmlFor="orderStatusFilter" className="block text-xs font-medium text-gray-600 mb-1">
                  Estado
                </label>
                <select
                  id="orderStatusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 border border-gray-300 rounded-sm text-sm"
                >
                  <option value="all">Todos</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="orderSearch" className="block text-xs font-medium text-gray-600 mb-1">
                  Buscar
                </label>
                <input
                  id="orderSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 px-3 border border-gray-300 rounded-sm text-sm min-w-[260px]"
                  placeholder="Nombre, correo o fecha (ej: 25/03/2026)"
                />
              </div>
            </div>

            <div className="border-l border-gray-200 pl-4 ml-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Acciones</label>
              <button
                onClick={() => setShowExternalForm((prev) => !prev)}
                className="h-9 px-4 bg-emerald-600 text-white rounded-sm text-sm hover:bg-emerald-700"
              >
                {showExternalForm ? "Cerrar formulario" : "Registrar venta externa"}
              </button>
            </div>
          </div>
        </div>

        {showExternalForm && (
          <div className="mb-4">
            <ExternalSaleForm
              onSubmit={handleAddExternalSale}
              onCancel={() => setShowExternalForm(false)}
              existingProducts={products}
            />
          </div>
        )}

        {(loadingOrders || loadingExternalOrders) && (
          <div className="mb-4 rounded-sm border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
            Cargando pedidos y ventas externas...
          </div>
        )}

        <OrderTable
          orders={combinedOrders}
          expandedOrderId={expandedOrderId}
          setExpandedOrderId={setExpandedOrderId}
          requestSort={requestCombinedSort}
          getPaymentStatusClass={getPaymentStatusClass}
          getPaymentStatusText={getPaymentStatusText}
          getStatusClass={getStatusClass}
          formatDate={formatDate}
          formatAddress={formatAddress}
          updateOrderStatus={handleOrderStatusUpdate}
          assignOrderNumber={assignOrderNumber} // AQUÍ ESTÁ EL CAMBIO - Añadir esta prop
          updateExternalOrderDetails={updateExternalSaleOrderDetails}
        />
      </div>
    );
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-emerald-700 p-8 rounded-sm shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Acceso Admin Panel Manos del Marga Marga
          </h2>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full p-2 border rounded-sm focus:ring-primary focus:border-primary ${
                  email && !isValidEmail(email) ? "border-red-500" : ""
                }`}
                required
                pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}"
                title="Por favor Credencial válida"
                autoComplete="username"
                spellCheck="false"
                maxLength="50"
                placeholder="Email"
                suppressHydrationWarning
              />
              {email && !isValidEmail(email) && (
                <p className="text-red-500 text-xs mt-1">
                  Por favor un correo válido
                </p>
              )}
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-sm focus:ring-primary focus:border-primary"
                required
                minLength="6"
                maxLength="50"
                autoComplete="current-password"
                placeholder="Contraseña"
                suppressHydrationWarning
              />
              {password && password.length < 6 && (
                <p className="text-red-500 text-xs mt-1">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-sm transition-colors ${
                isValidEmail(email) && password.length >= 6
                  ? "bg-emerald-700 text-white hover:bg-emerald-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isValidEmail(email) || password.length < 6}
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Definir pestañas para el sistema
  const tabs = [
    {
      label: "Dashboard",
      content: <DashboardTab 
        onChangeTab={(tabName) => {
          // Encontrar el índice de la pestaña por nombre
          const tabIndex = tabs.findIndex(tab => tab.label === tabName);
          if (tabIndex !== -1) {
            // Cambiar a la pestaña seleccionada
            document.querySelectorAll('button[role="tab"]')[tabIndex]?.click();
          }
        }} 
        onOpenAddProductForm={() => setShowForm(true)} // Agrega esta función
      />,
    },
    {
      label: "Inventario",
      content: (
        <InventoryManager onEdit={(product) => setEditingProduct(product)} />
      ),
    },
    {
      label: "Pedidos",
      content: <OrdersTab />,
    },
    {
      label: "Carrusel",
      content: <CarouselManager />,
    },
    {
      label: "Informes de Ventas",
      content: <SalesReport />,
    },
    {
      label: "Reservas",
      content: (
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Gestión de Reservas
          </h2>
          <ReservationTable
            reservations={Array.isArray(reservations) ? reservations : []}
            formatDate={formatDate}
          />
        </div>
      ),
    },
     ];

  return (
    <div className="p-4 md:p-6 bg-gradient-to-b from-emerald-50/60 to-white min-h-screen">
      <div className="w-full bg-white p-4 md:p-6 border border-emerald-200 shadow-lg rounded-sm mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Manos del Marga Marga</p>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-800 px-3 py-1.5 text-xs rounded-sm border border-gray-200 hover:bg-gray-200 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <TabSystem tabs={tabs} />

        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-sm overflow-y-auto max-h-[90vh] w-[90%] md:w-3/4 lg:w-2/3">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">
                    Editar Producto
                  </h3>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSubmit={handleEditProduct}
                  onCancel={() => {
                    setEditingProduct(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal para agregar nuevo producto */}
{showForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-sm overflow-y-auto max-h-[90vh] w-[90%] md:w-3/4 lg:w-2/3">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700">
            Agregar Nuevo Producto
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowForm(false)}
        />
      </div>
    </div>
  </div>
)}
    </div>
  );
}
