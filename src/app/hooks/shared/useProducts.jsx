import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";

export const PRODUCT_CATEGORIES = [
  "Bolitas de Semilla",
  "Papeles",
  "Brandeables",
  "Celebraciones",
  "Figuras",
  "Hazlo tu mismo",
  "Tarjetas",
  "Ofertas",
];

export const PRODUCT_SUBCATEGORIES = {
  Papeles: ["Con semilla", "Sin semilla", "Oficio", "Crudo", "Colores"],
  Brandeables: ["Etiquetas", "Credenciales", "Pulseras"],
  Celebraciones: ["Agradecimientos", "Bodas", "Credenciales", "Invitaciones", "Saludos", "Souvenir-Regalos Corp."],
  Figuras: ["Troqueladas", "Origami"],
  "Hazlo tu mismo": ["Imprimir", "Pegar", "Timbrar"],
  Tarjetas: ["Tarjetas de Presentación", "Tarjetones"],
};

const cleanObject = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = await getDocs(collection(firestoreDB, "productosmmm"));
      const productsData = qs.docs.map((d) => {
        const data = d.data() || {};
        return {
          id: d.id,
          ...data, // incluye slug si existe
          title: data.title || "Sin título",
          price: Number(data.price || 0),
          stock: Number(data.stock || 0),
          categories: Array.isArray(data.categories) ? data.categories : [],
          subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
          featured: Boolean(data.featured),
        };
      });
      setProducts(productsData);
      return true;
    } catch (err) {
      setError("Error al cargar los productos: " + err.message);
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
        throw new Error("El producto debe tener al menos una categoría");
      }
      const { id, ...rest } = productData;
      const cleanedProduct = cleanObject(rest); // mantiene slug si viene
      const newProduct = {
        ...cleanedProduct, // slug incluido aquí
        stock: Number(cleanedProduct.stock || 0),
        price: Number(cleanedProduct.price || 0),
        categories: Array.isArray(cleanedProduct.categories) ? cleanedProduct.categories : [],
        subcategories: Array.isArray(cleanedProduct.subcategories) ? cleanedProduct.subcategories : [],
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(firestoreDB, "productosmmm"), newProduct);

      setProducts((prev) => [...prev, { id: docRef.id, ...newProduct }]); // mantiene slug en estado

      return { success: true, id: docRef.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateLocalProduct = (productId, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
  };

  const removeLocalProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateInventory = async (productId, quantityChange) => {
    try {
      const productToUpdate = products.find((p) => p.id === productId);
      if (!productToUpdate) throw new Error("Producto no encontrado");
      const newStock = productToUpdate.stock + quantityChange;
      if (newStock < 0) throw new Error("Stock insuficiente");

      await updateDoc(doc(firestoreDB, "productosmmm", productId), {
        stock: newStock,
        lastUpdated: new Date(),
      });

      updateLocalProduct(productId, { stock: newStock });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(firestoreDB, "productosmmm", productId));
      removeLocalProduct(productId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const { id, ...rest } = productData;
      const cleanedProduct = cleanObject(rest); // puede incluir slug actualizado
      await updateDoc(doc(firestoreDB, "productosmmm", productId), {
        ...cleanedProduct,
        categories: Array.isArray(cleanedProduct.categories) ? cleanedProduct.categories : [],
        subcategories: Array.isArray(cleanedProduct.subcategories) ? cleanedProduct.subcategories : [],
        updatedAt: new Date(),
      });

      updateLocalProduct(productId, cleanedProduct); // refleja slug en estado
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
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
    setProducts,
  };
}
