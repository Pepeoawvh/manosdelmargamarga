import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestoreDB } from '../../lib/firebase/config';

export default function useCarouselManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar slides
  useEffect(() => {
    const q = query(collection(firestoreDB, 'carousel-slides'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slidesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSlides(slidesData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Añadir slide (solo con URL)
  const addSlide = async (slideData) => {
    try {
      // Verificar que hay una URL de imagen
      if (!slideData.imageUrl) {
        return { success: false, error: 'Se requiere una URL de imagen' };
      }
      
      // Determinar el orden (último + 1)
      const order = slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 1;
      
      await addDoc(collection(firestoreDB, 'carousel-slides'), {
        ...slideData,
        order,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Actualizar slide
  const updateSlide = async (id, slideData) => {
    try {
      // Verificar que hay una URL de imagen
      if (!slideData.imageUrl) {
        return { success: false, error: 'Se requiere una URL de imagen' };
      }
      
      await updateDoc(doc(firestoreDB, 'carousel-slides', id), {
        ...slideData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Eliminar slide
  const deleteSlide = async (id) => {
    try {
      await deleteDoc(doc(firestoreDB, 'carousel-slides', id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Reordenar slides
  const reorderSlides = async (newOrder) => {
    try {
      const batch = writeBatch(firestoreDB);
      
      newOrder.forEach((slide, index) => {
        const slideRef = doc(firestoreDB, 'carousel-slides', slide.id);
        batch.update(slideRef, { order: index + 1 });
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    slides,
    loading,
    error,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides
  };
}