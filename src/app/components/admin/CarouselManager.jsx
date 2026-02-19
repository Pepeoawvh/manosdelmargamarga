import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useCarouselManager from "../../hooks/admin/useCarouselManager";
import SlideForm from "../slides/SlideForm";

// Iconos simples SVG inline (puedes reemplazar por Heroicons o similares)
const IconEdit = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const IconDelete = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14H7L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

function SortableItem({ id, slide, onEdit, onDelete, isDeleting }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    marginBottom: "8px",
    backgroundColor: isDragging ? "#e0f2fe" : "white",
    borderRadius: "6px",
    boxShadow: isDragging
      ? "0 4px 12px rgba(0,0,0,0.15)"
      : "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      aria-label={`Slide ${slide.title || "sin título"}`}
    >
      {/* Área draggable - thumbnail + texto */}
      <div 
        className="flex items-center space-x-3 flex-1 cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title || "Slide"}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-gray-400">Sin imagen</span>
          )}
        </div>
        <div>
          <strong className="block">{slide.title || "Sin título"}</strong>
          <span className="text-sm text-gray-600">Orden: {slide.order}</span>
        </div>
      </div>

      {/* Botones - NO draggable */}
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(slide);
          }}
          title="Editar slide"
          className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer transition-colors"
          type="button"
        >
          <IconEdit />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slide.id);
          }}
          title={isDeleting ? "Eliminando..." : "Eliminar slide"}
          disabled={isDeleting}
          className={`p-1 rounded hover:bg-red-100 text-red-700 transition-colors ${
            isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          type="button"
        >
          <IconDelete />
        </button>
      </div>
    </div>
  );
}

export default function CarouselManager() {
  const {
    slides,
    loading,
    error,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
  } = useCarouselManager();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const openForm = (slide = null) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSlide(null);
  };

  const handleSubmit = async (data) => {
    try {
      console.log("💾 Guardando slide...", {
        editing: !!editingSlide,
        slideId: editingSlide?.id,
        dataKeys: Object.keys(data),
        hasLayout: !!data.layout,
        hasStyling: !!data.styling,
        fullData: data,
      });
      
      if (editingSlide) {
        await updateSlide(editingSlide.id, data);
        console.log("✅ Slide actualizado exitosamente");
        showToast("success", `✅ Slide "${data.title || 'sin título'}" actualizado correctamente en Firestore`);
      } else {
        await addSlide(data);
        console.log("✅ Slide creado exitosamente");
        showToast("success", `✅ Slide "${data.title || 'sin título'}" creado correctamente`);
      }
      closeForm();
    } catch (e) {
      console.error("❌ Error guardando slide:", e);
      showToast("error", `❌ Error al guardar: ${e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (slides.length <= 1) {
      alert("Debe haber al menos un slide");
      return;
    }
    if (!window.confirm("¿Eliminar este slide?")) return;

    setDeletingId(id);
    try {
      await deleteSlide(id);
    } catch {
      alert("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(slides, oldIndex, newIndex);

    try {
      const orderedSlides = newOrder.map((s, i) => ({ id: s.id, order: i + 1 }));
      await reorderSlides(orderedSlides);
    } catch {
      alert("Error guardando nuevo orden");
    }
  };

  if (loading) return <p>Cargando slides...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Toast de notificación */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <button
        onClick={() => openForm()}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        type="button"
      >
        Añadir Slide
      </button>

      {isFormOpen && (
        <SlideForm
          initialData={editingSlide}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slides.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {slides.map((slide) => (
            <SortableItem
              key={slide.id}
              id={slide.id}
              slide={slide}
              onEdit={openForm}
              onDelete={handleDelete}
              isDeleting={deletingId === slide.id}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}