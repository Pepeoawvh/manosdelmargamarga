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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [allTimeData, setAllTimeData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [externalSales, setExternalSales] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

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

      setMonthlyData(calculateMonthlyStats(monthlyOrders, monthlyExternal));
      setAllTimeData(calculateAllTimeStats(allOrders, allExternal));
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

  const calculateMonthlyStats = (orders, externalSales) => {
    const validOrders = Array.isArray(orders) ? orders : [];
    const validExternal = Array.isArray(externalSales) ? externalSales : [];

    const onlineSales = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const externalSalesTotal = validExternal.reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );

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
      salesCount: validOrders.length + validExternal.length,
      onlineCount: validOrders.length,
      externalCount: validExternal.length,
      topProducts: productsByQuantity.slice(0, 10),
      topRevenueProducts: productsByRevenue.slice(0, 10),
      topProduct: productsByQuantity[0] || null,
      topRevenueProduct: productsByRevenue[0] || null,
    };
  };

  const calculateAllTimeStats = (orders, externalSales) => {
    const vOrders = Array.isArray(orders) ? orders : [];
    const vExternal = Array.isArray(externalSales) ? externalSales : [];
    const all = [...vOrders, ...vExternal];

    const totalSales = all.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

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
    all.forEach((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      if (!d || isNaN(d.getTime())) return;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const curr = monthly.get(ym) || { total: 0, count: 0 };
      monthly.set(ym, { total: curr.total + (Number(s.total) || 0), count: curr.count + 1 });
    });

    const chartData = Array.from(monthly.entries())
      .map(([ym, data]) => {
        const [y, m] = ym.split("-").map((n) => parseInt(n));
        return {
          yearMonth: ym,
          year: y,
          month: m,
          monthName: new Date(y, m - 1).toLocaleString("es", { month: "long" }),
          total: data.total,
          count: data.count,
        };
      })
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

    return {
      totalSales,
      salesCount: all.length,
      onlineCount: vOrders.length,
      externalCount: vExternal.length,
      topProducts: productsByQuantity.slice(0, 20),
      topRevenueProducts: productsByRevenue.slice(0, 20),
      chartData,
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
    formatCurrency,
    fetchSalesData,
  };
}
