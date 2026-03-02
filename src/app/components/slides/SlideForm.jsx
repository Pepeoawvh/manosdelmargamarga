import React, { useEffect, useState } from "react";

// Valores por defecto fuera del componente para evitar recreación en cada render
const SLIDE_DEFAULTS = {
  type: "full",
  title: "",
  description: "",
  imageUrl: "",
  mobileImageUrl: "",
  objectPosition: "center", // Punto focal imagen desktop
  mobileObjectPosition: "center", // Punto focal imagen móvil
  primaryButton: { text: "", url: "", show: false },
  secondaryButton: { text: "", url: "", show: false },
  visible: true,
  // Nuevas opciones de diseño
  layout: {
    horizontalAlign: "left", // left, center, right
    verticalAlign: "center", // top, center, bottom
    textAlign: "left", // left, center
    maxWidth: "2xl", // sm, md, lg, xl, 2xl, full
  },
  styling: {
    titleSize: "large", // small, medium, large, xlarge
    titleColor: "#ffffff",
    descriptionColor: "#ffffff",
    overlayOpacity: 40, // 0-100
    overlayColor: "black", // black, white, green, custom
  },
};

export default function SlideForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || SLIDE_DEFAULTS);
  const [preview, setPreview] = useState(initialData?.imageUrl || "");
  const [activeSection, setActiveSection] = useState("basic"); // basic, layout, styling

  // Actualizar formData cuando initialData cambie (incluyendo cuando se abre/cierra el modal)
  useEffect(() => {
    if (initialData) {
      // Asegurar que el initialData tenga todas las propiedades necesarias
      const mergedData = {
        ...SLIDE_DEFAULTS,
        ...initialData,
        objectPosition: initialData.objectPosition || "center",
        mobileObjectPosition: initialData.mobileObjectPosition || "center",
        layout: { ...SLIDE_DEFAULTS.layout, ...(initialData.layout || {}) },
        styling: { ...SLIDE_DEFAULTS.styling, ...(initialData.styling || {}) },
        primaryButton: { ...SLIDE_DEFAULTS.primaryButton, ...(initialData.primaryButton || {}) },
        secondaryButton: { ...SLIDE_DEFAULTS.secondaryButton, ...(initialData.secondaryButton || {}) },
      };
      setFormData(mergedData);
      setPreview(initialData.imageUrl || "");
    } else {
      // Si no hay initialData, resetear a defaults (nuevo slide)
      setFormData(SLIDE_DEFAULTS);
      setPreview("");
      setActiveSection("basic");
    }
  }, [initialData]); // Cambiar dependencia: ejecutar cada vez que initialData cambie, no solo el ID

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      const parts = name.split(".");
      const [parent, child] = parts;
      
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: type === "checkbox" ? checked : value 
      }));
      if (name === "imageUrl") setPreview(value);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    console.log("📝 SlideForm enviando datos:", {
      type: formData.type,
      title: formData.title,
      hasLayout: !!formData.layout,
      layout: formData.layout,
      hasStyling: !!formData.styling,
      styling: formData.styling,
      allKeys: Object.keys(formData),
    });
    onSubmit(formData);
  };

  const showText = formData.type !== "image";

  // Paleta de colores profesionales
  const colorPresets = [
    { name: "Blanco", value: "#ffffff" },
    { name: "Negro", value: "#000000" },
    { name: "Verde Marca", value: "#798f38" },
    { name: "Verde Oscuro", value: "#3a5729" },
    { name: "Verde Claro", value: "#b4cf66" },
    { name: "Gris Oscuro", value: "#535550" },
    { name: "Gris Claro", value: "#9ca3af" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-medium mb-4">{initialData ? "Editar Slide" : "Añadir Nuevo Slide"}</h3>
      
      {/* Navegación por pestañas */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          type="button"
          onClick={() => setActiveSection("basic")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "basic"
              ? "border-b-2 border-blue-900 text-blue-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📄 Básico
        </button>
        {showText && (
          <>
            <button
              type="button"
              onClick={() => setActiveSection("layout")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeSection === "layout"
                  ? "border-b-2 border-blue-900 text-blue-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📐 Posicionamiento
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("styling")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeSection === "styling"
                  ? "border-b-2 border-blue-900 text-blue-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🎨 Estilos
            </button>
          </>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Sección Básico */}
        {activeSection === "basic" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Slide</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2"
              >
                <option value="full">Completo (Imagen, Texto, Botones)</option>
                <option value="image">Solo Imagen</option>
                <option value="imageText">Imagen + Texto</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === "full" && "Ideal para llamadas a la acción con botones"}
                {formData.type === "image" && "Perfecto para banners visuales sin texto"}
                {formData.type === "imageText" && "Combina imagen con texto, sin botones"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL de imagen (Desktop)</label>
              <input 
                type="url" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                placeholder="https://ejemplo.com/imagen.jpg"
                required 
              />
              {preview && (
                <div className="mt-2">
                  <img 
                    src={preview} 
                    alt="Vista previa" 
                    className="h-32 w-auto rounded border object-cover" 
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                URL de imagen para móvil 
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <input 
                type="url" 
                name="mobileImageUrl" 
                value={formData.mobileImageUrl || ""} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                placeholder="https://ejemplo.com/imagen-mobile.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no se especifica, se usará la imagen principal en móvil
              </p>
            </div>

            {/* Controles de punto focal — solo para tipo Solo Imagen */}
            {!showText && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-amber-50 rounded border border-amber-200">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Punto focal — Desktop
                    <span className="text-gray-400 font-normal ml-1">(objectPosition)</span>
                  </label>
                  <select
                    name="objectPosition"
                    value={formData.objectPosition || "center"}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="center">Centro</option>
                    <option value="top">Arriba</option>
                    <option value="bottom">Abajo</option>
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                    <option value="top left">Arriba izquierda</option>
                    <option value="top right">Arriba derecha</option>
                    <option value="bottom left">Abajo izquierda</option>
                    <option value="bottom right">Abajo derecha</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Controla qué parte de la imagen se muestra en pantallas anchas
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Punto focal — Móvil
                    <span className="text-gray-400 font-normal ml-1">(objectPosition)</span>
                  </label>
                  <select
                    name="mobileObjectPosition"
                    value={formData.mobileObjectPosition || "center"}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="center">Centro</option>
                    <option value="top">Arriba</option>
                    <option value="bottom">Abajo</option>
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                    <option value="top left">Arriba izquierda</option>
                    <option value="top right">Arriba derecha</option>
                    <option value="bottom left">Abajo izquierda</option>
                    <option value="bottom right">Abajo derecha</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Controla qué parte de la imagen se muestra en móvil
                  </p>
                </div>
              </div>
            )}

            {showText && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2"
                    placeholder="Título principal del slide"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    rows={3}
                    placeholder="Texto descriptivo del slide"
                  />
                </div>
              </>
            )}

            {formData.type === "full" && (
              <>
                <fieldset className="border rounded p-3 bg-gray-50">
                  <legend className="text-sm font-medium text-gray-700 px-2">Botón Primario</legend>
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      id="primaryButton.show" 
                      type="checkbox" 
                      name="primaryButton.show" 
                      checked={formData.primaryButton?.show || false} 
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="primaryButton.show" className="text-sm">Mostrar botón primario</label>
                  </div>
                  {formData.primaryButton?.show && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Texto</label>
                        <input 
                          type="text" 
                          name="primaryButton.text" 
                          value={formData.primaryButton?.text || ""} 
                          onChange={handleChange} 
                          className="w-full border rounded px-3 py-2"
                          placeholder="Ver más"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input 
                          type="url" 
                          name="primaryButton.url" 
                          value={formData.primaryButton?.url || ""} 
                          onChange={handleChange} 
                          className="w-full border rounded px-3 py-2"
                          placeholder="/catalogo"
                        />
                      </div>
                    </div>
                  )}
                </fieldset>

                <fieldset className="border rounded p-3 bg-gray-50">
                  <legend className="text-sm font-medium text-gray-700 px-2">Botón Secundario</legend>
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      id="secondaryButton.show" 
                      type="checkbox" 
                      name="secondaryButton.show" 
                      checked={formData.secondaryButton?.show || false} 
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="secondaryButton.show" className="text-sm">Mostrar botón secundario</label>
                  </div>
                  {formData.secondaryButton?.show && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Texto</label>
                        <input 
                          type="text" 
                          name="secondaryButton.text" 
                          value={formData.secondaryButton?.text || ""} 
                          onChange={handleChange} 
                          className="w-full border rounded px-3 py-2"
                          placeholder="Contactar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input 
                          type="url" 
                          name="secondaryButton.url" 
                          value={formData.secondaryButton?.url || ""} 
                          onChange={handleChange} 
                          className="w-full border rounded px-3 py-2"
                          placeholder="/contacto"
                        />
                      </div>
                    </div>
                  )}
                </fieldset>
              </>
            )}

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
              <input 
                id="visible" 
                type="checkbox" 
                name="visible" 
                checked={formData.visible ?? true} 
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label htmlFor="visible" className="text-sm font-medium">Slide visible en el sitio</label>
            </div>
          </div>
        )}

        {/* Sección Posicionamiento */}
        {activeSection === "layout" && showText && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alineación Horizontal</label>
                <select 
                  name="layout.horizontalAlign" 
                  value={formData.layout?.horizontalAlign || "left"} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="left">⬅️ Izquierda</option>
                  <option value="center">↔️ Centro</option>
                  <option value="right">➡️ Derecha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alineación Vertical</label>
                <select 
                  name="layout.verticalAlign" 
                  value={formData.layout?.verticalAlign || "center"} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="top">⬆️ Arriba</option>
                  <option value="center">↕️ Centro</option>
                  <option value="bottom">⬇️ Abajo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alineación del Texto</label>
              <select 
                name="layout.textAlign" 
                value={formData.layout?.textAlign || "left"} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2"
              >
                <option value="left">Alineado a la izquierda</option>
                <option value="center">Centrado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ancho Máximo del Contenido</label>
              <select 
                name="layout.maxWidth" 
                value={formData.layout?.maxWidth || "2xl"} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2"
              >
                <option value="sm">Pequeño (24rem)</option>
                <option value="md">Mediano (28rem)</option>
                <option value="lg">Grande (32rem)</option>
                <option value="xl">Extra Grande (36rem)</option>
                <option value="2xl">2X Grande (42rem)</option>
                <option value="full">Ancho completo</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Controla el ancho máximo del contenedor de texto
              </p>
            </div>

            {/* Vista previa visual del posicionamiento */}
            <div className="border-2 border-dashed rounded p-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Vista previa del layout:</p>
              <div className="relative h-32 bg-gray-200 rounded flex items-{formData.layout?.verticalAlign || 'center'} justify-{formData.layout?.horizontalAlign || 'left'} p-4">
                <div className={`bg-blue-900 text-white p-3 rounded text-xs text-${formData.layout?.textAlign || 'left'} max-w-${formData.layout?.maxWidth || '2xl'}`}>
                  <div className="font-bold">Título del Slide</div>
                  <div className="text-xs opacity-75">Descripción del slide</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección Estilos */}
        {activeSection === "styling" && showText && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tamaño del Título</label>
              <select 
                name="styling.titleSize" 
                value={formData.styling?.titleSize || "large"} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2"
              >
                <option value="small">Pequeño (1.5rem / 24px)</option>
                <option value="medium">Mediano (2rem / 32px)</option>
                <option value="large">Grande (2.5rem / 40px)</option>
                <option value="xlarge">Extra Grande (3rem / 48px)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color del Título</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      styling: { ...prev.styling, titleColor: color.value }
                    }))}
                    className={`p-3 rounded border-2 transition-all ${
                      formData.styling?.titleColor === color.value
                        ? "border-blue-900 ring-2 ring-blue-300"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              <input 
                type="color" 
                name="styling.titleColor" 
                value={formData.styling?.titleColor || "#ffffff"} 
                onChange={handleChange} 
                className="w-full h-10 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Color actual: {formData.styling?.titleColor || "#ffffff"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color de la Descripción</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      styling: { ...prev.styling, descriptionColor: color.value }
                    }))}
                    className={`p-3 rounded border-2 transition-all ${
                      formData.styling?.descriptionColor === color.value
                        ? "border-blue-900 ring-2 ring-blue-300"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              <input 
                type="color" 
                name="styling.descriptionColor" 
                value={formData.styling?.descriptionColor || "#ffffff"} 
                onChange={handleChange} 
                className="w-full h-10 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Color actual: {formData.styling?.descriptionColor || "#ffffff"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Opacidad del Overlay: {formData.styling?.overlayOpacity || 40}%
              </label>
              <input 
                type="range" 
                name="styling.overlayOpacity" 
                min="0" 
                max="100" 
                step="5"
                value={formData.styling?.overlayOpacity || 40} 
                onChange={handleChange} 
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sin overlay</span>
                <span>Overlay oscuro</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color del Overlay</label>
              <select 
                name="styling.overlayColor" 
                value={formData.styling?.overlayColor || "black"} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2"
              >
                <option value="black">⚫ Negro</option>
                <option value="white">⚪ Blanco</option>
                <option value="green">🟢 Verde Marca</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                El overlay ayuda a que el texto sea legible sobre la imagen
              </p>
            </div>

            {/* Vista previa de colores */}
            <div className="border-2 border-dashed rounded p-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Vista previa de colores:</p>
              <div className="bg-gray-300 rounded p-4 relative overflow-hidden">
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundColor: 
                      formData.styling?.overlayColor === "green" ? "#798f38" :
                      formData.styling?.overlayColor === "white" ? "#ffffff" : "#000000",
                    opacity: (formData.styling?.overlayOpacity || 40) / 100 
                  }}
                />
                <div className="relative z-10">
                  <h4 
                    style={{ 
                      color: formData.styling?.titleColor || "#ffffff",
                      fontSize: 
                        formData.styling?.titleSize === "small" ? "1.5rem" :
                        formData.styling?.titleSize === "medium" ? "2rem" :
                        formData.styling?.titleSize === "xlarge" ? "3rem" : "2.5rem"
                    }}
                    className="font-bold"
                  >
                    Título de Ejemplo
                  </h4>
                  <p style={{ color: formData.styling?.descriptionColor || "#ffffff" }}>
                    Esta es una descripción de ejemplo para el slide
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción (siempre visibles) */}
        <div className="flex items-center gap-3 pt-4 border-t sticky bottom-0 bg-white">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors font-medium"
          >
            {initialData ? "💾 Guardar Cambios" : "✨ Crear Slide"}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ✕ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
