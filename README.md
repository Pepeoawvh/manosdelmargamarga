# Manos del Marga Marga

Sitio web oficial del taller de papel reciclado artesanal y ecológico.  
Venta de papel germinable, bolitas de semilla, souvenirs corporativos, cotillon ecológico y productos sustentables.

**Sitio en vivo:** [manosdelmargamarga.cl](https://www.manosdelmargamarga.cl)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19
- **Estilos:** Tailwind CSS 3.4
- **Animaciones:** Framer Motion, CSS Modules
- **Carrusel:** Swiper
- **Base de datos:** Firebase Firestore (cliente + Admin SDK)
- **Autenticación admin:** Firebase Auth
- **Pagos:** Transbank Webpay Plus (SDK v5), SDK Mercado Pago
- **Correos transaccionales:** React Email + Resend
- **Gráficos:** Recharts
- **Drag & drop:** @dnd-kit
- **Componentes UI:** @headlessui/react
- **Performance:** Vercel Speed Insights, optimización de imágenes, Critters CSS
- **PWA:** Manifest con soporte standalone, appleWebApp

---

## Funcionalidades

### Catálogo
- 9 categorías de producto: Bolitas de Semilla, Papeles, Corporativo, Celebraciones, Souvenirs, Figuras, Hazlo Tú Mismo, Tarjetas, Ofertas
- Productos destacados con layout configurable
- Ordenamiento por ranking de ventas, fecha y columnas definidas por admin
- Vista completa por categorías (botón "Ver todos" con `?vista=todo`)
- Página dinámica por producto (`/producto/[handle]`)
- Metadata SEO generada dinámicamente por categoría

### Carrito de Compras
- Contexto React con persistencia en localStorage
- Agregar/quitar/actualizar cantidad con límite de stock
- Soporte para productos reservables
- Detección de timeout de pago (30 min)

### Checkout y Pagos
- Formulario de envío con validación (nombre, email, teléfono, dirección, ciudad, región)
- Integración con Transbank Webpay Plus
- Botón de compra por WhatsApp (método alternativo)
- Flujo de reserva para productos marcados como reservables

### Páginas de Post-Pago
- **Success:** Confirmación de pedido con resumen y badge de estado
- **Failure:** Mensaje de error contextualizado con botón de reintento
- **Pending:** Página de pago pendiente

### Sistema de Órdenes
- Órdenes almacenadas en Firestore con estados: PENDIENTE, EMPACADO, ENVIADO, FINALIZADO, CANCELADO, etc.
- Numeración automática de pedidos
- Webhook de Webpay con idempotencia (SHA-256)
- Notificaciones por email al cliente y al admin

### Panel de Administración (`/adminpanel`)
Autenticación vía Firebase Auth. 7 módulos:

| Módulo | Descripción |
|---|---|
| Dashboard | KPIs, órdenes recientes, alertas de stock bajo, acciones rápidas |
| Inventario | CRUD completo de productos |
| Pedidos | Órdenes web + ventas externas con filtros y búsqueda |
| Carrusel | Gestión de slides del hero (agregar/editar/reordenar/eliminar) |
| Informes de Ventas | Reportes mensuales, top productos, comisiones, gráficos |
| Reservas | Gestión de reservas con cambio de estado y cantidad |
| Orden Catálogo | Ordenamiento drag & drop de productos |

### Sistema de Contacto
- Formulario con protección honeypot anti-spam
- Rate limiting por email+IP
- Validación de longitud y cantidad de enlaces
- Notificación por email vía Resend

### SEO y Metadatos
- Metadata completa en layout raíz (title template, description, keywords, Open Graph, Twitter Cards)
- JSON-LD con schema LocalBusiness, WebSite y FAQPage
- Sitemap dinámico con rutas estáticas + slugs de productos
- Robots.txt configurado
- URLs canónicas en todas las páginas
- Metadata dinámica por categoría en el catálogo

### Páginas de Contenido
- `/` — Hero con carrusel, productos destacados, banner de clientes, CTA
- `/catalogo` — Catálogo completo con filtros
- `/producto/[handle]` — Página de producto individual
- `/contacto` — Formulario de contacto con horarios
- `/tutoriales` — Hub con guías: cómo plantar, cómo trabajamos, protocolo gráfico
- `/como-plantar-papel-germinable-...` — Tutorial de plantado de papel germinable
- `/terminosycondiciones` — Términos legales (ley chilena)
- `/nosotras` — About us (en construcción)
- `/sostenible` — Sustentabilidad (en construcción)

---

## Rutas de la API

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/create-transaction` | POST | Iniciar transacción Webpay |
| `/api/complete-transaction` | POST | Confirmar transacción Webpay |
| `/api/webpay-return` | GET | Manejar retorno de Webpay |
| `/api/webhook` | POST | Webhook de notificaciones Webpay |
| `/api/create-reservation` | POST | Crear reserva de producto |
| `/api/contact/notify` | POST | Enviar mensaje de contacto |
| `/api/notify-order` | POST | Enviar emails de confirmación |
| `/api/payment-confirmation` | POST | Proxy para confirmar pago |
| `/api/sitemap-products` | GET | Slugs de productos para sitemap |

---

## Colecciones en Firestore

| Colección | Propósito |
|---|---|
| `productosmmm` | Catálogo de productos |
| `orders` | Órdenes Webpay |
| `reservations` | Reservas de productos |
| `external-sales` | Ventas externas/offline |
| `webhooks` | Eventos de webhook (deduplicados) |
| `contact-rate` | Rate limiting del formulario de contacto |
| `config` | Configuración de la app (orden del catálogo) |

---

## Desarrollo Local

```bash
# Servidor de desarrollo con Turbopack
npm run dev

# Build de producción
npm run build

# Servir build de producción
npm run start

# Linter
npm run lint
```

El servidor de desarrollo corre en [http://localhost:3000](http://localhost:3000).

### Requisitos

- Node.js 18+
- Variables de entorno (Firebase, Resend, Transbank)

---

## Estructura del Proyecto

```
src/
  app/
    api/              # Route handlers (10 endpoints)
    catalogo/         # Catálogo de productos
    checkout/         # Página de checkout
    components/       # Componentes React
      admin/          # Panel de administración (12 componentes)
      cart/           # Carrito de compras (11 componentes)
      contact/        # Formulario de contacto
      emails/         # Plantillas de email (3)
      layout/         # Navbar, Footer
      product/        # ProductCard, ProductDetails, ProductForm
      slides/         # Componentes del carrusel
      tutoriales/     # Tutoriales
      ui/             # Componentes reutilizables
    contacto/         # Página de contacto
    context/          # Contextos (CartContext, authProvider)
    hooks/            # Custom hooks
      admin/          # 4 hooks de admin
      shared/         # useProducts
    producto/[handle]/# Página dinámica de producto
    providers/        # Providers del lado cliente
    tutoriales/       # Páginas de tutoriales
    ui/               # Fuentes y utilidades
    utils/            # Funciones utilitarias
  lib/firebase/       # Config Firebase (cliente + admin)
```

---

## Licencia

Privado — Todos los derechos reservados.
