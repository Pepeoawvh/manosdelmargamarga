import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { firestoreDB, auth } from "../../../lib/firebase/config";
import useProducts from "../shared/useProducts";

export default function useAdminPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { products, loading, updateLocalProduct, setProducts } = useProducts();
  const [orders, setOrders] = useState([]);
  const [externalOrders, setExternalOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingExternalOrders, setLoadingExternalOrders] = useState(true);
  const [orderSortField, setOrderSortField] = useState("date");
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);

      if (user) {
        fetchOrders();
        fetchExternalOrders();
        fetchReservations();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const reservationsRef = collection(firestoreDB, "reservations");
    const q = query(reservationsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservationsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt:
              data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          };
        });
        setReservations(reservationsData);
        setLoadingReservations(false);
      },
      () => {}
    );
    return () => unsubscribe();
  }, [isLoggedIn]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
  
      const ordersRef = collection(firestoreDB, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const normalizedItems = Array.isArray(data.cart) && data.cart.length
          ? data.cart
          : Array.isArray(data.items) && data.items.length
          ? data.items
          : Array.isArray(data.products) && data.products.length
          ? data.products
          : Array.isArray(data.rawData?.cart) && data.rawData.cart.length
          ? data.rawData.cart
          : [];
        
        return {
          id: doc.id,
          ...data,
          cart: normalizedItems,
          items: normalizedItems,
          orderNumber: data.orderNumber || null,
          orderId: data.orderId || doc.id,
          date: data.createdAt?.toDate() || new Date(),
          customerName: data.customer?.firstName
            ? `${data.customer.firstName} ${data.customer.lastName || ""}`
            : "Cliente",
          customerEmail: data.customer?.email || "No disponible",
          customerPhone: data.customer?.phone || "No especificado",
          total: data.summary?.total || 0,
          paymentStatus: data.paymentStatus || "pending",
          status: data.status || "pendiente",
        };
      });
      
      setOrders(ordersData);
    } catch (error) {
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchExternalOrders = useCallback(async () => {
    try {
      setLoadingExternalOrders(true);

      const externalRef = collection(firestoreDB, "external-sales");
      const q = query(externalRef, orderBy("date", "desc"));
      const snapshot = await getDocs(q);

      const externalData = snapshot.docs.map((saleDoc) => {
        const data = saleDoc.data() || {};
        const normalizedItems = Array.isArray(data.items) && data.items.length
          ? data.items
              .map((item) => ({
                title: item?.title || item?.name || "Producto",
                quantity: Number(item?.quantity) || 1,
                price: Number(item?.price) || 0,
              }))
              .filter((item) => item.quantity > 0 && item.price >= 0)
          : [];
        const totalFromItems = normalizedItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        const amount = Number(data.amount) || totalFromItems || 0;
        const saleDate = data.date?.toDate?.() || new Date(data.date || Date.now());
        const shortCode = saleDoc.id.slice(-4).toUpperCase();
        const fallbackDescription =
          data.description ||
          (normalizedItems.length
            ? normalizedItems
                .map((item) => `${item.quantity}x ${item.title}`)
                .join(", ")
            : "Venta externa");
        const items =
          normalizedItems.length > 0
            ? normalizedItems
            : [
                {
                  title: fallbackDescription,
                  quantity: 1,
                  price: amount,
                },
              ];

        return {
          id: `ext-${saleDoc.id}`,
          externalSaleId: saleDoc.id,
          sourceType: "external",
          orderShortCode: `EXT-${shortCode}`,
          orderNumber: data.orderNumber || null,
          date: saleDate,
          customerName: data.customerName || "Cliente externo",
          customerEmail: data.customerEmail || "No disponible",
          customer: {
            firstName: data.customerName || "Cliente externo",
            email: data.customerEmail || "No disponible",
            phone: data.customerPhone || "No especificado",
            notes: data.notes || "",
          },
          total: amount,
          paymentStatus: data.paymentStatus || "completed",
          status: data.status || "FINALIZADO",
          cart: items,
          items,
          description: fallbackDescription,
          paymentMethod: data.paymentMethod || "efectivo",
          hasCommission: Boolean(data.hasCommission),
          isExternalSale: true,
        };
      });

      setExternalOrders(externalData);
    } catch (error) {
      setExternalOrders([]);
    } finally {
      setLoadingExternalOrders(false);
    }
  }, []);

  const addExternalSaleOrder = async (saleData) => {
    try {
      if (!saleData?.customerName || !saleData?.date) {
        return {
          success: false,
          error: "Completa los campos requeridos (cliente y fecha)",
        };
      }

      const sanitizedItems = Array.isArray(saleData.items)
        ? saleData.items
            .map((item) => ({
              title: String(item?.title || "").trim(),
              quantity: Number(item?.quantity) || 0,
              price: Number(item?.price) || 0,
            }))
            .filter((item) => item.title && item.quantity > 0 && item.price >= 0)
        : [];

      const amountFromItems = sanitizedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const manualAmount = Number(saleData.amount);
      const amount = amountFromItems > 0 ? amountFromItems : manualAmount;

      if (!Number.isFinite(amount) || amount <= 0) {
        return {
          success: false,
          error: "Debes ingresar un monto válido o al menos un producto con precio",
        };
      }

      const description =
        saleData.description?.trim() ||
        (sanitizedItems.length
          ? sanitizedItems.map((item) => `${item.quantity}x ${item.title}`).join(", ")
          : "Venta externa");

      const normalizedDate =
        typeof saleData.date === "string" ? new Date(saleData.date) : saleData.date;

      if (!(normalizedDate instanceof Date) || Number.isNaN(normalizedDate.getTime())) {
        return { success: false, error: "La fecha ingresada no es válida" };
      }

      await addDoc(collection(firestoreDB, "external-sales"), {
        customerName: saleData.customerName,
        customerEmail: saleData.customerEmail || "",
        customerPhone: saleData.customerPhone || "",
        description,
        items: sanitizedItems,
        amount,
        paymentMethod: saleData.paymentMethod || "efectivo",
        paymentStatus: "completed",
        status: saleData.status || "FINALIZADO",
        date: normalizedDate,
        notes: saleData.notes || "",
        hasCommission: Boolean(saleData.hasCommission),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await fetchExternalOrders();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Error inesperado" };
    }
  };

  const updateExternalSaleStatus = async (externalOrderId, newStatus) => {
    try {
      if (!externalOrderId || !newStatus) return false;

      const docId = String(externalOrderId).replace(/^ext-/, "");
      await updateDoc(doc(firestoreDB, "external-sales", docId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setExternalOrders((prev) =>
        prev.map((order) =>
          order.id === externalOrderId ? { ...order, status: newStatus } : order
        )
      );

      return true;
    } catch (error) {
      return false;
    }
  };

  const updateExternalSaleOrderDetails = async (externalOrderId, externalData) => {
    try {
      if (!externalOrderId || !externalData) return false;

      const docId = String(externalOrderId).replace(/^ext-/, "");

      const sanitizedItems = Array.isArray(externalData.items)
        ? externalData.items
            .map((item) => ({
              title: String(item?.title || "").trim(),
              quantity: Number(item?.quantity) || 0,
              price: Number(item?.price) || 0,
            }))
            .filter((item) => item.title && item.quantity > 0 && item.price >= 0)
        : [];

      const amountFromItems = sanitizedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const manualAmount = Number(externalData.amount);
      const amount = amountFromItems > 0 ? amountFromItems : manualAmount;

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Debes ingresar un monto válido o productos con precio");
      }

      const description =
        String(externalData.description || "").trim() ||
        (sanitizedItems.length
          ? sanitizedItems.map((item) => `${item.quantity}x ${item.title}`).join(", ")
          : "Venta externa");

      const payload = {
        customerName: externalData.customerName || "Cliente externo",
        customerEmail: externalData.customerEmail || "",
        customerPhone: externalData.customerPhone || "",
        paymentMethod: externalData.paymentMethod || "efectivo",
        description,
        notes: externalData.notes || "",
        amount,
        items: sanitizedItems,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(firestoreDB, "external-sales", docId), payload);

      setExternalOrders((prev) =>
        prev.map((order) => {
          if (order.id !== externalOrderId) return order;

          const normalizedItems =
            sanitizedItems.length > 0
              ? sanitizedItems
              : [
                  {
                    title: description,
                    quantity: 1,
                    price: amount,
                  },
                ];

          return {
            ...order,
            customerName: payload.customerName,
            customerEmail: payload.customerEmail || "No disponible",
            customer: {
              ...order.customer,
              firstName: payload.customerName,
              email: payload.customerEmail || "No disponible",
              phone: payload.customerPhone || "No especificado",
              notes: payload.notes || "",
            },
            paymentMethod: payload.paymentMethod,
            description: payload.description,
            total: payload.amount,
            notes: payload.notes,
            cart: normalizedItems,
            items: normalizedItems,
          };
        })
      );

      return true;
    } catch (error) {
      return false;
    }
  };

  const fetchReservations = useCallback(async () => {
    try {
      setLoadingReservations(true);

      const reservationsRef = collection(firestoreDB, "reservations");
      const q = query(reservationsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const reservationsData = snapshot.docs.map((doc) => {
        const data = doc.data() || {};

        const productPrice = Number(data.productPrice || data.product?.price || 0);
        const quantity = Number(data.quantity || 1);
        const total = productPrice * quantity;

        const customerFirst = data.customerFirstName || data.customer?.firstName || "";
        const customerLast = data.customerLastName || data.customer?.lastName || "";

        return {
          id: doc.id,
          raw: data,
          productId: data.productId || data.product?.id || null,
          productTitle: data.productTitle || data.product?.title || "Producto",
          productPrice: productPrice,
          quantity: quantity,
          total: total,
          customerName: `${customerFirst} ${customerLast}`.trim() || "Cliente",
          customerFirstName: customerFirst,
          customerLastName: customerLast,
          customerEmail: data.customerEmail || data.customer?.email || "No disponible",
          customerPhone: data.customerPhone || data.customer?.phone || null,
          customerAddress: data.customerAddress || data.customer?.address || null,
          customerCity: data.customerCity || data.customer?.city || null,
          customerRegion: data.customerRegion || data.customer?.region || null,
          customerNotes: data.customerNotes || data.customer?.notes || "",
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now()),
        };
      });

      setReservations(reservationsData);
    } catch (error) {
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  const assignOrderNumber = async (orderId, orderNumber) => {
    try {
      if (!orderId || !orderNumber) {
        return false;
      }

      if (String(orderId).startsWith("ext-")) {
        const externalDocId = String(orderId).replace(/^ext-/, "");
        await updateDoc(doc(firestoreDB, "external-sales", externalDocId), {
          orderNumber,
          updatedAt: serverTimestamp(),
        });

        setExternalOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, orderNumber } : order
          )
        );

        return true;
      }
      
      try {
        const orderRef = doc(firestoreDB, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          await updateDoc(orderRef, {
            orderNumber: orderNumber,
            updatedAt: new Date()
          });
          
          setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
              return { ...order, orderNumber };
            }
            return order;
          }));
          
          return true;
        } else {
          throw new Error("Documento no encontrado directamente");
        }
      } catch (directError) {
        const ordersCollection = collection(firestoreDB, "orders");
        const q = query(ordersCollection, where("id", "==", orderId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          return false;
        }
        
        const orderDoc = snapshot.docs[0];
        await updateDoc(doc(firestoreDB, "orders", orderDoc.id), {
          orderNumber: orderNumber,
          updatedAt: new Date()
        });
        
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId || order.orderId === orderId) {
            return { ...order, orderNumber };
          }
          return order;
        }));
        
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  const handleAddProduct = async (productData) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Debes estar autenticado para añadir productos");
      return;
    }

    try {
      const firestoreData = {
        ...productData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid,
      };

      const docRef = await addDoc(
        collection(firestoreDB, "productosmmm"),
        firestoreData
      );

      const newProduct = { id: docRef.id, ...firestoreData };
      setProducts((prev) => [...prev, newProduct]);
      setShowForm(false);
    } catch (error) {
      if (error.code === "permission-denied") {
        alert(
          "Error de permisos: No tienes autorización para añadir productos"
        );
      } else if (error.code === "unavailable") {
        alert("Error de conexión: Verifica tu conexión a internet");
      } else {
        alert(`Error al agregar el producto: ${error.message}`);
      }
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      await updateDoc(
        doc(firestoreDB, "productosmmm", editingProduct.id),
        productData
      );
      updateLocalProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } catch (error) {
      alert("Error al editar el producto: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        await deleteDoc(doc(firestoreDB, "productosmmm", productId));
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } catch (error) {
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const newFeaturedState = !product.featured;
      await updateDoc(doc(firestoreDB, "productosmmm", product.id), {
        featured: newFeaturedState,
      });
      updateLocalProduct(product.id, { featured: newFeaturedState });
    } catch (error) {
      alert("Error al actualizar el estado destacado: " + error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      if (date && typeof date.toDate === "function") {
        return new Date(date.toDate()).toLocaleDateString();
      }

      if (typeof date === "string") {
        return new Date(date).toLocaleDateString();
      }

      if (date instanceof Date) {
        return date.toLocaleDateString();
      }

      return "Fecha inválida";
    } catch (error) {
      return "Error en fecha";
    }
  };

  const formatAddress = (customer) => {
    if (!customer) return "No disponible";
    
    const address = [];
    
    if (customer.address) address.push(customer.address);
    if (customer.city) address.push(customer.city);
    if (customer.region) address.push(customer.region);
    if (customer.postalCode) address.push(customer.postalCode);
    
    return address.join(", ") || "No disponible";
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "aborted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Pagado";
      case "pending":
        return "Pendiente";
      case "failed":
        return "Fallido";
      case "aborted":
        return "Abortado";
      default:
        return status || "Desconocido";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "FINALIZADO":
      case "RETIRADO POR CLIENTE":
        return "bg-green-100 text-green-800";
      case "EMPACADO S/ETIQ.":
      case "EMP. CON ETIQUETA":
        return "bg-blue-100 text-blue-800";
      case "ENVIADO":
        return "bg-indigo-100 text-indigo-800";
      case "ESPERANDO RETIRO":
        return "bg-amber-100 text-amber-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      case "RESERVADO":
        return "bg-pink-100 text-pink-800";
      case "PENDIENTE":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!orderId || !newStatus) {
        return false;
      }

      try {
        const orderRef = doc(firestoreDB, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: new Date()
          });
          
          setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
              return { ...order, status: newStatus };
            }
            return order;
          }));
          
          return true;
        }
        
        throw new Error("Documento no encontrado directamente");
        
      } catch (directError) {
        const ordersCollection = collection(firestoreDB, "orders");
        const q = query(ordersCollection, where("id", "==", orderId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          return false;
        }
        
        const orderDoc = snapshot.docs[0];
        await updateDoc(doc(firestoreDB, "orders", orderDoc.id), {
          status: newStatus,
          updatedAt: new Date()
        });
        
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId) {
            return { ...order, status: newStatus };
          }
          return order;
        }));
        
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const deleteReservation = async (reservationId) => {
    try {
      if (!reservationId) {
        return false;
      }

      const reservationRef = doc(firestoreDB, "reservations", reservationId);
      await deleteDoc(reservationRef);

      setReservations((prev) =>
        prev.filter((r) => r.id !== reservationId)
      );

      return true;
    } catch (error) {
      return false;
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      if (!reservationId || !newStatus) {
        return false;
      }

      try {
        const reservationRef = doc(firestoreDB, "reservations", reservationId);
        const reservationDoc = await getDoc(reservationRef);

        if (reservationDoc.exists()) {
          await updateDoc(reservationRef, {
            status: newStatus,
            updatedAt: new Date(),
          });

          setReservations((prevReservations) =>
            prevReservations.map((reservation) => {
              if (reservation.id === reservationId) {
                return { ...reservation, status: newStatus };
              }
              return reservation;
            })
          );

          return true;
        }

        throw new Error("Documento no encontrado directamente");
      } catch (directError) {
        const reservationsCollection = collection(
          firestoreDB,
          "reservations"
        );
        const q = query(
          reservationsCollection,
          where("id", "==", reservationId)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return false;
        }

        const reservationDoc = snapshot.docs[0];
        await updateDoc(doc(firestoreDB, "reservations", reservationDoc.id), {
          status: newStatus,
          updatedAt: new Date(),
        });

        setReservations((prevReservations) =>
          prevReservations.map((reservation) => {
            if (reservation.id === reservationId) {
              return { ...reservation, status: newStatus };
            }
            return reservation;
          })
        );

        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const updateReservationQuantity = async (reservationId, newQuantity) => {
    try {
      if (!reservationId || typeof newQuantity !== "number") {
        return false;
      }

      try {
        const reservationRef = doc(firestoreDB, "reservations", reservationId);
        const reservationDoc = await getDoc(reservationRef);

        if (reservationDoc.exists()) {
          await updateDoc(reservationRef, {
            quantity: newQuantity,
            updatedAt: new Date(),
          });

          setReservations((prevReservations) =>
            prevReservations.map((reservation) => {
              if (reservation.id === reservationId) {
                return { ...reservation, quantity: newQuantity };
              }
              return reservation;
            })
          );

          return true;
        }

        throw new Error("Documento no encontrado directamente");
      } catch (directError) {
        const reservationsCollection = collection(firestoreDB, "reservations");
        const q = query(reservationsCollection, where("id", "==", reservationId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return false;
        }

        const reservationDoc = snapshot.docs[0];
        await updateDoc(doc(firestoreDB, "reservations", reservationDoc.id), {
          quantity: newQuantity,
          updatedAt: new Date(),
        });

        setReservations((prevReservations) =>
          prevReservations.map((reservation) => {
            if (reservation.id === reservationId) {
              return { ...reservation, quantity: newQuantity };
            }
            return reservation;
          })
        );

        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const requestSort = (field) => {
    setOrderSortField(field);
    
    setOrders((prev) => {
      const sorted = [...prev].sort((a, b) => {
        if (field === "date") {
          return new Date(b.date) - new Date(a.date);
        } else if (field === "total") {
          return b.total - a.total;
        } else if (field === "orderNumber") {
          const numA = a.orderNumber || "";
          const numB = b.orderNumber || "";
          
          if (!numA) return 1;
          if (!numB) return -1;
          if (!numA && !numB) return 0;
          
          return numB.localeCompare(numA);
        } else if (field === "status") {
          const statusPriority = {
            "PENDIENTE": 0,
            "EMPACADO S/ETIQ.": 1,
            "EMP. CON ETIQUETA": 2,
            "ENVIADO": 3,
            "ESPERANDO RETIRO": 4,
            "FINALIZADO": 5,
            "RETIRADO POR CLIENTE": 6,
            "CANCELADO": 7,
            "RESERVADO": 8,
          };
          
          const statusA = a.status || "PENDIENTE";
          const statusB = b.status || "PENDIENTE";
          
          return (statusPriority[statusA] || 99) - (statusPriority[statusB] || 99);
        } else if (field === "paymentStatus") {
          const paymentPriority = {
            "pending": 0,
            "completed": 1,
            "failed": 2,
            "aborted": 3,
          };
          
          const payStatusA = a.paymentStatus || "pending";
          const payStatusB = b.paymentStatus || "pending";
          
          return (paymentPriority[payStatusA] || 99) - (paymentPriority[payStatusB] || 99);
        } else {
          const aValue = a[field]?.toString().toLowerCase() || "";
          const bValue = b[field]?.toString().toLowerCase() || "";
          return aValue.localeCompare(bValue);
        }
      });
      return sorted;
    });
  };

  return {
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
    setProducts,
    orders,
    externalOrders,
    loading,
    loadingOrders,
    loadingExternalOrders,
    reservations,
    loadingReservations,
    orderSortField,
    handleLogin,
    handleLogout,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleFeatured,
    formatDate,
    getPaymentStatusClass,
    getPaymentStatusText,
    getStatusClass,
    updateOrderStatus,
    updateExternalSaleStatus,
    updateExternalSaleOrderDetails,
    requestSort,
    formatAddress,
    fetchOrders,
    fetchExternalOrders,
    addExternalSaleOrder,
    fetchReservations,
    deleteReservation,
    updateReservationStatus,
    updateReservationQuantity,
    assignOrderNumber,
  };
}