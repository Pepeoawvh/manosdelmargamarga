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
  primaryButton: {
    text: "",
    url: "",
    show: false,
    color: "#798f38",
    textColor: "#ffffff",
    borderColor: "#798f38",
    style: "solid",
    size: "md",
    radius: "md",
  },
  secondaryButton: {
    text: "",
    url: "",
    show: false,
    color: "#ffffff",
    textColor: "#ffffff",
    borderColor: "#ffffff",
    style: "outline",
    size: "md",
    radius: "md",
  },
  autoplaySpeed: 6, // Velocidad en segundos (2-10)
  previewBreakpoint: "desktop", // mobile, tablet, desktop
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
  const [mobilePreview, setMobilePreview] = useState(initialData?.mobileImageUrl || "");
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
        autoplaySpeed: initialData.autoplaySpeed || 6,
        previewBreakpoint: initialData.previewBreakpoint || "desktop",
        layout: { ...SLIDE_DEFAULTS.layout, ...(initialData.layout || {}) },
        styling: { ...SLIDE_DEFAULTS.styling, ...(initialData.styling || {}) },
        primaryButton: { ...SLIDE_DEFAULTS.primaryButton, ...(initialData.primaryButton || {}) },
        secondaryButton: { ...SLIDE_DEFAULTS.secondaryButton, ...(initialData.secondaryButton || {}) },
      };
      setFormData(mergedData);
      setPreview(initialData.imageUrl || "");
      setMobilePreview(initialData.mobileImageUrl || "");
    } else {
      // Si no hay initialData, resetear a defaults (nuevo slide)
      setFormData(SLIDE_DEFAULTS);
      setPreview("");
      setMobilePreview("");
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
      if (name === "mobileImageUrl") setMobilePreview(value);
    }
  };

  // Aplicar presets de opacidad
  const applyOpacityPreset = (value) => {
    setFormData(prev => ({
      ...prev,
      styling: { ...prev.styling, overlayOpacity: value }
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showText = formData.type !== "image";
  const previewVerticalClass = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
  }[formData.layout?.verticalAlign || "center"];
  const previewHorizontalClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[formData.layout?.horizontalAlign || "left"];
  const previewTextClass = {
    left: "text-left",
    center: "text-center",
  }[formData.layout?.textAlign || "left"];

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

  const previewButtonClass = (button) => {
    const sizeMap = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
    };
    const radiusMap = {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    };
    return `font-medium transition-all border-2 ${sizeMap[button?.size || "md"]} ${radiusMap[button?.radius || "md"]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 max-h-[82vh] flex flex-col overflow-hidden">
      <div className="px-4 md:px-5 pt-4 pb-3 border-b bg-white">
        <h3 className="text-lg font-semibold leading-tight">{initialData ? "Editar Slide" : "Añadir Nuevo Slide"}</h3>
        <p className="text-xs text-gray-500 mt-1">Formulario optimizado para edición rápida</p>
      </div>

      {/* Navegación por pestañas */}
      <div className="px-4 md:px-5 pt-2 border-b bg-white">
        <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveSection("basic")}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
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
              className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
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
              className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
                activeSection === "styling"
                  ? "border-b-2 border-blue-900 text-blue-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🎨 Estilos
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setActiveSection("advanced")}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            activeSection === "advanced"
              ? "border-b-2 border-blue-900 text-blue-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ⚙️ Configuración
        </button>
        </div>
      </div>

      <form id="slide-form" onSubmit={submit} className="flex-1 overflow-y-auto px-4 md:px-5 py-3 space-y-3 text-sm">
        {/* Sección Básico */}
        {activeSection === "basic" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Slide</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full border rounded-sm px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">
                URL de imagen — Desktop
                <span className="ml-1 text-xs font-normal text-gray-400">(horizontal · recomendado 1920×560 px)</span>
              </label>
              <input 
                type="url" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                className="w-full border rounded-sm px-3 py-2" 
                placeholder="https://ejemplo.com/imagen-desktop.jpg"
                required 
              />
              {preview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Vista previa desktop:</p>
                  <img 
                    src={preview} 
                    alt="Vista previa desktop" 
                    className="h-20 w-auto rounded-sm border object-cover" 
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                URL de imagen — Móvil
                <span className="ml-1 text-xs font-normal text-gray-400">(vertical · recomendado 750×1000 px)</span>
              </label>
              <input 
                type="url" 
                name="mobileImageUrl" 
                value={formData.mobileImageUrl || ""} 
                onChange={handleChange} 
                className="w-full border rounded-sm px-3 py-2" 
                placeholder="https://ejemplo.com/imagen-movil.jpg"
              />
              <div className="mt-2 p-2.5 bg-blue-50 rounded-sm border border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-medium">💡 Imagen móvil (portrait)</p>
                <p>Formato vertical ideal: <strong>750×1000 px</strong> o proporción <strong>3:4</strong></p>
                <p>Si no se carga, se usará la imagen desktop (puede verse recortada en móvil)</p>
              </div>
              {mobilePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Vista previa móvil:</p>
                  <img 
                    src={mobilePreview} 
                    alt="Vista previa móvil" 
                    className="h-28 w-auto rounded-sm border object-cover" 
                    style={{ maxWidth: "108px" }}
                  />
                </div>
              )}
            </div>

            {/* Controles de punto focal — solo para tipo Solo Imagen */}
            {!showText && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2.5 bg-amber-50 rounded-sm border border-amber-200">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Punto focal — Desktop
                    <span className="text-gray-400 font-normal ml-1">(objectPosition)</span>
                  </label>
                  <select
                    name="objectPosition"
                    value={formData.objectPosition || "center"}
                    onChange={handleChange}
                    className="w-full border rounded-sm px-3 py-2 text-sm"
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
                    className="w-full border rounded-sm px-3 py-2 text-sm"
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
                    className="w-full border rounded-sm px-3 py-2"
                    placeholder="Título principal del slide"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full border rounded-sm px-3 py-2" 
                    rows={3}
                    placeholder="Texto descriptivo del slide"
                  />
                </div>
              </>
            )}

            {formData.type === "full" && (
              <>
                <fieldset className="border rounded-sm p-2.5 bg-gray-50">
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
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Texto</label>
                          <input 
                            type="text" 
                            name="primaryButton.text" 
                            value={formData.primaryButton?.text || ""} 
                            onChange={handleChange} 
                            className="w-full border rounded-sm px-3 py-2"
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
                            className="w-full border rounded-sm px-3 py-2"
                            placeholder="/catalogo"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Color</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              name="primaryButton.color" 
                              value={formData.primaryButton?.color || "#798f38"} 
                              onChange={handleChange} 
                              className="w-12 h-10 border rounded-sm cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={formData.primaryButton?.color || "#798f38"} 
                              disabled 
                              className="flex-1 border rounded-sm px-2 py-1 text-sm text-gray-500 bg-gray-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Estilo</label>
                          <select 
                            name="primaryButton.style" 
                            value={formData.primaryButton?.style || "solid"} 
                            onChange={handleChange} 
                            className="w-full border rounded-sm px-3 py-2 text-sm"
                          >
                            <option value="solid">Sólido (relleno)</option>
                            <option value="outline">Contorno</option>
                            <option value="ghost">Fantasma (texto)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de texto</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="primaryButton.textColor"
                              value={formData.primaryButton?.textColor || "#ffffff"}
                              onChange={handleChange}
                              className="w-12 h-10 border rounded-sm cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.primaryButton?.textColor || "#ffffff"}
                              disabled
                              className="flex-1 border rounded-sm px-2 py-1 text-sm text-gray-500 bg-gray-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de borde</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="primaryButton.borderColor"
                              value={formData.primaryButton?.borderColor || formData.primaryButton?.color || "#798f38"}
                              onChange={handleChange}
                              className="w-12 h-10 border rounded-sm cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.primaryButton?.borderColor || formData.primaryButton?.color || "#798f38"}
                              disabled
                              className="flex-1 border rounded-sm px-2 py-1 text-sm text-gray-500 bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tamaño</label>
                          <select
                            name="primaryButton.size"
                            value={formData.primaryButton?.size || "md"}
                            onChange={handleChange}
                            className="w-full border rounded-sm px-3 py-2 text-sm"
                          >
                            <option value="sm">Pequeño</option>
                            <option value="md">Mediano</option>
                            <option value="lg">Grande</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Forma</label>
                          <select
                            name="primaryButton.radius"
                            value={formData.primaryButton?.radius || "md"}
                            onChange={handleChange}
                            className="w-full border rounded-sm px-3 py-2 text-sm"
                          >
                            <option value="sm">Esquinas suaves</option>
                            <option value="md">Redondeado medio</option>
                            <option value="lg">Redondeado alto</option>
                            <option value="full">Píldora</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border rounded-sm">
                        <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                        <button
                          type="button"
                          className={previewButtonClass(formData.primaryButton)}
                          style={{
                            backgroundColor: formData.primaryButton?.style === "solid" ? formData.primaryButton?.color : "transparent",
                            color: formData.primaryButton?.textColor || "#ffffff",
                            borderColor:
                              formData.primaryButton?.style === "outline"
                                ? formData.primaryButton?.borderColor || formData.primaryButton?.color || "#798f38"
                                : "transparent",
                          }}
                        >
                          {formData.primaryButton?.text || "Botón primario"}
                        </button>
                      </div>
                    </div>
                  )}
                </fieldset>

                <fieldset className="border rounded-sm p-2.5 bg-gray-50">
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
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Texto</label>
                          <input 
                            type="text" 
                            name="secondaryButton.text" 
                            value={formData.secondaryButton?.text || ""} 
                            onChange={handleChange} 
                            className="w-full border rounded-sm px-3 py-2"
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
                            className="w-full border rounded-sm px-3 py-2"
                            placeholder="/contacto"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Color</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              name="secondaryButton.color" 
                              value={formData.secondaryButton?.color || "#ffffff"} 
                              onChange={handleChange} 
                              className="w-12 h-10 border rounded-sm cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={formData.secondaryButton?.color || "#ffffff"} 
                              disabled 
                              className="flex-1 border rounded-sm px-2 py-1 text-sm text-gray-500 bg-gray-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Estilo</label>
                          <select 
                            name="secondaryButton.style" 
                            value={formData.secondaryButton?.style || "outline"} 
                            onChange={handleChange} 
                            className="w-full border rounded-sm px-3 py-2 text-sm"
                          >
                            <option value="solid">Sólido (relleno)</option>
                            <option value="outline">Contorno</option>
                            <option value="ghost">Fantasma (texto)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de texto</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="secondaryButton.textColor"
                              value={formData.secondaryButton?.textColor || "#ffffff"}
                              onChange={handleChange}
                              className="w-12 h-10 border rounded-sm cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.secondaryButton?.textColor || "#ffffff"}
                              disabled
                              className="flex-1 border rounded-sm px-2 py-1 text-sm text-gray-500 bg-gray-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de borde</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="secondaryButton.borderColor"
                              value={formData.secondaryButton?.borderColor || formData.secondaryButton?.color || "#ffffff"}
                              onChange={handleChange}
                              className="w-12 h-10 border rounded-sm cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.secondaryButton?.borderColor || formData.secondaryButton?.color || "#ffffff"}
                              disabled
                              className="flex-1 border rounded-sm px-2 py-1 text-sm text-gray-500 bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tamaño</label>
                          <select
                            name="secondaryButton.size"
                            value={formData.secondaryButton?.size || "md"}
                            onChange={handleChange}
                            className="w-full border rounded-sm px-3 py-2 text-sm"
                          >
                            <option value="sm">Pequeño</option>
                            <option value="md">Mediano</option>
                            <option value="lg">Grande</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Forma</label>
                          <select
                            name="secondaryButton.radius"
                            value={formData.secondaryButton?.radius || "md"}
                            onChange={handleChange}
                            className="w-full border rounded-sm px-3 py-2 text-sm"
                          >
                            <option value="sm">Esquinas suaves</option>
                            <option value="md">Redondeado medio</option>
                            <option value="lg">Redondeado alto</option>
                            <option value="full">Píldora</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border rounded-sm">
                        <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                        <button
                          type="button"
                          className={previewButtonClass(formData.secondaryButton)}
                          style={{
                            backgroundColor: formData.secondaryButton?.style === "solid" ? formData.secondaryButton?.color : "transparent",
                            color: formData.secondaryButton?.textColor || "#ffffff",
                            borderColor:
                              formData.secondaryButton?.style === "outline"
                                ? formData.secondaryButton?.borderColor || formData.secondaryButton?.color || "#ffffff"
                                : "transparent",
                          }}
                        >
                          {formData.secondaryButton?.text || "Botón secundario"}
                        </button>
                      </div>
                    </div>
                  )}
                </fieldset>
              </>
            )}

            <div className="flex items-center gap-3 p-2.5 bg-blue-50 rounded-sm">
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
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alineación Horizontal</label>
                <select 
                  name="layout.horizontalAlign" 
                  value={formData.layout?.horizontalAlign || "left"} 
                  onChange={handleChange} 
                  className="w-full border rounded-sm px-3 py-2"
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
                  className="w-full border rounded-sm px-3 py-2"
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
                className="w-full border rounded-sm px-3 py-2"
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
                className="w-full border rounded-sm px-3 py-2"
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
            <div className="border-2 border-dashed rounded-sm p-3 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Vista previa del layout:</p>
              <div className={`relative h-28 bg-gray-200 rounded-sm flex ${previewVerticalClass} ${previewHorizontalClass} p-3`}>
                <div className={`bg-blue-900 text-white p-2.5 rounded-sm text-xs ${previewTextClass} max-w-xs`}>
                  <div className="font-bold">Título del Slide</div>
                  <div className="text-xs opacity-75">Descripción del slide</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección Estilos */}
        {activeSection === "styling" && showText && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tamaño del Título</label>
              <select 
                name="styling.titleSize" 
                value={formData.styling?.titleSize || "large"} 
                onChange={handleChange} 
                className="w-full border rounded-sm px-3 py-2"
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
                    className={`p-2.5 rounded-sm border-2 transition-all ${
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
                className="w-full h-10 border rounded-sm"
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
                    className={`p-2.5 rounded-sm border-2 transition-all ${
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
                className="w-full h-10 border rounded-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Color actual: {formData.styling?.descriptionColor || "#ffffff"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Opacidad del Overlay: {formData.styling?.overlayOpacity || 40}%
              </label>
              {/* Presets rápidos */}
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => applyOpacityPreset(20)} className="px-3 py-1.5 text-xs font-medium rounded-sm bg-green-100 text-green-800 hover:bg-green-200 transition">Bajo (20%)</button>
                <button type="button" onClick={() => applyOpacityPreset(50)} className="px-3 py-1.5 text-xs font-medium rounded-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition">Medio (50%)</button>
                <button type="button" onClick={() => applyOpacityPreset(80)} className="px-3 py-1.5 text-xs font-medium rounded-sm bg-red-100 text-red-800 hover:bg-red-200 transition">Alto (80%)</button>
              </div>
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
                className="w-full border rounded-sm px-3 py-2"
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
            <div className="border-2 border-dashed rounded-sm p-3 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Vista previa de colores:</p>
              <div className="bg-gray-300 rounded-sm p-3 relative overflow-hidden">
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

        {/* Sección Configuración Avanzada */}
        {activeSection === "advanced" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                ⏱️ Velocidad de Autoplay: {formData.autoplaySpeed}s
              </label>
              <input 
                type="range" 
                name="autoplaySpeed" 
                min="2" 
                max="10" 
                step="1"
                value={formData.autoplaySpeed || 6} 
                onChange={handleChange} 
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Rápido (2s)</span>
                <span>Normal (6s)</span>
                <span>Lento (10s)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tiempo que el slide se muestra antes de pasar al siguiente en el carrusel
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">📱 Preview Responsive</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, previewBreakpoint: "mobile"}))}
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${formData.previewBreakpoint === "mobile" ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  📲 Móvil
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, previewBreakpoint: "tablet"}))}
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${formData.previewBreakpoint === "tablet" ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  📱 Tablet
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, previewBreakpoint: "desktop"}))}
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${formData.previewBreakpoint === "desktop" ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  🖥️ Desktop
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ver cómo se vería el slide en diferentes tamaños de pantalla
              </p>
            </div>

            {/* Vista previa responsive */}
            {formData.imageUrl && (
              <div className="border-2 border-dashed rounded-sm p-3 bg-gray-50">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Vista previa {formData.previewBreakpoint === "mobile" ? "Móvil (375px)" : formData.previewBreakpoint === "tablet" ? "Tablet (768px)" : "Desktop (1920px)"}
                </p>
                <div 
                  className="bg-gray-200 rounded-sm overflow-hidden"
                  style={{
                    width: formData.previewBreakpoint === "mobile" ? "375px" : formData.previewBreakpoint === "tablet" ? "768px" : "100%",
                    maxWidth: "100%",
                    margin: "0 auto"
                  }}
                >
                  <img 
                    src={formData.previewBreakpoint === "mobile" && formData.mobileImageUrl ? formData.mobileImageUrl : formData.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                </div>
              </div>
            )}

            <div className="p-2.5 bg-blue-50 rounded-sm border border-blue-200">
              <p className="text-xs text-blue-800"><strong>💡 Nota:</strong> La velocidad de autoplay se aplicará cuando el slide aparezca en el carrusel en la página principal.</p>
            </div>
          </div>
        )}

      </form>

      {/* Botones de acción (fijos fuera del área scroll) */}
      <div className="flex items-center justify-end gap-2 px-4 md:px-5 py-3 border-t bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="slide-form"
          className="px-4 py-2 bg-blue-900 text-white rounded-sm hover:bg-blue-800 transition-colors font-medium"
        >
          {initialData ? "Guardar Cambios" : "Crear Slide"}
        </button>
      </div>
    </div>
  );
}
