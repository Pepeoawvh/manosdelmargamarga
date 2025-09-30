"use client";

import { useState, useEffect } from "react";

const ShippingInfoForm = ({ shippingInfo, setShippingInfo }) => {
  // Estado local para controlar tooltips de ayuda
  const [showTooltip, setShowTooltip] = useState({});

  // --- Helpers de input ---
  const preventEmailSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  const handlePhoneKeyDown = (e) => {
    const allowedControlKeys = new Set([
      "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End",
    ]);
    const isCtrlCombo = e.ctrlKey || e.metaKey; // copiar/pegar/cortar/select all
    const isNumberKey = /^[0-9]$/.test(e.key);

    if (allowedControlKeys.has(e.key) || isCtrlCombo) return;
    if (!isNumberKey) e.preventDefault();
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digitsOnly = paste.replace(/\D/g, "").slice(0, 9);
    setShippingInfo((prev) => ({ ...prev, phone: digitsOnly }));
  };

  // Asegurémonos de que invoiceInfo siempre existe al inicializar
  useEffect(() => {
    if (!shippingInfo.invoiceInfo) {
      setShippingInfo((prev) => ({
        ...prev,
        invoiceInfo: {
          representativeName: "",
          businessRut: "",
          businessAddress: "",
          invoiceEmail: "",
          useSameEmail: false,
          additionalNotes: "",
        },
      }));
    }
  }, [shippingInfo, setShippingInfo]);

  // Sincronizar el email de facturación cuando se marca "mismo email"
  useEffect(() => {
    if (shippingInfo.invoiceInfo?.useSameEmail && shippingInfo.email) {
      setShippingInfo((prev) => ({
        ...prev,
        invoiceInfo: {
          ...prev.invoiceInfo,
          invoiceEmail: (prev.email || "").replace(/\s+/g, "").toLowerCase(),
        },
      }));
    }
  }, [shippingInfo.email, shippingInfo.invoiceInfo?.useSameEmail, setShippingInfo]);

  // Regiones de Chile para el selector
  const regiones = [
    "Selecciona tu región",
    "Región de Arica y Parinacota",
    "Región de Tarapacá",
    "Región de Antofagasta",
    "Región de Atacama",
    "Región de Coquimbo",
    "Región de Valparaíso",
    "Región Metropolitana",
    "Región del Libertador General Bernardo O'Higgins",
    "Región del Maule",
    "Región de Ñuble",
    "Región del Biobío",
    "Región de La Araucanía",
    "Región de Los Ríos",
    "Región de Los Lagos",
    "Región de Aysén",
    "Región de Magallanes",
  ];

  // Sanitizar input para prevenir XSS
  const sanitizeInput = (value, { trimEdges = true } = {}) => {
    if (typeof value !== "string") return value;
    let v = value
      .replace(/<[^>]*>/g, "")     // quita etiquetas HTML
      .replace(/javascript:/gi, ""); // quita javascript: URLs
    if (trimEdges) v = v.trim();     // recorta bordes solo si corresponde
    return v;
  };

  // Maneja cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Campos donde SÍ necesitamos permitir espacios cómodamente:
    const looseFields = new Set([
      "address",
      "notes",
      "invoiceInfo.businessAddress",
      "invoiceInfo.additionalNotes",
    ]);

    const shouldTrim = !looseFields.has(name);
    let sanitizedValue = type === "checkbox"
      ? checked
      : sanitizeInput(value, { trimEdges: shouldTrim });

    // Sólo letras para nombres/comuna
    if (
      name === "firstName" ||
      name === "lastName" ||
      name === "city" ||
      name === "invoiceInfo.representativeName"
    ) {
      sanitizedValue = typeof sanitizedValue === "string"
        ? sanitizedValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "")
        : sanitizedValue;
    }

    // Evitar espacios en emails (principal y facturación) y normalizar en minúsculas
    if (name === "email" || name === "invoiceInfo.invoiceEmail") {
      sanitizedValue = String(sanitizedValue).replace(/\s+/g, "").toLowerCase();
    }

    // Solo números en teléfono
    if (name === "phone") {
      sanitizedValue = String(sanitizedValue).replace(/\D/g, "").slice(0, 9);
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (!shippingInfo[parent]) {
        setShippingInfo((prev) => ({ ...prev, [parent]: {} }));
      }
      setShippingInfo((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: sanitizedValue },
      }));
    } else {
      setShippingInfo((prev) => ({ ...prev, [name]: sanitizedValue }));
    }
  };

  // Formatear RUT empresarial (solo números, guión al final)
  const handleRutChange = (e) => {
    let rut = e.target.value;

    // Eliminar todos los caracteres no numéricos ni K/k (excepto el guión)
    rut = rut.replace(/[^0-9kK-]/g, "");
    // Eliminar guiones existentes
    rut = rut.replace(/-/g, "");
    // Limitar a un máximo de 9 caracteres (8 cuerpo + 1 DV)
    if (rut.length > 9) rut = rut.slice(0, 9);
    // Añadir guión antes del último dígito si hay al menos 2 caracteres
    if (rut.length >= 2) {
      const cuerpo = rut.slice(0, -1);
      const dv = rut.slice(-1).toUpperCase();
      rut = `${cuerpo}-${dv}`;
    }

    // Asegurarse de que invoiceInfo existe antes de actualizar
    if (!shippingInfo.invoiceInfo) {
      setShippingInfo((prev) => ({
        ...prev,
        invoiceInfo: {
          representativeName: "",
          businessRut: rut,
          businessAddress: "",
          invoiceEmail: "",
          useSameEmail: false,
          additionalNotes: "",
        },
      }));
    } else {
      setShippingInfo((prev) => ({
        ...prev,
        invoiceInfo: {
          ...prev.invoiceInfo,
          businessRut: rut,
        },
      }));
    }
  };

  // Verificar siempre que invoiceInfo exista antes de acceder a sus propiedades
  const invoiceInfo = shippingInfo.invoiceInfo || {};

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-gray-800">
        Información de Envío
      </h2>

      <div className="grid text-xs grid-cols-2 md:grid-cols-2 gap-4">
        <div className="grid text-xs grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Nombre*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={shippingInfo.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block font-medium text-gray-700 mb-1"
            >
              Apellido*
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={shippingInfo.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="gap-4">
            <label
              htmlFor="email"
              className="block font-medium text-gray-700 mb-1"
            >
              Correo electrónico*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={shippingInfo.email}
              onChange={handleChange}
              onKeyDown={preventEmailSpace}
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block font-medium text-gray-700 mb-1"
            >
              Teléfono* (sin +56)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleChange}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="912345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
              maxLength={9}
              required
            />
          </div>
        </div>
      </div>

      <div className="grid text-xs grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Comuna*
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={shippingInfo.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="region"
              className="block font-medium text-gray-700 mb-1"
            >
              Región*
            </label>
            <select
              id="region"
              name="region"
              value={shippingInfo.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
              required
            >
              {regiones.map((region, index) => (
                <option key={index} value={region} disabled={index === 0}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="address"
            className="block font-medium text-gray-700 mb-1"
          >
            Dirección*
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={shippingInfo.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
            required
          />
        </div>
      </div>

      <div className="grid text-xs grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="notes"
            className="block font-medium text-gray-700 mb-1"
          >
            Notas adicionales (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={shippingInfo.notes || ""}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
            placeholder="Instrucciones especiales para la entrega, referencias, etc."
          ></textarea>
        </div>

        <div className="flex items-center space-x-3">
          <label className="block font-medium text-gray-700">
            Tipo de envío:
          </label>
          <span className="inline-flex items-center py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            {shippingInfo.shippingType}
          </span>
        </div>
        <div className="flex text-xs items-center space-x-2">
          <input
            type="checkbox"
            id="needsInvoice"
            name="needsInvoice"
            checked={shippingInfo.needsInvoice || false}
            onChange={handleChange}
            className="h-4 w-4 text-[#533021] focus:ring-[#6b554b] border-gray-300 rounded"
          />
          <label
            htmlFor="needsInvoice"
            className="text-xs font-medium text-gray-800"
          >
            Necesito factura para esta compra
          </label>
        </div>
      </div>

      <div className="mt-6 text-xs border-t border-gray-200">
        {shippingInfo.needsInvoice && (
          <div className="mt-4 p-4 bg-gray-200 rounded-lg border border-gray-200 space-y-4 text-xs">
            <h3 className="font-medium text-sm text-gray-700 mb-3">
              Datos para facturación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="representativeName"
                  className="block font-medium text-gray-700 mb-1"
                >
                  Nombre de encargado de compra*
                </label>
                <input
                  type="text"
                  id="representativeName"
                  name="invoiceInfo.representativeName"
                  value={invoiceInfo.representativeName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
                  required={shippingInfo.needsInvoice}
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="businessRut"
                  className="block font-medium text-gray-700 mb-1"
                >
                  RUT empresa*
                </label>
                <input
                  type="text"
                  id="businessRut"
                  value={invoiceInfo.businessRut || ""}
                  onChange={handleRutChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
                  placeholder="12345678-9"
                  required={shippingInfo.needsInvoice}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    setShowTooltip({ ...showTooltip, rut: !showTooltip.rut })
                  }
                >
                  <span className="w-4 h-4 flex items-center justify-center border border-gray-400 rounded-full text-xs">
                    i
                  </span>
                </button>
                {showTooltip.rut && (
                  <div className="absolute z-10 right-0 mt-2 w-64 p-2 bg-white text-xs shadow-lg rounded border border-gray-200">
                    Ingrese el RUT sin puntos y con guión. Ejemplo: 12345678-9
                    <div className="absolute -top-2 right-2 w-3 h-3 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="businessAddress"
                  className="block font-medium text-gray-700 mb-1"
                >
                  Dirección empresa*
                </label>
                <input
                  type="text"
                  id="businessAddress"
                  name="invoiceInfo.businessAddress"
                  value={invoiceInfo.businessAddress || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
                  required={shippingInfo.needsInvoice}
                />
              </div>

              <div className="flex text-xs flex-col">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="invoiceEmail"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Email facturación*
                  </label>
                  <div className="flex text-xs items-center mt-1">
                    <input
                      type="checkbox"
                      id="useSameEmail"
                      name="invoiceInfo.useSameEmail"
                      checked={invoiceInfo.useSameEmail || false}
                      onChange={handleChange}
                      className="h-3 w-3 text-emerald-600 focus:ring-[#6b554b] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="useSameEmail"
                      className="ml-1 text-xs text-gray-600"
                    >
                      Mismo email
                    </label>
                  </div>
                </div>

                <input
                  type="email"
                  id="invoiceEmail"
                  name="invoiceInfo.invoiceEmail"
                  value={invoiceInfo.invoiceEmail || ""}
                  onChange={handleChange}
                  onKeyDown={preventEmailSpace}
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
                  required={shippingInfo.needsInvoice && !invoiceInfo.useSameEmail}
                  disabled={invoiceInfo.useSameEmail}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="additionalNotes"
                className="block font-medium text-gray-700 mb-1"
              >
                Observaciones facturación (opcional)
              </label>
              <textarea
                id="additionalNotes"
                name="invoiceInfo.additionalNotes"
                value={invoiceInfo.additionalNotes || ""}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6b554b]"
                placeholder="Cualquier detalle adicional para la factura"
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingInfoForm;
