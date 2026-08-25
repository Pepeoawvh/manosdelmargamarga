# Changelog

Registro de cambios del proyecto **Manos del Marga Marga**.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

---

## [0.4.0] - 2026-07-13

Estado inicial documentado del proyecto.

### Added

- **App:** Next.js 16 con App Router y Turbopack
- **UI:** React 19, Tailwind CSS 3.4, Framer Motion
- **Carrusel:** Swiper con gestión admin
- **Base de datos:** Firebase Firestore (cliente + Admin SDK)
- **Pagos:** Transbank Webpay Plus (SDK v5) y Mercado Pago
- **Email:** React Email + Resend (confirmación de pedido, aviso admin, contacto)
- **Gráficos:** Recharts para informes de ventas
- **Drag & drop:** @dnd-kit para ordenamiento de catálogo
- **Componentes UI:** @headlessui/react
- **Performance:** Vercel Speed Insights, optimización de imágenes, Critters CSS
- **PWA:** Manifest con soporte standalone

### Funcionalidades

- Catálogo con 9 categorías de productos
- Carrito de compras con persistencia en localStorage
- Checkout con formulario de envío validado
- Pago vía Transbank Webpay Plus y compra por WhatsApp
- Reserva de productos
- Páginas de post-pago (success, failure, pending)
- Sistema de órdenes con estados (PENDIENTE, EMPACADO, ENVIADO, FINALIZADO, CANCELADO)
- Webhook de Webpay con idempotencia (SHA-256)
- Panel de administración con 7 módulos (Dashboard, Inventario, Pedidos, Carrusel, Informes, Reservas, Orden Catálogo)
- Formulario de contacto con protección honeypot y rate limiting
- SEO completo (metadata, JSON-LD, sitemap dinámico, robots.txt, Open Graph, Twitter Cards)
- 10 endpoints de API
- 7 colecciones en Firestore
- Tutoriales (cómo plantar, cómo trabajamos, protocolo gráfico)

---

## [0.4.1] - 2026-07-13

### Fixed

- **package.json:** Scripts `dev`, `build`, `start`, `lint` ejecutaban `sh node_modules/.bin/next` que trataba el binario de Node.js como script shell, causando error `use strict: command not found` en Vercel. Corregido a usar `next` directamente (npm resuelve el binario correctamente desde `node_modules/.bin/`).

  **Causa:** El prefijo `sh` forzaba interpretar el binario de Next.js (que tiene shebang `#!/usr/bin/env node`) como script shell. Vercel ejecuta `npm run build`, que levanta la línea de comandos del shell definido en el contenedor, y al encontrar `'use strict'` en la línea 2 del binario falla con `command not found`.

  **Solución:** Quitar `sh node_modules/.bin/` de los 4 scripts. Cuando se escribe solo `next`, npm busca automáticamente en `node_modules/.bin/next` y lo ejecuta usando el shebang del archivo.

- **README.md:** Resuelto conflicto de merge que dejaba marcadores `<<<<<<< HEAD` / `=======` / `>>>>>>> desarrollo`. Se consolidó la documentación completa del proyecto.

### Commit

```
02860f4 fix: corregir scripts de build para compatibilidad con Vercel y resolver conflicto merge en README
```

---

## [0.4.2] - 2026-07-13

### Fixed

- **Google Search Console — "price" y "priceCurrency" faltantes (4 productos):**
  En `ProductCard.jsx`, los microdatos `itemProp="price"` y `itemProp="priceCurrency"` solo se renderizaban cuando `hidePrice=false` y `priceInt>0`. Para productos cotizables o sin precio, el nodo `Offer` existía pero estaba incompleto. Corregido moviendo los `<meta>` de price y priceCurrency al inicio del nodo `Offer` para que **siempre** estén presentes, independientemente de la condición visual. También se agregó `itemProp="url"` al Offer.

- **Google Search Console — "aggregateRating" faltante (23 productos):**
  En `ProductDetails.jsx` (JSON-LD) y `ProductCard.jsx` (microdata), se agregó soporte para `aggregateRating` usando un campo `rating` en Firestore (`{avg, count}`). Solo se emite cuando `count > 0`, evitando ratings vacíos. En `ProductCard.jsx` se muestra visualmente la estrella y el rating cuando existe.

