import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";

function monthRange(year, month) {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function toDateSafe(val) {
  try {
    if (!val) return null;
    if (typeof val?.toDate === "function") return val.toDate();
    if (val instanceof Date) return val;
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") return new Date(val);
    return null;
  } catch {
    return null;
  }
}

function resolveSaleDate(data) {
  return (
    toDateSafe(data?.finalizedAt) ||
    toDateSafe(data?.transactionDetails?.transaction_date) ||
    toDateSafe(data?.createdAt) ||
    null
  );
}

function resolveItems(data) {
  if (Array.isArray(data?.cart) && data.cart.length) return data.cart;
  if (Array.isArray(data?.items) && data.items.length) return data.items;
  if (Array.isArray(data?.products) && data.products.length) return data.products;
  if (Array.isArray(data?.rawData?.cart) && data.rawData.cart.length)
    return data.rawData.cart;
  return [];
}

function resolveTotal(data, items) {
  if (typeof data?.summary?.total === "number") return data.summary.total;
  if (typeof data?.amount === "number") return data.amount;
  if (typeof data?.amount === "string") return parseFloat(data.amount) || 0;
  if (Array.isArray(items) && items.length > 0) {
    return items.reduce((sum, it) => {
      const p = Number(it.price) || 0;
      const q = Number(it.quantity) || 1;
      return sum + p * q;
    }, 0);
  }
  return 0;
}

export default function useSalesReport() {
  const DEVELOPER_COMMISSION_RATE = 10;
  const developerCommissionRate = DEVELOPER_COMMISSION_RATE;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [allTimeData, setAllTimeData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [externalSales, setExternalSales] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allExternalSales, setAllExternalSales] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!orders.length && !externalSales.length && !allOrders.length && !allExternalSales.length) {
      return;
    }

    setMonthlyData(
      calculateMonthlyStats(orders, externalSales, DEVELOPER_COMMISSION_RATE)
    );
    setAllTimeData(
      calculateAllTimeStats(allOrders, allExternalSales, DEVELOPER_COMMISSION_RATE)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, externalSales, allOrders, allExternalSales]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = monthRange(selectedYear, selectedMonth);

      // Queries sin orderBy para evitar índice compuesto requerido
      const monthlyApprovedQ = query(
        collection(firestoreDB, "orders"),
        where("paymentStatus", "==", "completed"),
        where("isApproved", "==", true)
      );

      const allApprovedQ = query(
        collection(firestoreDB, "orders"),
        where("paymentStatus", "==", "completed"),
        where("isApproved", "==", true)
      );

      const monthlyExternalQ = query(collection(firestoreDB, "external-sales"));
      const allExternalQ = query(collection(firestoreDB, "external-sales"));

      const [mOrdSnap, mExtSnap, aOrdSnap, aExtSnap] = await Promise.all([
        getDocs(monthlyApprovedQ),
        getDocs(monthlyExternalQ),
        getDocs(allApprovedQ),
        getDocs(allExternalQ),
      ]);

      const normalizeOrder = (doc) => {
        const data = doc.data();
        const items = resolveItems(data);
        const date = resolveSaleDate(data) || toDateSafe(data?.createdAt) || new Date(0);
        return {
          id: doc.id,
          raw: data,
          date,
          total: resolveTotal(data, items),
          customer:
            `${data?.customer?.firstName || ""} ${data?.customer?.lastName || ""}`.trim() ||
            "Cliente sin nombre",
          items,
          status: data?.status || "FINALIZADO",
          orderNumber: data?.orderNumber || doc.id.slice(0, 8),
          paymentMethod: data?.paymentMethod || "webpay",
        };
      };

      const normalizeExternal = (doc) => {
        const d = doc.data();
        const date = toDateSafe(d?.date) || new Date(0);
        return {
          id: doc.id,
          type: "external",
          date,
          total: typeof d?.amount === "number" ? d.amount : parseFloat(d?.amount) || 0,
          customer: d?.customerName || "Cliente externo",
          description: d?.description || "",
          paymentMethod: d?.paymentMethod || "efectivo",
          notes: d?.notes || "",
          hasCommission: Boolean(d?.hasCommission),
        };
      };

      // Mensual
      const monthlyOrders = mOrdSnap.docs
        .map(normalizeOrder)
        .filter((o) => o.date && o.date >= start && o.date <= end)
        .sort((a, b) => b.date - a.date);

      const monthlyExternal = mExtSnap.docs
        .map(normalizeExternal)
        .filter((s) => s.date && s.date >= start && s.date <= end)
        .sort((a, b) => b.date - a.date);

      // Histórico
      const allOrders = aOrdSnap.docs.map(normalizeOrder).sort((a, b) => b.date - a.date);
      const allExternal = aExtSnap.docs.map(normalizeExternal).sort((a, b) => b.date - a.date);

      setOrders(monthlyOrders);
      setExternalSales(monthlyExternal);
      setAllOrders(allOrders);
      setAllExternalSales(allExternal);

      setMonthlyData(
        calculateMonthlyStats(monthlyOrders, monthlyExternal, DEVELOPER_COMMISSION_RATE)
      );
      setAllTimeData(
        calculateAllTimeStats(allOrders, allExternal, DEVELOPER_COMMISSION_RATE)
      );
    } catch (err) {
      console.error("Error al cargar datos de ventas:", err);
      setError(
        err?.message ||
          "Error al cargar los datos de ventas. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (orders, externalSales, commissionRate = 10) => {
    const validOrders = Array.isArray(orders) ? orders : [];
    const validExternal = Array.isArray(externalSales) ? externalSales : [];

    const onlineSales = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const externalSalesTotal = validExternal.reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
    const externalSalesWithCommission = validExternal.filter((s) => s.hasCommission);
    const externalSalesCommissionableTotal = externalSalesWithCommission.reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
    const normalizedRate = Math.max(0, Number(commissionRate) || 0);
    const commissionFactor = normalizedRate / 100;
    const onlineCommission = onlineSales * commissionFactor;
    const externalCommission = externalSalesCommissionableTotal * commissionFactor;
    const developerCommission = onlineCommission + externalCommission;

    const productMap = new Map();
    validOrders.forEach((order) => {
      (order.items || []).forEach((it) => {
        const id = it.id || it.productId || it.sku || `unknown-${Math.random()}`;
        const curr = productMap.get(id) || {
          quantity: 0,
          revenue: 0,
          name: it.title || it.name || "Producto sin nombre",
          price: Number(it.price) || 0,
        };
        const q = Number(it.quantity) || 1;
        const p = Number(it.price) || 0;
        productMap.set(id, {
          ...curr,
          quantity: curr.quantity + q,
          revenue: curr.revenue + p * q,
        });
      });
    });

    const productsByQuantity = Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    const productsByRevenue = [...productsByQuantity].sort(
      (a, b) => b.revenue - a.revenue
    );

    return {
      totalSales: onlineSales + externalSalesTotal,
      onlineSales,
      externalSalesTotal,
      externalSalesCommissionableTotal,
      salesCount: validOrders.length + validExternal.length,
      onlineCount: validOrders.length,
      externalCount: validExternal.length,
      externalWithCommissionCount: externalSalesWithCommission.length,
      developerCommissionRate: normalizedRate,
      onlineCommission,
      externalCommission,
      developerCommission,
      topProducts: productsByQuantity.slice(0, 10),
      topRevenueProducts: productsByRevenue.slice(0, 10),
      topProduct: productsByQuantity[0] || null,
      topRevenueProduct: productsByRevenue[0] || null,
    };
  };

  const calculateAllTimeStats = (orders, externalSales, commissionRate = 10) => {
    const vOrders = Array.isArray(orders) ? orders : [];
    const vExternal = Array.isArray(externalSales) ? externalSales : [];
    const all = [...vOrders, ...vExternal];

    const onlineSales = vOrders.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const externalSalesTotal = vExternal.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const externalSalesWithCommission = vExternal.filter((s) => s.hasCommission);
    const externalSalesCommissionableTotal = externalSalesWithCommission.reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
    const normalizedRate = Math.max(0, Number(commissionRate) || 0);
    const commissionFactor = normalizedRate / 100;
    const onlineCommission = onlineSales * commissionFactor;
    const externalCommission = externalSalesCommissionableTotal * commissionFactor;
    const developerCommission = onlineCommission + externalCommission;
    const totalSales = onlineSales + externalSalesTotal;

    const productMap = new Map();
    vOrders.forEach((order) => {
      (order.items || []).forEach((it) => {
        const id = it.id || it.productId || it.sku || `unknown-${Math.random()}`;
        const curr = productMap.get(id) || {
          quantity: 0,
          revenue: 0,
          name: it.title || it.name || "Producto sin nombre",
          price: Number(it.price) || 0,
        };
        const q = Number(it.quantity) || 1;
        const p = Number(it.price) || 0;
        productMap.set(id, {
          ...curr,
          quantity: curr.quantity + q,
          revenue: curr.revenue + p * q,
        });
      });
    });

    const productsByQuantity = Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity);
    const productsByRevenue = [...productsByQuantity].sort(
      (a, b) => b.revenue - a.revenue
    );

    const monthly = new Map();
    const getMonthKey = (dateValue) => {
      const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (!d || isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const yearMonth = `${year}-${String(month).padStart(2, "0")}`;
      return { d, year, month, yearMonth };
    };

    const ensureMonthlyBucket = (dateValue) => {
      const keyData = getMonthKey(dateValue);
      if (!keyData) return null;

      const { year, month, yearMonth } = keyData;
      if (!monthly.has(yearMonth)) {
        monthly.set(yearMonth, {
          year,
          month,
          yearMonth,
          monthName: new Date(year, month - 1).toLocaleString("es", { month: "long" }),
          total: 0,
          count: 0,
          onlineSales: 0,
          externalSalesTotal: 0,
          onlineCount: 0,
          externalCount: 0,
          productMap: new Map(),
        });
      }

      return monthly.get(yearMonth);
    };

    vOrders.forEach((order) => {
      const bucket = ensureMonthlyBucket(order.date);
      if (!bucket) return;

      const orderTotal = Number(order.total) || 0;
      bucket.total += orderTotal;
      bucket.count += 1;
      bucket.onlineSales += orderTotal;
      bucket.onlineCount += 1;

      (order.items || []).forEach((it) => {
        const id = it.id || it.productId || it.sku || `unknown-${Math.random()}`;
        const curr = bucket.productMap.get(id) || {
          id,
          quantity: 0,
          revenue: 0,
          name: it.title || it.name || "Producto sin nombre",
          price: Number(it.price) || 0,
        };
        const q = Number(it.quantity) || 1;
        const p = Number(it.price) || 0;

        bucket.productMap.set(id, {
          ...curr,
          quantity: curr.quantity + q,
          revenue: curr.revenue + p * q,
        });
      });
    });

    vExternal.forEach((sale) => {
      const bucket = ensureMonthlyBucket(sale.date);
      if (!bucket) return;

      const saleTotal = Number(sale.total) || 0;
      bucket.total += saleTotal;
      bucket.count += 1;
      bucket.externalSalesTotal += saleTotal;
      bucket.externalCount += 1;
    });

    const monthlyBreakdown = Array.from(monthly.values())
      .map((bucket) => {
        const productsByQuantity = Array.from(bucket.productMap.values()).sort(
          (a, b) => b.quantity - a.quantity
        );
        const productsByRevenue = [...productsByQuantity].sort(
          (a, b) => b.revenue - a.revenue
        );

        return {
          year: bucket.year,
          month: bucket.month,
          yearMonth: bucket.yearMonth,
          monthName: bucket.monthName,
          total: bucket.total,
          count: bucket.count,
          onlineSales: bucket.onlineSales,
          externalSalesTotal: bucket.externalSalesTotal,
          onlineCount: bucket.onlineCount,
          externalCount: bucket.externalCount,
          topProducts: productsByQuantity.slice(0, 20),
          topRevenueProducts: productsByRevenue.slice(0, 20),
        };
      })
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

    const chartData = monthlyBreakdown.map((entry) => ({
      yearMonth: entry.yearMonth,
      year: entry.year,
      month: entry.month,
      monthName: entry.monthName,
      total: entry.total,
      count: entry.count,
    }));

    return {
      totalSales,
      onlineSales,
      externalSalesTotal,
      externalSalesCommissionableTotal,
      salesCount: all.length,
      onlineCount: vOrders.length,
      externalCount: vExternal.length,
      externalWithCommissionCount: externalSalesWithCommission.length,
      developerCommissionRate: normalizedRate,
      onlineCommission,
      externalCommission,
      developerCommission,
      topProducts: productsByQuantity.slice(0, 20),
      topRevenueProducts: productsByRevenue.slice(0, 20),
      chartData,
      monthlyBreakdown,
    };
  };

  const addExternalSale = async (saleData) => {
    try {
      if (!saleData.customerName || !saleData.amount || !saleData.date) {
        throw new Error("Por favor complete todos los campos requeridos");
      }
      const date =
        typeof saleData.date === "string" ? new Date(saleData.date) : saleData.date;
      if (isNaN(date.getTime())) throw new Error("La fecha ingresada no es válida");
      const amount = parseFloat(saleData.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("El monto debe ser positivo");

      const newSale = {
        ...saleData,
        hasCommission: Boolean(saleData?.hasCommission),
        date,
        amount,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(firestoreDB, "external-sales"), newSale);
      await fetchSalesData();
      return { success: true };
    } catch (err) {
      console.error("Error al guardar venta externa:", err);
      return { success: false, error: err.message };
    }
  };

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
      amount || 0
    );

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
    developerCommissionRate,
    formatCurrency,
    fetchSalesData,
  };
}
