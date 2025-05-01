import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '../../lib/firebase/config';

export default function useSalesReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [allTimeData, setAllTimeData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [externalSales, setExternalSales] = useState([]);
  
  // Para el selector de mes/año
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Cargar datos al cambiar el mes/año seleccionado
  useEffect(() => {
    fetchSalesData();
  }, [selectedMonth, selectedYear]);

  // Función para cargar datos de ventas
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determinar fecha inicio y fin del mes seleccionado
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
      
      // Log para diagnóstico
      console.log(`Consultando ventas desde ${startDate.toISOString()} hasta ${endDate.toISOString()}`);
      
      // Consultar pedidos completados (ventas online)
      const ordersQuery = query(
        collection(firestoreDB, 'orders'),
        orderBy('createdAt', 'desc') // Solo ordenar, sin filtrar por status
      );
      
      // Consultar ventas externas
      const externalQuery = query(
        collection(firestoreDB, 'external-sales'),
        orderBy('date', 'desc')
      );
      
      // Consultar todos los pedidos para datos históricos
// Por esta consulta general:
const allOrdersQuery = query(
  collection(firestoreDB, 'orders'),
  orderBy('createdAt', 'desc')
);  
      
      // Consultar todas las ventas externas para datos históricos
      const allExternalQuery = query(
        collection(firestoreDB, 'external-sales'),
        orderBy('date', 'desc')
      );
      
      // Ejecutar consultas en paralelo
      const [ordersSnapshot, externalSnapshot, allOrdersSnapshot, allExternalSnapshot] = 
        await Promise.all([
          getDocs(ordersQuery),
          getDocs(externalQuery),
          getDocs(allOrdersQuery),
          getDocs(allExternalQuery)
        ]);
      
      console.log(`Se obtuvieron ${ordersSnapshot.docs.length} órdenes y ${externalSnapshot.docs.length} ventas externas`);
      
      // Procesar resultados
      const monthlyOrders = processOrders(ordersSnapshot, startDate, endDate);
      const monthlyExternal = processExternalSales(externalSnapshot, startDate, endDate);
      const allOrders = processOrders(allOrdersSnapshot);
      const allExternal = processExternalSales(allExternalSnapshot);
      
      console.log(`Después de filtrar por fecha: ${monthlyOrders.length} órdenes y ${monthlyExternal.length} ventas externas`);
      
      setOrders(monthlyOrders);
      setExternalSales(monthlyExternal);
      
      // Calcular datos mensuales
      const monthlyStats = calculateMonthlyStats(monthlyOrders, monthlyExternal);
      setMonthlyData(monthlyStats);
      
      // Calcular datos históricos
      const allTimeStats = calculateAllTimeStats(allOrders, allExternal);
      setAllTimeData(allTimeStats);
      
    } catch (err) {
      console.error('Error al cargar datos de ventas:', err);
      setError('Error al cargar los datos de ventas. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función mejorada para procesar órdenes
  const processOrders = (snapshot, startDate = null, endDate = null) => {
    let orders = snapshot.docs.map(doc => {
      try {
        const data = doc.data();
        
        // Normalizar estructura de items
        let items = [];
        if (Array.isArray(data.cart) && data.cart.length > 0) {
          items = data.cart;
        } else if (Array.isArray(data.items) && data.items.length > 0) {
          items = data.items;
        } else if (Array.isArray(data.products) && data.products.length > 0) {
          items = data.products;
        } else if (data.rawData && Array.isArray(data.rawData.cart) && data.rawData.cart.length > 0) {
          items = data.rawData.cart;
        } else {
          console.log(`Orden ${doc.id} no tiene items definidos`);
        }
        
        // Calcular el total de manera más robusta
        let total = 0;
        if (data.summary && typeof data.summary.total === 'number') {
          total = data.summary.total;
        } else if (typeof data.amount === 'number') {
          total = data.amount;
        } else if (typeof data.amount === 'string') {
          total = parseFloat(data.amount) || 0;
        } else if (items.length > 0) {
          // Calcular el total sumando los items si no hay otro total
          total = items.reduce((sum, item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            return sum + (itemPrice * itemQuantity);
          }, 0);
        }
        
        // Asegurar que la fecha sea un objeto Date válido
        let orderDate = null;
        if (data.createdAt?.toDate) {
          orderDate = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          orderDate = data.createdAt;
        } else if (data.date?.toDate) {
          orderDate = data.date.toDate();
        } else if (data.date instanceof Date) {
          orderDate = data.date;
        } else {
          orderDate = new Date(); // Fallback
          console.warn(`Orden ${doc.id} no tiene fecha válida, usando fecha actual como fallback`);
        }
        
        return {
          id: doc.id,
          type: 'online',
          date: orderDate,
          total: total,
          customer: `${data.customer?.firstName || ''} ${data.customer?.lastName || ''}`.trim() || 'Cliente sin nombre',
          items: items,
          status: data.status || 'FINALIZADO',
          orderNumber: data.orderNumber || doc.id.slice(0, 8),
          paymentMethod: data.paymentMethod || 'webpay'
        };
      } catch (err) {
        console.error(`Error procesando orden ${doc.id}:`, err);
        return {
          id: doc.id,
          type: 'online',
          date: new Date(),
          total: 0,
          customer: 'Error al procesar',
          items: [],
          status: 'ERROR',
          orderNumber: doc.id.slice(0, 8),
          paymentMethod: 'desconocido'
        };
      }
    });
  
    // Filtrar por fecha si se proporcionaron fechas de inicio y fin
    if (startDate && endDate) {
      orders = orders.filter(order => {
        try {
          const orderDate = order.date instanceof Date ? order.date : new Date(order.date);
          return orderDate >= startDate && orderDate <= endDate;
        } catch (err) {
          console.error('Error al filtrar por fecha:', err, order);
          return false;
        }
      });
    }
    
    // Log para diagnóstico
    if (orders.length > 0) {
      console.log(`Órdenes procesadas: ${orders.length}`);
      console.log('Primera orden procesada:', {
        id: orders[0].id,
        total: orders[0].total,
        date: orders[0].date,
        items: orders[0].items.length
      });
    } else {
      console.log('No se encontraron órdenes para procesar');
    }
    
    return orders;
  };
  
  // Procesar ventas externas con filtro de fecha
  const processExternalSales = (snapshot, startDate = null, endDate = null) => {
    let sales = snapshot.docs.map(doc => {
      try {
        const data = doc.data();
        
        // Asegurar que date sea un objeto Date
        let saleDate = null;
        if (data.date?.toDate) {
          saleDate = data.date.toDate();
        } else if (data.date instanceof Date) {
          saleDate = data.date;
        } else if (typeof data.date === 'string') {
          saleDate = new Date(data.date);
        } else {
          saleDate = new Date();
          console.warn(`Venta externa ${doc.id} no tiene fecha válida, usando fecha actual como fallback`);
        }
        
        // Asegurar que amount sea un número
        let amount = 0;
        if (typeof data.amount === 'number') {
          amount = data.amount;
        } else if (typeof data.amount === 'string') {
          amount = parseFloat(data.amount) || 0;
        }
        
        return {
          id: doc.id,
          type: 'external',
          date: saleDate,
          total: amount,
          customer: data.customerName || 'Cliente externo',
          description: data.description || '',
          paymentMethod: data.paymentMethod || 'efectivo',
          notes: data.notes || ''
        };
      } catch (err) {
        console.error(`Error procesando venta externa ${doc.id}:`, err);
        return {
          id: doc.id,
          type: 'external',
          date: new Date(),
          total: 0,
          customer: 'Error al procesar',
          description: 'Error al procesar venta externa',
          paymentMethod: 'desconocido',
          notes: ''
        };
      }
    });
    
    // Filtrar por fecha si se proporcionaron
    if (startDate && endDate) {
      sales = sales.filter(sale => {
        try {
          const saleDate = sale.date instanceof Date ? sale.date : new Date(sale.date);
          return saleDate >= startDate && saleDate <= endDate;
        } catch (err) {
          console.error('Error al filtrar venta externa por fecha:', err, sale);
          return false;
        }
      });
    }
    
    return sales;
  };
  
  // Calcular estadísticas mensuales con manejo robusto de errores
  const calculateMonthlyStats = (orders, externalSales) => {
    try {
      console.log('===== DIAGNÓSTICO DE CÁLCULO MENSUAL =====');
      console.log('Órdenes a procesar:', orders.length);
      console.log('Ventas externas a procesar:', externalSales.length);
      
      if (orders.length > 0) {
        console.log('Primeras 3 órdenes:', 
          orders.slice(0, 3).map(o => ({
            id: o.id, 
            total: o.total, 
            fecha: o.date instanceof Date ? o.date.toISOString() : 'No es Date'
          }))
        );
      }
      
      // Verificar si hay alguna orden con total 0 o NaN
      const problemOrders = orders.filter(o => !o.total || isNaN(o.total));
      if (problemOrders.length > 0) {
        console.warn('⚠️ Se encontraron órdenes con totales problemáticos:', 
          problemOrders.map(o => ({ id: o.id, total: o.total }))
        );
      }
      
      // Asegurar que todos los arrays son válidos
      const validOrders = Array.isArray(orders) ? orders : [];
      const validExternalSales = Array.isArray(externalSales) ? externalSales : [];
      const allSales = [...validOrders, ...validExternalSales];
      
      // Suma de totales con logging
      let onlineSalesTotal = validOrders.reduce((sum, order) => {
        const orderTotal = Number(order.total) || 0;
        if (orderTotal === 0) {
          console.warn(`⚠️ Orden con total 0: ${order.id}`);
        }
        return sum + orderTotal;
      }, 0);
      
      let externalSalesTotal = validExternalSales.reduce((sum, sale) => {
        const saleTotal = Number(sale.total) || 0;
        if (saleTotal === 0) {
          console.warn(`⚠️ Venta externa con total 0: ${sale.id}`);
        }
        return sum + saleTotal;
      }, 0);
      
      // Total combinado
      const totalSales = onlineSalesTotal + externalSalesTotal;
      
      console.log('Totales calculados:', {
        total: totalSales,
        online: onlineSalesTotal,
        external: externalSalesTotal
      });
      
      // Productos más vendidos (solo aplicable a ventas online)
      const productMap = new Map();
      
      validOrders.forEach(order => {
        if (Array.isArray(order.items) && order.items.length > 0) {
          order.items.forEach(item => {
            try {
              // Identificar ID del producto de manera robusta
              const productId = item.id || item.productId || item.sku || `unknown-${Math.random()}`;
              
              // Obtener datos actuales o crear nuevo registro
              const currentCount = productMap.get(productId) || { 
                quantity: 0, 
                revenue: 0, 
                name: item.title || item.name || 'Producto sin nombre',
                price: item.price || 0
              };
              
              // Calcular cantidad y precio
              const quantity = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;
              
              // Actualizar mapa
              productMap.set(productId, {
                ...currentCount,
                quantity: currentCount.quantity + quantity,
                revenue: currentCount.revenue + (price * quantity)
              });
            } catch (err) {
              console.error('Error procesando item:', err, item);
            }
          });
        }
      });
      
      // Verificar si se procesaron productos
      console.log(`Productos únicos vendidos: ${productMap.size}`);
      
      // Convertir Map a Array y ordenar por cantidad
      const productsByQuantity = Array.from(productMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity);
      
      // Ordenar por ingresos
      const productsByRevenue = [...productsByQuantity].sort((a, b) => b.revenue - a.revenue);
      
      return {
        totalSales,
        onlineSales: onlineSalesTotal,
        externalSalesTotal,
        salesCount: allSales.length,
        onlineCount: validOrders.length,
        externalCount: validExternalSales.length,
        topProducts: productsByQuantity.slice(0, 10),
        topRevenueProducts: productsByRevenue.slice(0, 10),
        topProduct: productsByQuantity.length > 0 ? productsByQuantity[0] : null,
        topRevenueProduct: productsByRevenue.length > 0 ? productsByRevenue[0] : null
      };
    } catch (err) {
      console.error('Error al calcular estadísticas mensuales:', err);
      return {
        totalSales: 0,
        onlineSales: 0,
        externalSalesTotal: 0,
        salesCount: 0,
        onlineCount: 0,
        externalCount: 0,
        topProducts: [],
        topRevenueProducts: [],
        topProduct: null,
        topRevenueProduct: null
      };
    }
  };
  
  // Calcular estadísticas históricas con la misma lógica robusta
  const calculateAllTimeStats = (orders, externalSales) => {
    try {
      // Asegurar arrays válidos
      const validOrders = Array.isArray(orders) ? orders : [];
      const validExternalSales = Array.isArray(externalSales) ? externalSales : [];
      const allSales = [...validOrders, ...validExternalSales];
      
      // Calcular totales
      const totalSales = allSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
      
      // Productos más vendidos (histórico)
      const productMap = new Map();
      
      validOrders.forEach(order => {
        if (Array.isArray(order.items) && order.items.length > 0) {
          order.items.forEach(item => {
            try {
              // Usar la misma lógica de identificación que en calculateMonthlyStats
              const productId = item.id || item.productId || item.sku || `unknown-${Math.random()}`;
              
              const currentCount = productMap.get(productId) || { 
                quantity: 0, 
                revenue: 0, 
                name: item.title || item.name || 'Producto sin nombre',
                price: item.price || 0
              };
              
              const quantity = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;
              
              productMap.set(productId, {
                ...currentCount,
                quantity: currentCount.quantity + quantity,
                revenue: currentCount.revenue + (price * quantity)
              });
            } catch (err) {
              console.error('Error procesando item histórico:', err, item);
            }
          });
        }
      });
      
      // Productos por cantidad/ingresos
      const productsByQuantity = Array.from(productMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity);
      
      const productsByRevenue = [...productsByQuantity].sort((a, b) => b.revenue - a.revenue);
      
      // Ventas por mes para gráfico
      const monthlySalesMap = new Map();
      
      // Procesar todas las ventas para agruparlas por mes
      allSales.forEach(sale => {
        try {
          const date = sale.date instanceof Date ? sale.date : new Date(sale.date);
          
          if (date && !isNaN(date.getTime())) {
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = monthlySalesMap.get(yearMonth) || { total: 0, count: 0 };
            
            monthlySalesMap.set(yearMonth, {
              ...current,
              total: current.total + (Number(sale.total) || 0),
              count: current.count + 1
            });
          }
        } catch (err) {
          console.error('Error procesando fecha para gráfico:', err, sale);
        }
      });
      
      // Convertir el mapa a array para el gráfico, ordenado por fecha
      const chartData = Array.from(monthlySalesMap.entries())
        .map(([yearMonth, data]) => {
          try {
            const [year, month] = yearMonth.split('-').map(n => parseInt(n));
            return {
              yearMonth,
              year,
              month,
              monthName: new Date(year, month - 1).toLocaleString('es', { month: 'long' }),
              total: data.total,
              count: data.count
            };
          } catch (err) {
            console.error('Error procesando datos de gráfico:', err, yearMonth, data);
            return null;
          }
        })
        .filter(Boolean) // Eliminar nulls
        .sort((a, b) => {
          // Ordenar por año y mes
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
      
      return {
        totalSales,
        salesCount: allSales.length,
        onlineCount: validOrders.length,
        externalCount: validExternalSales.length,
        topProducts: productsByQuantity.slice(0, 20),
        topRevenueProducts: productsByRevenue.slice(0, 20),
        chartData
      };
    } catch (err) {
      console.error('Error al calcular estadísticas históricas:', err);
      return {
        totalSales: 0,
        salesCount: 0,
        onlineCount: 0,
        externalCount: 0,
        topProducts: [],
        topRevenueProducts: [],
        chartData: []
      };
    }
  };
  
  // Agregar venta externa
  const addExternalSale = async (saleData) => {
    try {
      // Validar datos mínimos
      if (!saleData.customerName || !saleData.amount || !saleData.date) {
        throw new Error('Por favor complete todos los campos requeridos');
      }
      
      // Convertir fecha si es string
      const date = typeof saleData.date === 'string' 
        ? new Date(saleData.date) 
        : saleData.date;
      
      // Validar fecha
      if (isNaN(date.getTime())) {
        throw new Error('La fecha ingresada no es válida');
      }
      
      // Validar monto
      const amount = parseFloat(saleData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('El monto debe ser un número positivo');
      }
      
      // Preparar datos para Firestore
      const newSale = {
        ...saleData,
        date, // Almacenar como Date en Firestore
        amount: amount,
        createdAt: serverTimestamp()
      };
      
      // Guardar en Firestore
      const docRef = await addDoc(collection(firestoreDB, 'external-sales'), newSale);
      console.log(`Venta externa guardada con ID: ${docRef.id}`);
      
      // Recargar datos
      await fetchSalesData();
      
      return { success: true };
    } catch (err) {
      console.error('Error al guardar venta externa:', err);
      return { success: false, error: err.message };
    }
  };
  
  // Datos para selectores
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  return {
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
    fetchSalesData
  };
}