### Changed

- **ProductDetails.jsx — JSON-LD Product mejorado:** Se agregó `aggregateRating` condicional al schema de Producto, y `seller` (Organization) dentro de `offers` para mayor completitud del structured data.

- **producto/[handle]/page.jsx — Open Graph limpiado:** Se eliminaron las meta tags `product:price:amount`, `product:price:currency`, `product:availability` y `product:category` del campo `other` (no son válidas para metadata de Next.js y Google no las procesa). La información de precio ya está correctamente representada en el JSON-LD del componente `ProductDetails`.

---

## [0.4.3] - 2026-07-22

### Added

- **Página `/nosotras`:** Nueva página corporativa "Sobre Nosotras" con 6 secciones:
  1. **Hero:** Imagen de fondo fullscreen con overlay verde (`#5e8c30/40`), título y frase "aquí florece la economía circular". Animación fade-up con Framer Motion.
  2. **Historia:** Grid 2 columnas (texto + imagen). Resumen de Manos del Marga Marga desde 2008: papel semilla reciclado, energía solar, agua de pozo, cero químicos.
  3. **Pilares de Identidad:** 4 tarjetas con iconos (`react-icons/fa`) — Regeneración Ambiental, Desarrollo Femenino, Producción Solar y Limpia, Cultura del Cuidado.
  4. **Imagen Full-Width:** Espacio panorámico para foto del taller (placeholder con ruta `/images/nosotras/taller-fullwidth.jpg`).
  5. **Certificaciones:** 7 tarjetas — Mercado Público, Sello Mujeres Proveedoras, Sello Marca Chile, Sello R – SERNATUR, Certificación 40 Horas, Finalistas "Nada Nos Detiene" (G100), Asesoría Centro de Negocios (Sercotec).
  6. **CTA Final:** Gradiente verde con botón WhatsApp (`56322121504`).

- **`nosotras/layout.js`:** Metadata SEO completa — título, descripción (160 chars), Open Graph, Twitter Card.

### Componentes reutilizados

- Paleta de colores: `#5e8c30`, `#798f38`, `#ebead5`, `#cde582`, `#eef6d6`
- Animación `fadeUp` (Framer Motion) — misma que el resto del sitio
- `react-icons/fa` — iconos ya disponibles en el proyecto

### Pendiente (próximos pasos)

- Agregar imágenes reales en `/public/images/nosotras/`:
  - `hero-nosotras.jpg` — Foto del taller o paisaje del Marga Marga
  - `taller-historia.jpg` — Artesana trabajando papel
  - `taller-fullwidth.jpg` — Vista panorámica del taller
- Commit y push a rama `desarrollo`
- Continuar Fase 2 SEO: verificación en Search Console, GA4, imagen OG dedicada
- Refactor SSR homepage (actualmente "use client" — malo para SEO)
- Agregar campo `rating: { avg, count }` a documentos Firestore para aggregateRating
- Auditar alt texts en todas las imágenes
- Expandir sitemap con rutas faltantes

---

## [0.4.4] - 2026-07-23

### Changed

- **Términos y Condiciones — Cambio Voluntario:** Plazo reducido de 30 a 10 días. Agregada aclaración "No implica devolución monetaria" en tabla resumen y sección de detalle.

- **Términos y Condiciones — Derecho a Retracto eliminado:** Se eliminó la fila de la tabla resumen, la sección completa "2. Derecho a Retracto (10 Días)" y la mención en el procedimiento de apertura de caso. Las secciones restantes fueron renumeradas (2→2, 3→2, 4→3).

- **Checkout — Nota de retracto pre-pago:** Se agregó nota legal antes del botón "Pagar con Webpay": "Al realizar esta compra, aceptas nuestros Términos y Condiciones. Conforme al Art. 3° bis de la Ley N° 19.496, manifestamos expresamente que no nos adherimos al Derecho a Retracto en compras a distancia. Tampoco aplica el retracto para productos elaborados a pedido o personalizados."

### Archivos modificados

- `src/app/terminosycondiciones/page.jsx`
- `src/app/components/cart/CheckOut.jsx`
