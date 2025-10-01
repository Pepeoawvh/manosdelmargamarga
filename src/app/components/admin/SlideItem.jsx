// src/components/admin/SlideItem.jsx
import React from "react";

const typeLabels = {
  full: "Completo (Imagen + Texto + Botones)",
  image: "Solo Imagen",
  imageText: "Imagen + Texto",
};

export default function SlideItem({
  slide,
  moveUp,
  moveDown,
  onEdit,
  onDelete,
  toggleVisibility,
  isFirst,
  isLast,
}) {
  return (
    <div className="bg-white p-4 mb-2 rounded-lg shadow flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded overflow-hidden">
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title || "Slide"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{slide.title || "Sin título"}</h3>
          <p className="text-sm text-gray-500">
            Tipo: {typeLabels[slide.type] || "N/D"}
          </p>
          <p className="text-xs text-gray-400">Orden: {slide.order}</p>
          <p className="text-xs">
            Estado: {slide.visible ? "Visible" : "Oculto"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={moveUp}
          disabled={isFirst}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          aria-label="Mover arriba"
        >
          ↑
        </button>
        <button
          onClick={moveDown}
          disabled={isLast}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          aria-label="Mover abajo"
        >
          ↓
        </button>

        <button
          onClick={() => onEdit(slide)}
          className="px-3 py-1 bg-blue-900 text-white rounded hover:bg-blue-800"
          aria-label="Editar slide"
        >
          Editar
        </button>

        <button
          onClick={() => toggleVisibility(slide)}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          aria-label={slide.visible ? "Ocultar slide" : "Mostrar slide"}
        >
          {slide.visible ? "Ocultar" : "Mostrar"}
        </button>

        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500"
          aria-label="Eliminar slide"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}