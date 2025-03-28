'use client'
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { firestoreDB } from '../../../lib/firebase/config';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterText, setFilterText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [updateMessage, setUpdateMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(firestoreDB, 'orders'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        setError('No se pudieron cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'procesando': return 'bg-blue-100 text-blue-800';
      case 'enviado': return 'bg-purple-100 text-purple-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(firestoreDB, 'orders', orderId), {
        status: newStatus,
        lastUpdated: new Date()
      });
      
      // Actualizar estado local
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, lastUpdated: new Date() }
          : order
      ));

      setUpdateMessage({ text: 'Estado actualizado correctamente', isError: false });
      setTimeout(() => setUpdateMessage({ text: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setUpdateMessage({ text: 'Error al actualizar estado', isError: true });
    }
  };

  // Ordenar pedidos
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'todos' || order.status === filterStatus;
    const textMatch = filterText === '' || 
      (order.customerName && order.customerName.toLowerCase().includes(filterText.toLowerCase())) || 
      (order.id && order.id.toLowerCase().includes(filterText.toLowerCase()));
    return statusMatch && textMatch;
  });

  // Aplicar ordenamiento
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  if (loading) return <div className="text-center py-4">Cargando pedidos...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm">
      <div className="border-b px-3 py-2 bg-gray-50 flex flex-wrap justify-between items-center">
        <h3 className="text-base font-medium text-gray-700 mb-2 sm:mb-0">Gestión de Pedidos</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1 px-2 text-xs border border-gray-300 rounded"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="procesando">Procesando</option>
            <option value="enviado">Enviado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input
            type="text"
            placeholder="Buscar pedido..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="py-1 px-2 text-xs border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {updateMessage.text && (
        <div className={`px-3 py-2 text-sm ${updateMessage.isError ? 'text-red-500' : 'text-green-500'}`}>
          {updateMessage.text}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('id')}
              >
                Pedido ID
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('date')}
              >
                Fecha
              </th>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('customerName')}
              >
                Cliente
              </th>
              <th 
                className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('total')}
              >
                Total
              </th>
              <th 
                className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('status')}
              >
                Estado
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-900">{order.id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {order.customerName || 'Sin nombre'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-center text-gray-900">
                    ${order.total?.toLocaleString() || 0}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusClass(order.status)}`}>
                      {order.status || 'pendiente'}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="py-1 px-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      >
                        {selectedOrder === order.id ? 'Cerrar' : 'Detalles'}
                      </button>
                      
                      {selectedOrder === order.id && (
                        <select
                          value={order.status || 'pendiente'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="py-1 px-2 text-xs border border-gray-300 rounded"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="procesando">Procesando</option>
                          <option value="enviado">Enviado</option>
                          <option value="completado">Completado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      )}
                    </div>
                    
                    {selectedOrder === order.id && (
                      <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                        <div className="mb-1"><span className="font-medium">Email:</span> {order.customerEmail || 'No disponible'}</div>
                        <div className="mb-1"><span className="font-medium">Teléfono:</span> {order.customerPhone || 'No disponible'}</div>
                        
                        <div className="mt-2 font-medium">Productos:</div>
                        <ul className="list-disc pl-4">
                          {order.items?.map((item, idx) => (
                            <li key={idx}>
                              {item.title} x{item.quantity} - ${(item.price * item.quantity).toLocaleString()}
                            </li>
                          )) || <li>No hay productos</li>}
                        </ul>
                        
                        <div className="mt-2">
                          <span className="font-medium">Dirección de envío:</span>
                          <p>{order.shippingAddress || 'No disponible'}</p>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-sm text-center text-gray-500">
                  No se encontraron pedidos con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="border-t px-3 py-2 text-xs text-gray-500">
        <p>
          Total: {filteredOrders.length} pedidos
          {filterStatus !== 'todos' && ` con estado "${filterStatus}"`}
          {filterText && ` que coinciden con "${filterText}"`}
        </p>
      </div>
    </div>
  );
};

export default OrderManager;