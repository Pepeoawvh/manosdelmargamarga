import React, { useState, useEffect } from 'react';

export default function SlideForm({ initialData, onSubmit, onCancel }) {
  const defaultData = {
    type: 'full',
    title: '',
    description: '',
    imageUrl: '',
    primaryButton: {
      text: '',
      url: '',
      show: false
    },
    secondaryButton: {
      text: '',
      url: '',
      show: false
    },
    active: true
  };

  const [formData, setFormData] = useState(initialData || defaultData);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });

      // Actualizar la vista previa de la imagen cuando se cambia la URL
      if (name === 'imageUrl') {
        setImagePreview(value);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Función para validar URL de imagen
  const isValidImageUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || 
           url.includes('cloudinary.com') || 
           url.includes('imgur.com');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-medium mb-4">
        {initialData ? 'Editar Slide' : 'Añadir Nuevo Slide'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tipo de Slide</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="full">Completo (Imagen + Texto + Botones)</option>
                <option value="image">Solo Imagen</option>
                <option value="imageText">Imagen + Texto</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL de la Imagen</label>
              <input 
                type="url" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange}
                placeholder="https://example.com/imagen.jpg"
                className="w-full p-2 border rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa la URL de una imagen ya subida a internet
              </p>
              
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      onError={() => setImagePreview('')}
                      className="h-full w-full object-cover" 
                    />
                    {!isValidImageUrl(imagePreview) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70">
                        <p className="text-sm text-gray-600">Vista previa no disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {(formData.type === 'full' || formData.type === 'imageText') && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>
              </>
            )}
          </div>

          {formData.type === 'full' && (
            <div>
              <div className="border-t md:border-t-0 pt-4 md:pt-0">
                <h4 className="font-medium mb-3">Botón Primario</h4>
                <div className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    name="primaryButton.show" 
                    checked={formData.primaryButton.show} 
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Mostrar botón primario</label>
                </div>

                {formData.primaryButton.show && (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Texto del botón</label>
                      <input 
                        type="text" 
                        name="primaryButton.text" 
                        value={formData.primaryButton.text} 
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">URL del botón</label>
                      <input 
                        type="text" 
                        name="primaryButton.url" 
                        value={formData.primaryButton.url} 
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-3">Botón Secundario</h4>
                <div className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    name="secondaryButton.show" 
                    checked={formData.secondaryButton.show} 
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Mostrar botón secundario</label>
                </div>

                {formData.secondaryButton.show && (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Texto del botón</label>
                      <input 
                        type="text" 
                        name="secondaryButton.text" 
                        value={formData.secondaryButton.text} 
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">URL del botón</label>
                      <input 
                        type="text" 
                        name="secondaryButton.url" 
                        value={formData.secondaryButton.url} 
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={!formData.imageUrl}
          >
            {initialData ? 'Actualizar Slide' : 'Añadir Slide'}
          </button>
        </div>
      </form>
    </div>
  );
}