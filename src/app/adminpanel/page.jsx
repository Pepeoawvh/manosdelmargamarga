'use client'
import useAdminPanel from '../hooks/admin/useAdminPanel';
import ProductForm from '../components/product/ProductForm';
import InventoryManager from '../components/admin/InventoryManager';
import TabSystem from '../components/ui/TabSystem';
import { useState, useEffect } from 'react';

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
    handleLogin,
    handleLogout,
    handleEditProduct,
    // Eliminamos handleAddProduct ya que ahora lo maneja InventoryManager
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
    return input.trim().replace(/[<>]/g, '');
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
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    handleLogin(e);
  };

  // Componente para la pestaña del Dashboard
  const DashboardTab = () => (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <h2 className="text-lg font-medium text-gray-700 mb-3">Panel de Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
          <h3 className="text-sm font-medium text-emerald-800">Productos</h3>
          <p className="text-xl font-bold text-emerald-700">{products.length}</p>
          <p className="text-xs text-emerald-600">Total de productos en inventario</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-3">
          <h3 className="text-sm font-medium text-amber-800">Destacados</h3>
          <p className="text-xl font-bold text-amber-700">
            {products.filter(p => p.featured).length}
          </p>
          <p className="text-xs text-amber-600">Productos destacados en inicio</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h3 className="text-sm font-medium text-blue-800">Categorías</h3>
          <p className="text-xl font-bold text-blue-700">8</p>
          <p className="text-xs text-blue-600">Categorías de productos</p>
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-2">
          {/* Eliminamos el botón "Añadir Producto" de aquí porque ahora está en InventoryManager */}
          <button 
            className="bg-amber-600 text-white py-1 px-2 text-xs rounded hover:bg-amber-700"
          >
            Ver Pedidos
          </button>
        </div>
      </div>
    </div>
  );

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Cargando...</p>
    </div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleSubmit} className="bg-white border-2 border-emerald-700 p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Acceso Admin Panel Manos del Marga Marga</h2>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full p-2 border rounded focus:ring-primary focus:border-primary ${
                  email && !isValidEmail(email) ? 'border-red-500' : ''
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
                  ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
      content: <DashboardTab />
    },
    {
      label: "Inventario",
      content: <InventoryManager onEdit={(product) => setEditingProduct(product)} />
    },
    {
      label: "Pedidos",
      content: <div className="p-4 text-sm text-gray-500">Funcionalidad de pedidos en desarrollo...</div>
    },
    {
      label: "Configuración",
      content: <div className="p-4 text-sm text-gray-500">Configuración de la tienda en desarrollo...</div>
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">Panel de Administración</h1>
          <div className="flex items-center space-x-3">
            {/* Eliminamos el botón de "Añadir Producto" del header */}
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-800 px-3 py-1.5 text-xs rounded hover:bg-gray-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <TabSystem tabs={tabs} />

        {/* Mantenemos solo el formulario de edición, eliminamos el modal para añadir */}
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
    </div>
  );
}