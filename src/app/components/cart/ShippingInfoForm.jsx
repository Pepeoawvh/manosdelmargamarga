"use client";

import { useState, useEffect } from "react";

const ShippingInfoForm = ({ shippingInfo, setShippingInfo }) => {
  // Estado local para controlar tooltips de ayuda
  const [showTooltip, setShowTooltip] = useState({});

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
  
  // Función para sincronizar el email de facturación cuando se marca "mismo email"
  useEffect(() => {
    if (shippingInfo.invoiceInfo?.useSameEmail && shippingInfo.email) {
      setShippingInfo((prev) => ({
        ...prev,
        invoiceInfo: {
          ...prev.invoiceInfo,
          invoiceEmail: prev.email,
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
  const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/<[^>]*>/g, '') // Eliminar etiquetas HTML
      .replace(/javascript:/gi, '') // Prevenir javascript: URLs
      .trim(); // Eliminar espacios en blanco al inicio/final
  };

  // Maneja cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Sanitizar input para prevenir XSS
    let sanitizedValue = type === "checkbox" ? checked : sanitizeInput(value);
    // Filtrar números para nombres y comuna
    if (
      name === "firstName" || 
      name === "lastName" || 
      name === "city" || 
      name === "invoiceInfo.representativeName"
    ) {
      sanitizedValue = typeof sanitizedValue === 'string' ? 
        sanitizedValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '') : 
        sanitizedValue;
    
    }

    if (name.includes(".")) {
      // Maneja campos anidados (para facturación)
      const [parent, child] = name.split(".");

      // Asegurarse de que el objeto parent existe
      if (!shippingInfo[parent]) {
        setShippingInfo((prev) => ({
          ...prev,
          [parent]: {},
        }));
      }

      setShippingInfo((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: sanitizedValue,
        },
      }));
    } else {
      // Maneja campos en el nivel principal
      setShippingInfo((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    }
  };

  // Formatear RUT empresarial (solo números, guión al final)
  const handleRutChange = (e) => {
    let rut = e.target.value;

    // Eliminar todos los caracteres no numéricos ni K/k (excepto el guión)
    rut = rut.replace(/[^0-9kK-]/g, "");
    
    // Eliminar cualquier guión existente para manejar todo por nuestra cuenta
    rut = rut.replace(/-/g, "");
    
    // Limitar a un máximo de 9 caracteres (8 para el cuerpo + 1 para el dígito verificador)
    if (rut.length > 9) {
      rut = rut.slice(0, 9);
    }
    
    // Formatear: añadir guión antes del último dígito solo si hay al menos 2 caracteres
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
          businessRut: rut,
          representativeName: "",
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              placeholder="912345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required={shippingInfo.needsInvoice}
                />
              </div>
              <div>
                <label
                  htmlFor="businessRut"
                  className="block font-medium text-gray-700 mb-1"
                >
                  RUT empresa*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="businessRut"
                    value={invoiceInfo.businessRut || ""}
                    onChange={handleRutChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="12345678-9"
                    required={shippingInfo.needsInvoice}
                  />
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required={shippingInfo.needsInvoice}
                />
              </div>
              
              <div className="flex text-xm flex-col">
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
                      className="h-3 w-3 text-xm text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="useSameEmail"
                      className="ml-1 text-xm text-gray-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
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