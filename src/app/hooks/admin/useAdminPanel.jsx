import { useState, useEffect, useCallback } from "react";import {
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
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSortField, setOrderSortField] = useState("date"); // Campo por defecto para ordenar
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "Estado de autenticación actualizado:",
        user ? `Usuario: ${user.email} (${user.uid})` : "No autenticado"
      );
      setIsLoggedIn(!!user);

      // Cargar pedidos cuando el usuario esté autenticado
      if (user) {
        fetchOrders();
        fetchReservations();
      }
    });
    return () => unsubscribe();
  }, []);

  // Verificación adicional del estado de autenticación
  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log(
      "Usuario actual:",
      currentUser
        ? { email: currentUser.email, uid: currentUser.uid }
        : "No hay usuario autenticado"
    );
  }, []);

  // Listener en tiempo real para reservas cuando el admin está autenticado
  useEffect(() => {
    if (!isLoggedIn) return;

    const reservationsRef = collection(firestoreDB, "reservations");
    const q = query(reservationsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
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
        } catch (err) {
          console.error("Error procesando snapshot de reservas:", err);
        }
      },
      (err) => {
        console.error("onSnapshot reservas error:", err);
      }
    );

    return () => unsubscribe();
  }, [isLoggedIn]);

  // Función para obtener los pedidos desde Firestore
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
  
      const ordersRef = collection(firestoreDB, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        return {
          id: doc.id,
          ...data,
          cart: data.cart || [], // Aseguramos que el carrito siempre esté disponible
          orderNumber: data.orderNumber || null,
          orderId: data.orderId || doc.id,
          date: data.createdAt?.toDate() || new Date(),
          customerName: data.customer?.firstName
            ? `${data.customer.firstName} ${data.customer.lastName || ""}`
            : "Cliente",
          customerEmail: data.customer?.email || "No disponible",
          total: data.summary?.total || 0,
          paymentStatus: data.paymentStatus || "pending",
          status: data.status || "pendiente",
        };
      });
  
      
     
      const ordersWithCart = ordersData.filter(order => order.cart && order.cart.length > 0);
      
      setOrders(ordersData);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Función para obtener las reservas desde Firestore
  const fetchReservations = useCallback(async () => {
    try {
      setLoadingReservations(true);

      const reservationsRef = collection(firestoreDB, "reservations");
      const q = query(reservationsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const reservationsData = snapshot.docs.map((doc) => {
        const data = doc.data() || {};

        // Normalizar campos para que coincidan con la estructura de orders
        const productPrice = Number(data.productPrice || data.product?.price || 0);
        const quantity = Number(data.quantity || 1);
        const total = productPrice * quantity;

        const customerFirst = data.customerFirstName || data.customer?.firstName || "";
        const customerLast = data.customerLastName || data.customer?.lastName || "";

        return {
          id: doc.id,
          // mantener los campos originales por si se necesitan
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
      console.error("Error al cargar reservas:", error);
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  // Función para asignar manualmente un número de orden
  const assignOrderNumber = async (orderId, orderNumber) => {
    try {
      if (!orderId || !orderNumber) {
        console.error("ID de pedido o número de orden no proporcionados");
        return false;
      }
      
      console.log(`Asignando número de orden ${orderNumber} al pedido ${orderId}`);
      
      try {
        // Buscar por ID de documento primero
        const orderRef = doc(firestoreDB, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
        
        // Si el documento existe con este ID, actualizarlo
        if (orderDoc.exists()) {
          console.log(`Documento encontrado con ID ${orderId}, asignando número de orden...`);
          
          await updateDoc(orderRef, {
            orderNumber: orderNumber,
            updatedAt: new Date()
          });
          
          // Actualizar en estado local
          setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
              return { ...order, orderNumber };
            }
            return order;
          }));
          
          console.log(`Número de orden ${orderNumber} asignado correctamente al pedido ${orderId}`);
          return true;
        } else {
          // Si llegamos aquí, el documento no existe con ese ID directo
          console.log(`Documento con ID ${orderId} no encontrado directamente, buscando por campo 'id'...`);
          throw new Error("Documento no encontrado directamente");
        }
      } catch (directError) {
        console.log("Búsqueda directa falló, intentando consulta alternativa");
        
        // Intento alternativo: buscar por campo 'id'
        const ordersCollection = collection(firestoreDB, "orders");
        const q = query(ordersCollection, where("id", "==", orderId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.error(`No se encontró ningún pedido con id=${orderId}`);
          return false;
        }
        
        // Usar el primer documento encontrado
        const orderDoc = snapshot.docs[0];
        console.log(`Orden encontrada con documento ID: ${orderDoc.id}`);
        
        // Actualizar usando el ID real del documento
        await updateDoc(doc(firestoreDB, "orders", orderDoc.id), {
          orderNumber: orderNumber,
          updatedAt: new Date()
        });
        
        // Actualizar en estado local
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId || order.orderId === orderId) {
            return { ...order, orderNumber };
          }
          return order;
        }));
        
        console.log(`Número de orden ${orderNumber} asignado correctamente al pedido ${orderId} (usando búsqueda por campo 'id')`);
        return true;
      }
    } catch (error) {
      console.error("Error general al asignar número de orden:", error);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión con:", email);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Inicio de sesión exitoso");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Cierre de sesión exitoso");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión");
    }
  };

  const handleAddProduct = async (productData) => {
    console.log("------ INICIANDO AÑADIR PRODUCTO ------");
    console.log("Datos recibidos:", productData);

    // Verificar autenticación
    const currentUser = auth.currentUser;
    console.log(
      "Usuario actual:",
      currentUser
        ? { uid: currentUser.uid, email: currentUser.email }
        : "No autenticado"
    );

    if (!currentUser) {
      console.error("Error: Usuario no autenticado");
      alert("Debes estar autenticado para añadir productos");
      return;
    }

    try {
      console.log("Colección destino:", "productosmmm");

      // Formatear datos para Firestore
      const timestamp = new Date();
      const firestoreData = {
        ...productData,
        createdAt: timestamp.toISOString(),
        createdBy: currentUser.uid,
      };

      console.log("Datos formateados para Firestore:", firestoreData);

      // Intentar añadir documento
      console.log("Intentando añadir documento...");
      const docRef = await addDoc(
        collection(firestoreDB, "productosmmm"),
        firestoreData
      );

      console.log("¡Documento añadido exitosamente!", "ID:", docRef.id);

      const newProduct = { id: docRef.id, ...firestoreData };
      setProducts((prev) => [...prev, newProduct]);
      setShowForm(false);

      console.log("------ PRODUCTO AÑADIDO CORRECTAMENTE ------");
    } catch (error) {
      console.error("------ ERROR AL AÑADIR PRODUCTO ------");
      console.error("Código de error:", error.code);
      console.error("Mensaje de error:", error.message);
      console.error("Error completo:", error);

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
    console.log("Editando producto:", editingProduct.id, productData);
    try {
      await updateDoc(
        doc(firestoreDB, "productosmmm", editingProduct.id),
        productData
      );
      console.log("Producto actualizado correctamente");
      updateLocalProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error al editar:", error);
      alert("Error al editar el producto: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      console.log("Eliminando producto:", productId);
      try {
        await deleteDoc(doc(firestoreDB, "productosmmm", productId));
        console.log("Producto eliminado correctamente");
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const newFeaturedState = !product.featured;
      console.log(
        `Cambiando estado destacado: ${product.title} -> ${newFeaturedState}`
      );
      await updateDoc(doc(firestoreDB, "productosmmm", product.id), {
        featured: newFeaturedState,
      });
      console.log("Estado destacado actualizado correctamente");
      updateLocalProduct(product.id, { featured: newFeaturedState });
    } catch (error) {
      console.error("Error al actualizar estado destacado:", error);
      alert("Error al actualizar el estado destacado: " + error.message);
    }
  };

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      // Si es timestamp de Firestore
      if (date && typeof date.toDate === "function") {
        return new Date(date.toDate()).toLocaleDateString();
      }

      // Si es string ISO
      if (typeof date === "string") {
        return new Date(date).toLocaleDateString();
      }

      // Si ya es Date
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }

      return "Fecha inválida";
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  // Función para formatear direcciones
  const formatAddress = (customer) => {
    if (!customer) return "No disponible";
    
    const address = [];
    
    if (customer.address) address.push(customer.address);
    if (customer.city) address.push(customer.city);
    if (customer.region) address.push(customer.region);
    if (customer.postalCode) address.push(customer.postalCode);
    
    return address.join(", ") || "No disponible";
  };

  // Función para obtener clase CSS según estado de pago
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

  // Función para obtener texto según estado de pago
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

  // Función para obtener clase CSS según estado de pedido
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

  // Función para actualizar el estado de un pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!orderId || !newStatus) {
        console.error("ID de pedido o nuevo estado no proporcionados");
        return false;
      }
      
      console.log(`Actualizando pedido ${orderId} al estado ${newStatus}`);
      
      // IMPORTANTE: Primero intenta obtener el documento para verificar si existe
      try {
        const orderRef = doc(firestoreDB, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
        
        // Si el documento existe con este ID, actualizarlo directamente
        if (orderDoc.exists()) {
          console.log(`Documento encontrado directamente con ID ${orderId}, actualizando...`);
          
          await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: new Date()
          });
          
          // Actualizar en estado local
          setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
              return { ...order, status: newStatus };
            }
            return order;
          }));
          
          console.log(`Pedido ${orderId} actualizado correctamente a estado: ${newStatus}`);
          return true;
        }
        
        // Si llegamos aquí, el documento no existe con ese ID directo
        console.log(`Documento con ID ${orderId} no encontrado directamente, buscando por campo 'id'...`);
        throw new Error("Documento no encontrado directamente");
        
      } catch (directError) {
        console.log("Búsqueda directa falló, intentando consulta alternativa");
        
        // Intento alternativo: buscar por campo 'id'
        const ordersCollection = collection(firestoreDB, "orders");
        const q = query(ordersCollection, where("id", "==", orderId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.error(`No se encontró ningún pedido con id=${orderId}`);
          return false;
        }
        
        // Usar el primer documento encontrado
        const orderDoc = snapshot.docs[0];
        console.log(`Orden encontrada con documento ID: ${orderDoc.id}`);
        
        // Actualizar usando el ID real del documento
        await updateDoc(doc(firestoreDB, "orders", orderDoc.id), {
          status: newStatus,
          updatedAt: new Date()
        });
        
        // Actualizar en estado local
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId) {
            return { ...order, status: newStatus };
          }
          return order;
        }));
        
        console.log(`Pedido ${orderId} actualizado correctamente a estado: ${newStatus} (usando búsqueda por campo)`);
        return true;
      }
    } catch (error) {
      console.error("Error general al actualizar estado del pedido:", error);
      return false;
    }
  };

  // Función para eliminar una reserva
  const deleteReservation = async (reservationId) => {
    try {
      if (!reservationId) {
        console.error("ID de reserva no proporcionado");
        return false;
      }

      console.log(`Intentando eliminar reserva: ${reservationId}`);

      // Usar el ID directamente como docId en Firestore
      const reservationRef = doc(firestoreDB, "reservations", reservationId);
      
      // Eliminar directamente
      await deleteDoc(reservationRef);
      console.log(`Reserva ${reservationId} eliminada de Firestore`);

      // Actualizar en estado local
      setReservations((prev) =>
        prev.filter((r) => r.id !== reservationId)
      );

      console.log(`Reserva ${reservationId} eliminada correctamente del estado local`);
      return true;
    } catch (error) {
      console.error("Error general al eliminar reserva:", error);
      return false;
    }
  };

  // Función para actualizar el estado de una reserva
  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      if (!reservationId || !newStatus) {
        console.error("ID de reserva o nuevo estado no proporcionados");
        return false;
      }

      console.log(
        `Actualizando reserva ${reservationId} al estado ${newStatus}`
      );

      // Primero intenta obtener el documento para verificar si existe
      try {
        const reservationRef = doc(firestoreDB, "reservations", reservationId);
        const reservationDoc = await getDoc(reservationRef);

        if (reservationDoc.exists()) {
          console.log(
            `Documento de reserva encontrado directamente con ID ${reservationId}`
          );

          await updateDoc(reservationRef, {
            status: newStatus,
            updatedAt: new Date(),
          });

          // Actualizar en estado local
          setReservations((prevReservations) =>
            prevReservations.map((reservation) => {
              if (reservation.id === reservationId) {
                return { ...reservation, status: newStatus };
              }
              return reservation;
            })
          );

          console.log(
            `Reserva ${reservationId} actualizada correctamente a estado: ${newStatus}`
          );
          return true;
        }

        // Si llegamos aquí, el documento no existe con ese ID directo
        console.log(
          `Documento con ID ${reservationId} no encontrado directamente`
        );
        throw new Error("Documento no encontrado directamente");
      } catch (directError) {
        console.log("Búsqueda directa falló, intentando consulta alternativa");

        // Intento alternativo: buscar por campo 'id'
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
          console.error(
            `No se encontró ninguna reserva con id=${reservationId}`
          );
          return false;
        }

        // Usar el primer documento encontrado
        const reservationDoc = snapshot.docs[0];
        console.log(`Reserva encontrada con documento ID: ${reservationDoc.id}`);

        // Actualizar usando el ID real del documento
        await updateDoc(doc(firestoreDB, "reservations", reservationDoc.id), {
          status: newStatus,
          updatedAt: new Date(),
        });

        // Actualizar en estado local
        setReservations((prevReservations) =>
          prevReservations.map((reservation) => {
            if (reservation.id === reservationId) {
              return { ...reservation, status: newStatus };
            }
            return reservation;
          })
        );

        console.log(
          `Reserva ${reservationId} actualizada correctamente a estado: ${newStatus} (usando búsqueda por campo)`
        );
        return true;
      }
    } catch (error) {
      console.error("Error general al actualizar estado de reserva:", error);
      return false;
    }
  };

  // Función para actualizar la cantidad de una reserva (no toca stock de productos)
  const updateReservationQuantity = async (reservationId, newQuantity) => {
    try {
      if (!reservationId || typeof newQuantity !== "number") {
        console.error("ID de reserva o cantidad no proporcionados");
        return false;
      }

      console.log(
        `Actualizando cantidad de reserva ${reservationId} a ${newQuantity}`
      );

      // Intento directo por ID
      try {
        const reservationRef = doc(firestoreDB, "reservations", reservationId);
        const reservationDoc = await getDoc(reservationRef);

        if (reservationDoc.exists()) {
          await updateDoc(reservationRef, {
            quantity: newQuantity,
            updatedAt: new Date(),
          });

          // Actualizar en estado local
          setReservations((prevReservations) =>
            prevReservations.map((reservation) => {
              if (reservation.id === reservationId) {
                return { ...reservation, quantity: newQuantity };
              }
              return reservation;
            })
          );

          console.log(
            `Cantidad de reserva ${reservationId} actualizada a ${newQuantity}`
          );
          return true;
        }

        throw new Error("Documento no encontrado directamente");
      } catch (directError) {
        console.log("Búsqueda directa falló, intentando consulta alternativa");
        const reservationsCollection = collection(firestoreDB, "reservations");
        const q = query(reservationsCollection, where("id", "==", reservationId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error(`No se encontró ninguna reserva con id=${reservationId}`);
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

        console.log(
          `Cantidad de reserva ${reservationId} actualizada a ${newQuantity} (usando búsqueda por campo)`
        );
        return true;
      }
    } catch (error) {
      console.error("Error general al actualizar cantidad de reserva:", error);
      return false;
    }
  };

  // Función mejorada para ordenar pedidos, pero simplificada para orderNumber
  const requestSort = (field) => {
    console.log(`Ordenando por ${field}`);
    setOrderSortField(field);
    
    setOrders((prev) => {
      const sorted = [...prev].sort((a, b) => {
        if (field === "date") {
          // Para fechas, asegurarse de compararlas como fechas
          return new Date(b.date) - new Date(a.date);
        } else if (field === "total") {
          // Para totales, comparar como números
          return b.total - a.total; // Ordenar de mayor a menor
        } else if (field === "orderNumber") {
          // Ordenamiento básico para orderNumber
          const numA = a.orderNumber || "";
          const numB = b.orderNumber || "";
          
          // Si alguno no tiene número, ponerlo al final
          if (!numA) return 1;
          if (!numB) return -1;
          if (!numA && !numB) return 0;
          
          // Ordenar por número
          return numB.localeCompare(numA); // Mayor a menor
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
          // Para texto, comparar como strings (case-insensitive)
          const aValue = a[field]?.toString().toLowerCase() || "";
          const bValue = b[field]?.toString().toLowerCase() || "";
          return aValue.localeCompare(bValue);
        }
      });
      return sorted;
    });
  };

  return {
    // Estado
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
    loading,
    loadingOrders,
    reservations,
    loadingReservations,
    orderSortField,
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
    fetchOrders,
    // Funciones para reservas
    fetchReservations,
    deleteReservation,
    updateReservationStatus,
    updateReservationQuantity,
    assignOrderNumber, // Esta es la función que estamos agregando
  };
}