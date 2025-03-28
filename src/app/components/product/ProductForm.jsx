import { useState, useEffect } from 'react';
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from '../../hooks/shared/useProducts';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    subtitle: product?.subtitle || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    categories: product?.categories || [],
    subcategories: product?.subcategories || [],
    image: product?.image || '',
    featured: product?.featured || false,
  });

  // Log inicial
  console.log('ProductForm inicializado con datos:', product || 'nuevo producto');
  
  // Obtener subcategorías disponibles basadas en las categorías seleccionadas
  const getAvailableSubcategories = () => {
    let available = [];
    formData.categories.forEach(category => {
      if (PRODUCT_SUBCATEGORIES[category]) {
        available = [...available, ...PRODUCT_SUBCATEGORIES[category]];
      }
    });
    return [...new Set(available)]; // Eliminar duplicados
  };

  const availableSubcategories = getAvailableSubcategories();

  const handleCategoryChange = (category) => {
    console.log('Cambiando categoría:', category);
    
    setFormData(prev => {
      // Determinar las nuevas categorías
      let newCategories;
      if (prev.categories.includes(category)) {
        newCategories = prev.categories.filter(c => c !== category);
      } else {
        newCategories = [...prev.categories, category];
      }

      // Filtrar las subcategorías para mantener solo las válidas
      const validSubcategories = prev.subcategories.filter(sub => {
        return newCategories.some(cat => 
          PRODUCT_SUBCATEGORIES[cat] && PRODUCT_SUBCATEGORIES[cat].includes(sub)
        );
      });
      
      console.log('Nuevas categorías:', newCategories);
      console.log('Subcategorías válidas:', validSubcategories);

      return {
        ...prev,
        categories: newCategories,
        subcategories: validSubcategories
      };
    });
  };

  const handleSubcategoryChange = (subcategory) => {
    console.log('Cambiando subcategoría:', subcategory);
    
    setFormData(prev => {
      if (prev.subcategories.includes(subcategory)) {
        return {
          ...prev,
          subcategories: prev.subcategories.filter(s => s !== subcategory)
        };
      } else {
        return {
          ...prev,
          subcategories: [...prev.subcategories, subcategory]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('------ ENVIANDO FORMULARIO ------');
    console.log('Datos del formulario que se enviarán:', formData);
    
    // Validar campos obligatorios
    if (!formData.title.trim()) {
      console.error('Error: Título vacío');
      alert('El título es obligatorio');
      return;
    }
    
    if (!formData.image.trim()) {
      console.error('Error: URL de imagen vacía');
      alert('La URL de la imagen es obligatoria');
      return;
    }
    
    if (!formData.categories || formData.categories.length === 0) {
      console.error('Error: No hay categorías seleccionadas');
      alert('Debes seleccionar al menos una categoría');
      return;
    }
    
    // Formatear datos para envío
    const dataToSubmit = {
      ...formData,
      price: formData.price === '' ? 0 : Number(formData.price),
      stock: formData.stock === '' ? 0 : Number(formData.stock)
    };
    
    console.log('Datos finales formateados para envío:', dataToSubmit);
    
    onSubmit(dataToSubmit);
  };

  return (
    <div className="bg-white w-full border border-gray-200 rounded shadow-sm text-sm">
      <div className="border-b px-3 py-2 bg-gray-50">
        <h3 className="text-base font-medium text-gray-700">
          {product ? 'Editar producto' : 'Nuevo producto'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Columna izquierda */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                placeholder="Ej: Papel reciclado 20x30"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtítulo/Promocional</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                placeholder="Ej: ¡Ideal para invitaciones!"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL de la imagen</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                placeholder="https://ejemplo.com/imagen.jpg"
                required
              />
              <p className="text-xs text-gray-400 mt-0.5">Ingrese una URL válida de imagen</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                rows="3"
                placeholder="Describa su producto en detalle..."
                required
              />
            </div>

            
          </div>
          
          {/* Columna derecha */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-gray-500 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-5 py-1 px-2 text-xs border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categorías</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-1 bg-white">
                {PRODUCT_CATEGORIES.map((category) => (
                  <div key={category} className="mb-0.5">
                    <label className="flex items-center space-x-1 cursor-pointer py-0.5 px-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                      />
                      <span className="text-xs">{category}</span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Seleccione al menos una categoría</p>
            </div>
            
            {formData.categories.length > 0 && availableSubcategories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subcategorías</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-1 bg-white">
                  {availableSubcategories.map((subcategory) => (
                    <div key={subcategory} className="mb-0.5">
                      <label className="flex items-center space-x-1 cursor-pointer py-0.5 px-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.subcategories.includes(subcategory)}
                          onChange={() => handleSubcategoryChange(subcategory)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                        />
                        <span className="text-xs">{subcategory}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Seleccione las subcategorías correspondientes</p>
              </div>
            )}
            
            <div className="mt-1">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                />
                <span className="text-xs font-medium text-gray-700">Producto destacado</span>
              </label>
              <p className="text-xs text-gray-400 ml-4">Los productos destacados aparecen en la página principal</p>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-3 flex justify-end space-x-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Guardar producto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;