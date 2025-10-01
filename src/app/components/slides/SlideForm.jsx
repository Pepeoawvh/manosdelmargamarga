import React, { useEffect, useState } from "react";

export default function SlideForm({ initialData, onSubmit, onCancel }) {
  const defaults = {
    type: "full",
    title: "",
    description: "",
    imageUrl: "",
    primaryButton: { text: "", url: "", show: false },
    secondaryButton: { text: "", url: "", show: false },
    visible: true,
  };
  const [formData, setFormData] = useState(initialData || defaults);
  const [preview, setPreview] = useState(initialData?.imageUrl || "");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreview(initialData.imageUrl || "");
    }
  }, [initialData?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((p) => ({ ...p, [parent]: { ...p[parent], [child]: type === "checkbox" ? checked : value } }));
    } else {
      setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
      if (name === "imageUrl") setPreview(value);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showText = formData.type !== "image";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-medium mb-4">{initialData ? "Editar Slide" : "Añadir Nuevo Slide"}</h3>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="full">Completo (Imagen, Texto, Botones)</option>
            <option value="image">Solo Imagen</option>
            <option value="imageText">Imagen + Texto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL de imagen</label>
          <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          {preview && <img src={preview} alt="Vista previa" className="h-32 w-auto rounded border object-cover mt-2" />}
        </div>

        {showText && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
          </>
        )}

        <fieldset className="border rounded p-3">
          <legend className="text-sm text-gray-600">Botón primario</legend>
          <div className="flex items-center gap-3 mb-2">
            <input id="primaryButton.show" type="checkbox" name="primaryButton.show" checked={formData.primaryButton?.show || false} onChange={handleChange} />
            <label htmlFor="primaryButton.show">Mostrar</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Texto</label>
              <input type="text" name="primaryButton.text" value={formData.primaryButton?.text || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!formData.primaryButton?.show} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input type="url" name="primaryButton.url" value={formData.primaryButton?.url || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!formData.primaryButton?.show} />
            </div>
          </div>
        </fieldset>

        <fieldset className="border rounded p-3">
          <legend className="text-sm text-gray-600">Botón secundario</legend>
          <div className="flex items-center gap-3 mb-2">
            <input id="secondaryButton.show" type="checkbox" name="secondaryButton.show" checked={formData.secondaryButton?.show || false} onChange={handleChange} />
            <label htmlFor="secondaryButton.show">Mostrar</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Texto</label>
              <input type="text" name="secondaryButton.text" value={formData.secondaryButton?.text || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!formData.secondaryButton?.show} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input type="url" name="secondaryButton.url" value={formData.secondaryButton?.url || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!formData.secondaryButton?.show} />
            </div>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <input id="visible" type="checkbox" name="visible" checked={formData.visible ?? true} onChange={handleChange} />
          <label htmlFor="visible">Visible</label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded">{initialData ? "Guardar" : "Crear"}</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
