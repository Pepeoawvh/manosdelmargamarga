import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { firestoreDB, auth } from '../../lib/firebase/config';
import useProducts from '../shared/useProducts';

export default function useAdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { products, loading, updateLocalProduct, setProducts } = useProducts();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Estado de autenticación actualizado:', user ? 
        `Usuario: ${user.email} (${user.uid})` : 'No autenticado');
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Verificación adicional del estado de autenticación
  useEffect(() => {
    console.log('Verificando autenticación inicial...');
    const currentUser = auth.currentUser;
    console.log('Usuario actual:', currentUser ? 
      {email: currentUser.email, uid: currentUser.uid} : 'No hay usuario autenticado');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Intentando iniciar sesión con:', email);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión exitoso');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Cierre de sesión exitoso');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  };

  const handleAddProduct = async (productData) => {
    console.log('------ INICIANDO AÑADIR PRODUCTO ------');
    console.log('Datos recibidos:', productData);
    
    // Verificar autenticación
    const currentUser = auth.currentUser;
    console.log('Usuario actual:', currentUser ? 
      {uid: currentUser.uid, email: currentUser.email} : 'No autenticado');
    
    if (!currentUser) {
      console.error('Error: Usuario no autenticado');
      alert('Debes estar autenticado para añadir productos');
      return;
    }
    
    try {
      console.log('Colección destino:', 'productosmmm');
      
      // Formatear datos para Firestore
      const timestamp = new Date();
      const firestoreData = {
        ...productData,
        createdAt: timestamp.toISOString(),
        createdBy: currentUser.uid
      };
      
      console.log('Datos formateados para Firestore:', firestoreData);
      
      // Intentar añadir documento
      console.log('Intentando añadir documento...');
      const docRef = await addDoc(collection(firestoreDB, 'productosmmm'), firestoreData);
      
      console.log('¡Documento añadido exitosamente!', 'ID:', docRef.id);
      
      const newProduct = { id: docRef.id, ...firestoreData };
      setProducts(prev => [...prev, newProduct]);
      setShowForm(false);
      
      console.log('------ PRODUCTO AÑADIDO CORRECTAMENTE ------');
    } catch (error) {
      console.error('------ ERROR AL AÑADIR PRODUCTO ------');
      console.error('Código de error:', error.code);
      console.error('Mensaje de error:', error.message);
      console.error('Error completo:', error);
      
      if (error.code === 'permission-denied') {
        alert('Error de permisos: No tienes autorización para añadir productos');
      } else if (error.code === 'unavailable') {
        alert('Error de conexión: Verifica tu conexión a internet');
      } else {
        alert(`Error al agregar el producto: ${error.message}`);
      }
    }
  };

  const handleEditProduct = async (productData) => {
    console.log('Editando producto:', editingProduct.id, productData);
    try {
      await updateDoc(doc(firestoreDB, 'productosmmm', editingProduct.id), productData);
      console.log('Producto actualizado correctamente');
      updateLocalProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al editar:', error);
      alert('Error al editar el producto: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      console.log('Eliminando producto:', productId);
      try {
        await deleteDoc(doc(firestoreDB, 'productosmmm', productId));
        console.log('Producto eliminado correctamente');
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el producto: ' + error.message);
      }
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const newFeaturedState = !product.featured;
      console.log(`Cambiando estado destacado: ${product.title} -> ${newFeaturedState}`);
      await updateDoc(doc(firestoreDB, 'productosmmm', product.id), {
        featured: newFeaturedState
      });
      console.log('Estado destacado actualizado correctamente');
      updateLocalProduct(product.id, { featured: newFeaturedState });
    } catch (error) {
      console.error('Error al actualizar estado destacado:', error);
      alert('Error al actualizar el estado destacado: ' + error.message);
    }
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
    loading,
    // Handlers
    handleLogin,
    handleLogout,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleFeatured
  };
}