'use client'

import { useState } from 'react';
import useProducts from '../../hooks/shared/useProducts';
import ProductForm from '../product/ProductForm';
// Si tienes CategoryFilter, descomenta la siguiente línea
// import CategoryFilter from './CategoryFilter';

const InventoryManager = () => {
  const { products, loading, error, updateInventory, refreshProducts, deleteProduct, addProduct, updateProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [quantityChange, setQuantityChange] = useState('');
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [updateStatus, setUpdateStatus] = useState({ message: '', isError: false });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filtrado de productos
  const filteredProducts = products
    ? products.filter(product =>
        (!filterText || product.title.toLowerCase().includes(filterText.toLowerCase())) &&
        (!selectedCategory || (product.categories && product.categories.includes(selectedCategory)))
      )
    : [];

  // Refrescar productos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProducts();
    setIsRefreshing(false);
    setLastUpdate(new Date());
  };

  // Actualizar stock
  const handleUpdateStock = async (productId) => {
    if (!quantityChange) return;
    const result = await updateInventory(productId, Number(quantityChange));
    if (result.success) {
      setUpdateStatus({ message: 'Stock actualizado correctamente', isError: false });
      setQuantityChange('');
      setSelectedProduct(null);
      await refreshProducts();
      setTimeout(() => setUpdateStatus({ message: '', isError: false }), 3000);
    } else {
      setUpdateStatus({ message: result.error || 'Error al actualizar stock', isError: true });
    }
  };

  // Eliminar producto
  const handleDeleteWithConfirmation = async (productId, productTitle) => {
    if (window.confirm(`¿Seguro que deseas eliminar el producto "${productTitle}"?`)) {
      const result = await deleteProduct(productId);
      if (result.success) {
        setUpdateStatus({ message: 'Producto eliminado', isError: false });
        await refreshProducts();
        setTimeout(() => setUpdateStatus({ message: '', isError: false }), 3000);
      } else {
        setUpdateStatus({ message: result.error || 'Error al eliminar producto', isError: true });
      }
    }
  };

  // Agregar producto
  const handleAddProduct = async (productData) => {
    const result = await addProduct(productData);
    if (result.success) {
      setUpdateStatus({ message: 'Producto agregado correctamente', isError: false });
      setShowAddForm(false);
      await refreshProducts();
      setTimeout(() => setUpdateStatus({ message: '', isError: false }), 3000);
    } else {
      setUpdateStatus({ message: result.error || 'Error al agregar producto', isError: true });
    }
  };

  // Editar producto
  const handleEditProduct = async (productData) => {
    try {
      const result = await updateProduct(productData.id, productData); // <-- CORRECTO
      if (result.success) {
        setUpdateStatus({
          message: 'Producto actualizado correctamente',
          isError: false
        });
        setShowEditForm(false);
        setEditingProduct(null);
        await refreshProducts();
        setTimeout(() => setUpdateStatus({ message: '', isError: false }), 3000);
      } else {
        throw new Error(result.error || 'Error desconocido al actualizar');
      }
    } catch (error) {
      setUpdateStatus({
        message: `Error al actualizar: ${error.message}`,
        isError: true
      });
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
          <div className="border-b px-3 py-2.5 bg-gray-50 flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0 gap-2">
            <span className="w-0.5 h-4 bg-emerald-500 rounded-sm shrink-0"></span>
            <h3 className="text-sm font-medium text-gray-700">Gestión de Inventario</h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`ml-2 p-1.5 rounded-sm text-xs ${
                isRefreshing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              title="Actualizar productos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
            {lastUpdate && (
              <span className="ml-2 text-xs text-gray-400">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            {/* Si tienes CategoryFilter, descomenta esto:
            <div className="ml-4">
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            */}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="py-1 px-2 text-xs border border-gray-300 rounded-sm"
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="py-1 px-3 text-xs bg-emerald-600 text-white rounded-sm hover:bg-emerald-700"
              title="Agregar nuevo producto"
            >
              + Nuevo Producto
            </button>
          </div>
        </div>
        {updateStatus.message && (
          <div className={`px-3 py-1.5 text-xs ${updateStatus.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {updateStatus.message}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="h-8 w-8 rounded-sm object-cover mr-2"
                          />
                        )}
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-gray-900">{product.title}</span>
                          {product.featured && (
                            <span 
                              className="ml-1 text-amber-500" 
                              title="Producto destacado"
                            >
                              ★
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <span 
                        className={`text-xs font-medium px-2 py-1 rounded-sm ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                        suppressHydrationWarning
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center">
                      {product.categories && product.categories.map((category, index) => (
                        <span 
                          key={index}
                          className="inline-block px-2 py-0.5 rounded-sm mr-1 mb-1 bg-gray-100 text-gray-700"
                        >
                          {category}
                        </span>
                      ))}
                      {(!product.categories || product.categories.length === 0) && (
                        <span className="text-gray-400">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      {selectedProduct === product.id ? (
                        <div className="flex items-center justify-end space-x-1">
                          <input
                            type="number"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(e.target.value)}
                            className="w-16 py-1 px-2 text-xs border border-gray-300 rounded-sm"
                            placeholder="±"
                          />
                          <button
                            onClick={() => handleUpdateStock(product.id)}
                            className="py-1 px-2 text-xs bg-emerald-600 text-white rounded-sm hover:bg-emerald-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(null);
                              setQuantityChange('');
                            }}
                            className="py-1 px-2 text-xs border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedProduct(product.id)}
                            className="py-1 px-2 text-xs border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
                            title="Ajustar stock"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowEditForm(true);
                            }}
                            className="py-1 px-2 text-xs bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                            title="Editar producto"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteWithConfirmation(product.id, product.title)}
                            className="py-1 px-2 text-xs bg-red-600 text-white rounded-sm hover:bg-red-700"
                            title="Eliminar producto"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-sm text-gray-500">
                    {filterText || selectedCategory ? (
                      <>
                        No se encontraron productos
                        {filterText && <> con "<strong>{filterText}</strong>"</>}
                        {selectedCategory && <> en la categoría "<strong>{selectedCategory}</strong>"</>}
                      </>
                    ) : (
                      "No hay productos disponibles"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t px-3 py-2 text-xs text-gray-500">
          <p>
            • Ingrese valores positivos para añadir stock<br />
            • Ingrese valores negativos para reducir stock<br />
            • El stock no puede ser menor que cero
          </p>
        </div>
      </div>
      {/* Formulario para agregar producto */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Agregar Nuevo Producto</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProductForm 
              onSubmit={handleAddProduct} 
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
      {/* Formulario para editar producto */}
      {showEditForm && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Editar Producto</h3>
              <button 
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProductForm 
              product={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryManager;