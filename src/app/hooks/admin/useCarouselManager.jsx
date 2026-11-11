import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase/config";

export default function useCarouselManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(firestoreDB, "carousel-slides"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slidesData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSlides(slidesData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const addSlide = async (slideData) => {
    try {
      const maxOrder = slides.length ? Math.max(...slides.map((s) => s.order || 0)) : 0;
      await addDoc(collection(firestoreDB, "carousel-slides"), {
        ...slideData,
        order: maxOrder + 1,
        visible: slideData.visible ?? true,
      });
    } catch (err) {
      throw new Error("Error agregando slide: " + err.message);
    }
  };

  const updateSlide = async (id, slideData) => {
    try {
      const docRef = doc(firestoreDB, "carousel-slides", id);
      // Usar setDoc con merge:true para asegurar que todos los campos se actualicen correctamente
      // incluyendo objetos anidados como layout y styling
      await updateDoc(docRef, {
        ...slideData,
        // Asegurar que los objetos anidados se actualicen completamente
        layout: slideData.layout || {},
        styling: slideData.styling || {},
        primaryButton: slideData.primaryButton || {},
        secondaryButton: slideData.secondaryButton || {},
      });
    } catch (err) {
      console.error("Error actualizando slide:", err);
      throw new Error("Error actualizando slide: " + err.message);
    }
  };

  const deleteSlide = async (id) => {
    try {
      const docRef = doc(firestoreDB, "carousel-slides", id);
      await deleteDoc(docRef);

      // Obtener slides actuales para reindexar (consulta fresca)
      const q = query(collection(firestoreDB, "carousel-slides"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const remaining = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const batch = writeBatch(firestoreDB);
      remaining.forEach((s, i) => {
        batch.update(doc(firestoreDB, "carousel-slides", s.id), { order: i + 1 });
      });
      await batch.commit();
    } catch (err) {
      throw new Error("Error eliminando slide: " + err.message);
    }
  };

  const reorderSlides = async (orderedSlides) => {
    try {
      const batch = writeBatch(firestoreDB);
      orderedSlides.forEach((s, i) => {
        batch.update(doc(firestoreDB, "carousel-slides", s.id), { order: i + 1 });
      });
      await batch.commit();
    } catch (err) {
      throw new Error("Error reordenando slides: " + err.message);
    }
  };

  return { slides, loading, error, addSlide, updateSlide, deleteSlide, reorderSlides };
}