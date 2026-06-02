"use client";

import { useState } from "react";
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from "../../hooks/shared/useProducts";
import { toSlug } from "../../utils/slug"; // crea este helper o pega la función en este archivo

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    subtitle: product?.subtitle || "",
    description: product?.description || "",
    price: product?.price || "",
    stock: product?.stock || 0,
    categories: Array.isArray(product?.categories) ? product?.categories : [],
    subcategories: Array.isArray(product?.subcategories) ? product?.subcategories : [],
    image: product?.image || "",
    additionalImages: Array.isArray(product?.additionalImages) 
      ? [...product.additionalImages, "", "", ""].slice(0, 3)
      : ["", "", ""],
    oldPrice: product?.oldPrice || "",
    featured: product?.featured || false,
    reservable: product?.reservable || false,
    hidePrice: product?.hidePrice || false,
    personalizable: product?.personalizable || false,
    // Si ya existe slug en el doc, úsalo; permite editarlo manualmente si quieres
    slug: product?.slug || "",
  });

  const getAvailableSubcategories = () => {
    let available = [];
    formData.categories.forEach((category) => {
      if (PRODUCT_SUBCATEGORIES[category]) {
        available = [...available, ...PRODUCT_SUBCATEGORIES[category]];
      }
    });
    return [...new Set(available)];
  };

  const availableSubcategories = getAvailableSubcategories();

  const handleCategoryChange = (category) => {
    setFormData((prev) => {
      let newCategories;
      if (prev.categories.includes(category)) {
        newCategories = prev.categories.filter((c) => c !== category);
      } else {
        newCategories = [...prev.categories, category];
      }
      const validSubcategories = prev.subcategories.filter((sub) =>
        newCategories.some((cat) => PRODUCT_SUBCATEGORIES[cat] && PRODUCT_SUBCATEGORIES[cat].includes(sub))
      );
      return {
        ...prev,
        categories: newCategories,
        subcategories: validSubcategories,
      };
    });
  };

  const handleSubcategoryChange = (subcategory) => {
    setFormData((prev) => {
      if (prev.subcategories.includes(subcategory)) {
        return { ...prev, subcategories: prev.subcategories.filter((s) => s !== subcategory) };
      } else {
        return { ...prev, subcategories: [...prev.subcategories, subcategory] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("El título es obligatorio");
      return;
    }
    if (!formData.image.trim()) {
      alert("La URL de la imagen es obligatoria");
      return;
    }
    if (!formData.categories || formData.categories.length === 0) {
      alert("Debes seleccionar al menos una categoría");
      return;
    }

    // Genera/normaliza el slug
    const generatedSlug = toSlug(formData.title);
    const finalSlug = (formData.slug && toSlug(formData.slug)) || generatedSlug;

    // Filtrar imágenes adicionales no vacías
    const filteredAdditionalImages = formData.additionalImages.filter(img => img.trim() !== "");

    const dataToSubmit = {
      ...formData,
      reservable: !!formData.reservable,
      hidePrice: !!formData.hidePrice,
      personalizable: !!formData.personalizable,
      slug: finalSlug, // asegura que exista y esté normalizado
      price: formData.price === "" ? 0 : Number(formData.price),
      oldPrice: formData.oldPrice === "" ? 0 : Number(formData.oldPrice),
      stock: formData.stock === "" ? 0 : Number(formData.stock),
      categories: Array.isArray(formData.categories) ? formData.categories : [],
      subcategories: Array.isArray(formData.subcategories) ? formData.subcategories : [],
      additionalImages: filteredAdditionalImages,
    };

    // Solo incluir id si es edición
    if (product?.id) {
      dataToSubmit.id = product.id;
    }

    onSubmit(dataToSubmit);
  };

  return (
    <div className="bg-white w-full border border-gray-200 rounded shadow-sm text-sm">
      <div className="border-b px-3 py-2 bg-gray-50">
        <h3 className="text-base font-medium text-gray-700">{product ? "Editar producto" : "Nuevo producto"}</h3>
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                placeholder="Ej: Papel reciclado 20x30"
                required
              />
            </div>

            {/* Campo opcional para slug editable por SEO/URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Slug (opcional)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                placeholder="papel-reciclado-20x30"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">Si lo dejas vacío, se genera desde el título.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL de la imagen principal w320xh360</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                placeholder="https://ejemplo.com/imagen.jpg"
                required
              />
              <p className="text-xs text-gray-400 mt-0.5">Imagen principal del producto (obligatoria)</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Imágenes adicionales (opcional)</label>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="url"
                    value={formData.additionalImages[index] || ""}
                    onChange={(e) => {
                      const newAdditionalImages = [...formData.additionalImages];
                      newAdditionalImages[index] = e.target.value;
                      setFormData({ ...formData, additionalImages: newAdditionalImages });
                    }}
                    className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                    placeholder={`Imagen adicional ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Hasta 3 imágenes adicionales (opcional)</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full py-1 px-2 text-xs border border-gray-300 rounded"
                rows="3"
                placeholder="Describa su producto en detalle..."
                required
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio oferta</label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-gray-500 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-5 py-1 px-2 text-xs border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Precio normal{" "}
                  <span className="text-gray-400 font-normal">(tachado)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-gray-500 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full pl-5 py-1 px-2 text-xs border border-gray-300 rounded"
                    placeholder="Opcional"
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
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                        className="rounded text-[#798f38] focus:ring-[#9bb05b] h-3 w-3"
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
                          className="rounded text-[#798f38] focus:ring-emerald-500 h-3 w-3"
                        />
                        <span className="text-xs">{subcategory}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Seleccione las subcategorías correspondientes</p>
              </div>
            )}

            <div className="mt-1 flex flex-col gap-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                />
                <span className="text-xs font-medium text-gray-700">Producto destacado</span>
              </label>
              <p className="text-xs text-gray-400 ml-4">Los productos destacados aparecen en la página principal</p>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reservable}
                  onChange={(e) => setFormData({ ...formData, reservable: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                />
                <span className="text-xs font-medium text-gray-700">Producto reservable</span>
              </label>
              <p className="text-xs text-gray-400 ml-4">Si está activo, el producto podrá ser reservado</p>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.personalizable}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      personalizable: checked,
                    }));
                  }}
                  className="rounded text-[#798f38] focus:ring-[#9bb05b] h-3 w-3"
                />
                <span className="text-xs font-medium text-gray-700">Producto personalizable</span>
              </label>
              <p className="text-xs text-gray-400 ml-4">El producto se crea a pedido. Muestra botón «Cotizar» en vez de agregar al carrito.</p>

              <label className="flex items-center space-x-1 cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={formData.hidePrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hidePrice: e.target.checked }))}
                  className="rounded text-[#798f38] focus:ring-[#9bb05b] h-3 w-3"
                />
                <span className="text-xs font-medium text-gray-600">No mostrar precio</span>
              </label>
              <p className="text-xs text-gray-400 ml-7">El precio no se muestra en la tarjeta ni en el detalle del producto.</p>
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
          <button type="submit" className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Guardar producto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
