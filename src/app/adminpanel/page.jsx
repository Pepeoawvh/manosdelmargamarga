"use client";
import useAdminPanel from "../hooks/admin/useAdminPanel";
import ProductForm from "../components/product/ProductForm";
import InventoryManager from "../components/admin/InventoryManager";
import TabSystem from "../components/ui/TabSystem";
import OrderTable from "../components/admin/OrderTable";
import CarouselManager from "@/app/components/admin/CarouselManager";
import SalesReport from "../components/admin/SalesReport";
import Dashboard from "../components/admin/Dashboard";
import { useState, useEffect } from "react";

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
    loading,
    loadingOrders,
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
    requestSort,
    formatAddress,
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
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleExpandedSection = (section) => {
      setExpandedSection((prev) => (prev === section ? null : section));
    };

    // Validar que `orders` sea un array antes de usar `.find()`
    const expandedOrder = Array.isArray(orders)
      ? orders.find((order) => order.id === expandedOrderId)
      : null;

    // Logging para verificar disponibilidad de la función
    console.log(
      "¿assignOrderNumber está disponible?",
      typeof assignOrderNumber === "function"
    );

    return (
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Gestión de Pedidos
        </h2>
        <OrderTable
          orders={Array.isArray(orders) ? orders : []}
          expandedOrderId={expandedOrderId}
          setExpandedOrderId={setExpandedOrderId}
          requestSort={requestSort}
          getPaymentStatusClass={getPaymentStatusClass}
          getPaymentStatusText={getPaymentStatusText}
          getStatusClass={getStatusClass}
          formatDate={formatDate}
          formatAddress={formatAddress}
          updateOrderStatus={updateOrderStatus}
          assignOrderNumber={assignOrderNumber} // AQUÍ ESTÁ EL CAMBIO - Añadir esta prop
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
          className="bg-white border-2 border-emerald-700 p-8 rounded-lg shadow-md w-96"
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
                className={`w-full p-2 border rounded focus:ring-primary focus:border-primary ${
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
                className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
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
              className={`w-full py-2 rounded transition-colors ${
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
     ];

  return (
    <div className="p-4 md:p-6 select-none">
      <div className="w-full bg-white p-4 border-2 border-emerald-800  shadow-lg rounded-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">Panel de Administración</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-800 px-3 py-1.5 text-xs rounded hover:bg-gray-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <TabSystem tabs={tabs} />

        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg overflow-y-auto max-h-[90vh] w-[90%] md:w-3/4 lg:w-2/3">
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
    <div className="bg-white rounded-lg overflow-y-auto max-h-[90vh] w-[90%] md:w-3/4 lg:w-2/3">
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
