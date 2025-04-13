import React, { useState } from 'react';
import useCarouselManager from '../../hooks/admin/useCarouselManager';
import SlideForm from '../slides/SlideForm';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Componente de elemento arrastrable
const DraggableSlideItem = ({ slide, index, moveSlide, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SLIDE',
    item: { id: slide.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SLIDE',
    hover: (item, monitor) => {
      if (item.index === index) return;
      moveSlide(item.index, index);
      item.index = index;
    },
  });

  const opacity = isDragging ? 0.4 : 1;
  const typeLabels = {
    'full': 'Completo (Imagen + Texto + Botones)',
    'image': 'Solo Imagen',
    'imageText': 'Imagen + Texto'
  };

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className="bg-white p-4 mb-2 rounded-lg shadow flex items-center justify-between"
      style={{ opacity }}
    >
      <div className="flex items-center space-x-3">
        <div className="cursor-move text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </div>
        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded overflow-hidden">
          <img src={slide.imageUrl} alt={slide.title || "Slide image"} className="h-full w-full object-cover" />
        </div>
        <div>
          <h3 className="font-medium">{slide.title || "Sin título"}</h3>
          <p className="text-sm text-gray-500">Tipo: {typeLabels[slide.type]}</p>
          <p className="text-xs text-gray-400">Orden: {slide.order}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onEdit(slide)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(slide.id, slide.imageUrl)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

// Componente principal
export default function CarouselManager() {
  const { slides, loading, error, addSlide, updateSlide, deleteSlide, reorderSlides } = useCarouselManager();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const handleAddClick = () => {
    setEditingSlide(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (slide) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSlide(null);
  };

  // Simplificada para solo usar slideData sin imageFile
  const handleSubmit = async (slideData) => {
    if (editingSlide) {
      await updateSlide(editingSlide.id, slideData);
    } else {
      await addSlide(slideData);
    }
    handleCloseForm();
  };

  // Simplificada para no pasar imageUrl
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este slide?')) {
      await deleteSlide(id);
    }
  };

  const moveSlide = (fromIndex, toIndex) => {
    const updatedSlides = [...slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    
    // No actualizamos Firestore en cada movimiento para evitar muchas escrituras
    // Solo cuando se confirma el orden
    return updatedSlides;
  };

  const handleSaveOrder = async (newOrder) => {
    await reorderSlides(newOrder);
  };

  if (loading) return <div className="text-center py-8">Cargando slides...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Administrar Carrusel</h2>
        <button 
          onClick={handleAddClick}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Añadir Nuevo Slide
        </button>
      </div>

      {isFormOpen && (
        <SlideForm 
          initialData={editingSlide} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseForm} 
        />
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Slides Existentes</h3>
        
        {slides.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No hay slides añadidos todavía.</p>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <DraggableSlideItem 
                  key={slide.id}
                  slide={slide}
                  index={index}
                  moveSlide={(fromIndex, toIndex) => {
                    const newOrder = moveSlide(fromIndex, toIndex);
                    // Aplicamos el reordenamiento de manera visual inmediatamente
                  }}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <div className="mt-4 text-right">
              <button 
                onClick={() => handleSaveOrder(slides)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Guardar Orden
              </button>
            </div>
          </DndProvider>
        )}
      </div>
    </div>
  );
}