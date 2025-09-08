import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestoreDB } from '../../lib/firebase/config';

// Estructura de categorías y subcategorías
export const PRODUCT_CATEGORIES = [
  'Bolitas de Semilla',
  'Papeles',
  'Brandeables', 
  'Celebraciones',
  'Figuras',
  'Hazlo tu mismo',
  'Tarjetas',
  'Ofertas'
];

export const PRODUCT_SUBCATEGORIES = {
  'Papeles': ['Con semilla', 'Sin semilla', 'Oficio', 'Crudo', 'Colores'],
  'Brandeables': ['Etiquetas', 'Credenciales', 'Pulseras'],
  'Celebraciones': ['Agradecimientos', 'Bodas', 'Credenciales', 'Invitaciones', 'Saludos', 'Souvenir-Regalos Corp.'],
  'Figuras': ['Troqueladas', 'Origami'],
  'Hazlo tu mismo': ['Imprimir', 'Pegar', 'Timbrar'],
  'Tarjetas': ['Tarjetas de Presentación', 'Tarjetones']
};

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(firestoreDB, 'productosmmm'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        title: doc.data().title || 'Sin título',
        price: Number(doc.data().price || 0),
        stock: Number(doc.data().stock || 0),
        categories: Array.isArray(doc.data().categories) ? doc.data().categories : [],
        subcategories: Array.isArray(doc.data().subcategories) ? doc.data().subcategories : [],
        featured: Boolean(doc.data().featured)
      }));
      setProducts(productsData);
      return true;
    } catch (error) {
      setError('Error al cargar los productos: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const addProduct = async (productData) => {
    try {
      if (!productData.categories || productData.categories.length === 0) {
        throw new Error('El producto debe tener al menos una categoría');
      }
      const newProduct = {
        ...productData,
        stock: Number(productData.stock),
        price: Number(productData.price),
        categories: Array.isArray(productData.categories) ? productData.categories : [],
        subcategories: Array.isArray(productData.subcategories) ? productData.subcategories : [],
        createdAt: new Date()
      };
      const docRef = await addDoc(collection(firestoreDB, 'productosmmm'), newProduct);
      setProducts(prevProducts => [
        ...prevProducts, 
        { id: docRef.id, ...newProduct }
      ]);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateLocalProduct = (productId, updates) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const removeLocalProduct = (productId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  };

  const updateInventory = async (productId, quantityChange) => {
    try {
      const productToUpdate = products.find(p => p.id === productId);
      if (!productToUpdate) throw new Error('Producto no encontrado');
      const newStock = productToUpdate.stock + quantityChange;
      if (newStock < 0) throw new Error('Stock insuficiente');
      await updateDoc(doc(firestoreDB, 'productosmmm', productId), {
        stock: newStock,
        lastUpdated: new Date()
      });
      updateLocalProduct(productId, { stock: newStock });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(firestoreDB, 'productosmmm', productId));
      removeLocalProduct(productId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Cambios aquí: forzar arrays antes de actualizar
  const updateProduct = async (productId, productData) => {
    try {
      await updateDoc(doc(firestoreDB, 'productosmmm', productId), {
        ...productData,
        categories: Array.isArray(productData.categories) ? productData.categories : [],
        subcategories: Array.isArray(productData.subcategories) ? productData.subcategories : [],
        updatedAt: new Date()
      });
      updateLocalProduct(productId, productData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { 
    products, 
    loading, 
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateLocalProduct,
    removeLocalProduct,
    updateInventory,
    refreshProducts,
    setProducts
  };
}