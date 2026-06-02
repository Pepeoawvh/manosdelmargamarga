# 📊 Guía Completa de Optimización SEO - Manos del Marga Marga

## ✅ Optimizaciones Implementadas

### 1. Metadata Global (layout.js)
**Estado:** ✅ Completo

**Características implementadas:**
- ✅ Metadata base con URL canónica
- ✅ Title template para páginas dinámicas
- ✅ Description optimizada con keywords
- ✅ Keywords array con términos relevantes
- ✅ Open Graph completo (title, description, images, locale)
- ✅ Twitter Cards configuradas
- ✅ Robots meta optimizado para Google
- ✅ Manifest.json para PWA
- ✅ Apple Web App meta tags
- ✅ Locale específico (es_CL)

**Keywords principales incluidas:**
- papel artesanal
- papel reciclado
- papel semilla / papel germinable
- papel hecho a mano
- invitaciones papel artesanal
- packaging sostenible
- taller papel Chile
- papel biodegradable
- diseño sustentable

### 2. Páginas de Producto (producto/[handle]/page.jsx)
**Estado:** ✅ Completo

**Características implementadas:**
- ✅ `generateMetadata()` async para metadata dinámica
- ✅ Fetch de datos desde Firestore (server-side)
- ✅ Soporte para ID de Firestore y slugs personalizados
- ✅ Open Graph tipo "product"
- ✅ Metadata específica de producto (precio, stock, categoría)
- ✅ Twitter Cards con imagen del producto
- ✅ Canonical URL dinámica

**Ejemplo de estructura:**
```javascript
export async function generateMetadata({ params }) {
  const product = await fetchProductFromFirestore(handle);
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      type: "product",
      product: {
        price: product.price,
        currency: "CLP",
        availability: product.stock > 0 ? "in stock" : "out of stock",
      }
    }
  };
}
```

### 3. Páginas Estáticas con Metadata
**Estado:** ✅ Completo

**Páginas optimizadas:**
- ✅ `/nosotras` - Metadata con historia y valores
- ✅ `/contacto` - Metadata optimizada para consultas
- ✅ `/como-plantar-papel-germinable-manos-del-marga-marga` - Article metadata con keywords

**Características:**
- Keywords específicas por página
- Open Graph tipo "article" para contenido editorial
- Descriptions optimizadas (150-160 caracteres)

### 4. PWA (Progressive Web App)
**Estado:** ✅ Completo

**Archivo:** `/public/manifest.json`

**Características:**
- ✅ Iconos desde 72x72 hasta 512x512px
- ✅ Theme color (#798f38 - verde corporativo)
- ✅ Background color (#ffffff)
- ✅ Display: "standalone"
- ✅ Categories: ["shopping", "lifestyle"]
- ✅ Start URL optimizada
- ✅ Installable en dispositivos móviles

### 5. Sitemap y Robots
**Estado:** ✅ Completo

**Sitemap (sitemap.js):**
- ✅ Revalidación cada 3600 segundos (1 hora)
- ✅ URLs estáticas incluidas
- ✅ Fetch dinámico de productos desde Firestore
- ✅ Formato XML válido

**Robots.txt (robots.js):**
- ✅ Allow all user agents
- ✅ Sitemap URL incluida
- ✅ Host definido

### 6. Catálogo con Metadata Dinámica
**Estado:** ✅ Completo

**Características:**
- ✅ `generateMetadata()` con filtros de categoría
- ✅ Description dinámica según filtro
- ✅ Open Graph optimizado

---

## 🚧 Optimizaciones Pendientes

### 1. Página Principal (page.js)
**Prioridad:** 🔴 ALTA

**Problema actual:**
```javascript
"use client"; // ❌ Client component - malo para SEO
```

**Solución recomendada:**
Separar en:
- `page.js` (Server Component) con metadata y estructura
- `HomeClient.jsx` (Client Component) con lógica de estado

**Implementación sugerida:**
```javascript
// app/page.js (Server Component)
import HomeClient from './components/HomeClient';

export const metadata = {
  title: "Inicio",
  // ... metadata específica de home
};

export default function Home() {
  return <HomeClient />;
}
```

### 2. Imágenes Open Graph
**Prioridad:** 🔴 ALTA

**Acción requerida:**
- Crear `/public/og.jpg` (1200x630px) con diseño profesional
- Incluir logo y mensaje "Papel artesanal sostenible"
- Optimizar peso (<200KB)

**Páginas que necesitan OG image:**
- ✅ Layout global: usa `/og.jpg`
- ⚠️ **Verificar que el archivo exista**

### 3. Structured Data (JSON-LD)
**Prioridad:** 🟡 MEDIA

**Schemas a implementar:**

#### LocalBusiness (layout.js)
```javascript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Manos del Marga Marga",
  "description": "Taller de papel artesanal, reciclado y papel semilla",
  "url": "https://www.manosdelmargamarga.cl",
  "logo": "https://www.manosdelmargamarga.cl/logo.png",
  "image": "https://www.manosdelmargamarga.cl/og.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CL",
    "addressRegion": "Valparaíso"
  },
  "priceRange": "$$",
  "sameAs": [
    "https://instagram.com/manosdelmargamarga",
    "https://facebook.com/manosdelmargamarga"
  ]
};
```

#### Product Schema (ProductDetails.jsx)
```javascript
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.images,
  "sku": product.id,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "CLP",
    "availability": product.stock > 0 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    "url": `https://www.manosdelmargamarga.cl/producto/${product.handle}`
  }
};
```

### 4. Alt Text en Imágenes
**Prioridad:** 🟡 MEDIA

**Auditoría requerida:**
- [ ] Revisar todas las imágenes en ProductCard
- [ ] Verificar ProductDetails
- [ ] Comprobar HeroCarousel
- [ ] Actualizar imágenes en `/public/images/`

**Mejores prácticas:**
```jsx
// ❌ Mal
<Image src="/image.jpg" alt="imagen" />

// ✅ Bien
<Image 
  src="/imagen-tarjeta-casamiento.jpg" 
  alt="Tarjeta de casamiento en papel artesanal con flores germinables"
/>
```

### 5. Rendimiento de Imágenes
**Prioridad:** 🟡 MEDIA

**Verificación requerida:**
- ✅ next.config.mjs tiene `formats: ['image/avif', 'image/webp']`
- [ ] Comprobar tamaños de imágenes originales
- [ ] Implementar `sizes` en componentes Image
- [ ] Usar `priority` para imágenes above-the-fold

**Ejemplo optimizado:**
```jsx
<Image
  src={product.image}
  alt={product.name}
  width={600}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={index < 3} // Solo primeras 3 imágenes
/>
```

### 6. Velocidad y Core Web Vitals
**Prioridad:** 🟡 MEDIA

**Herramientas para medir:**
```bash
# Lighthouse en CLI
npx lighthouse https://www.manosdelmargamarga.cl --view

# PageSpeed Insights
# Visitar: https://pagespeed.web.dev/
```

**Métricas objetivo:**
- LCP (Largest Contentful Paint): < 2.5s ✅
- FID (First Input Delay): < 100ms ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅

### 7. Accesibilidad (a11y)
**Prioridad:** 🟢 BAJA (pero importante)

**Mejoras sugeridas:**
- [ ] Auditar contraste de colores (WCAG AA)
- [ ] Verificar navegación por teclado
- [ ] Comprobar roles ARIA
- [ ] Testing con lectores de pantalla

---

## 🔧 Configuración Externa

### Google Search Console
**Prioridad:** 🔴 ALTA - ACCIÓN REQUERIDA

**Pasos para configuración:**

1. **Registrar el sitio:**
   - Ir a: https://search.google.com/search-console
   - Agregar propiedad: `https://www.manosdelmargamarga.cl`

2. **Verificar propiedad (3 métodos):**

   **Método 1: HTML Tag (MÁS FÁCIL)**
   ```javascript
   // En layout.js, agregar:
   export const metadata = {
     // ...
     verification: {
       google: "TU_CODIGO_AQUI", // Google te lo proporciona
     },
   };
   ```

   **Método 2: Archivo HTML**
   ```bash
   # Descargar archivo de verificación de Google
   # Colocar en /public/google[codigo].html
   ```

   **Método 3: DNS (si controlas el dominio)**
   ```
   TXT record: google-site-verification=codigo
   ```

3. **Enviar sitemap:**
   ```
   URL del sitemap: https://www.manosdelmargamarga.cl/sitemap.xml
   ```

4. **Monitorear:**
   - Rendimiento de búsqueda
   - Cobertura de índice
   - Errores de rastreo
   - Datos estructurados

### Google Analytics 4
**Prioridad:** 🔴 ALTA

**Implementación con Next.js:**

1. **Crear propiedad GA4:**
   - Panel: https://analytics.google.com/
   - Crear cuenta y propiedad
   - Obtener ID de medición (G-XXXXXXXXXX)

2. **Instalar en Next.js:**
   ```bash
   npm install @next/third-parties
   ```

3. **Agregar a layout.js:**
   ```javascript
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <GoogleAnalytics gaId="G-XXXXXXXXXX" />
         </body>
       </html>
     );
   }
   ```

### Bing Webmaster Tools
**Prioridad:** 🟡 MEDIA

**Pasos:**
1. Registrar en: https://www.bing.com/webmasters
2. Importar datos desde Google Search Console (recomendado)
3. Enviar sitemap

### Facebook Domain Verification
**Prioridad:** 🟢 BAJA

**Para ads y Open Graph:**
```javascript
// layout.js
verification: {
  facebook: "TU_CODIGO_FACEBOOK",
}
```

---

## 📈 Checklist de Lanzamiento SEO

### Pre-Lanzamiento
- [x] Metadata global configurada
- [x] Sitemap generado dinámicamente
- [x] Robots.txt configurado
- [x] Páginas de producto con metadata dinámica
- [x] PWA manifest creado
- [ ] **Imagen OG creada (/public/og.jpg)**
- [ ] **Homepage convertida a Server Component**
- [ ] Alt text en todas las imágenes auditado

### Post-Lanzamiento (Primeras 24h)
- [ ] Google Search Console configurado
- [ ] Sitemap enviado a Google
- [ ] Google Analytics 4 instalado
- [ ] Verificar indexación: `site:manosdelmargamarga.cl` en Google
- [ ] Lighthouse audit ejecutado

### Primera Semana
- [ ] Bing Webmaster Tools configurado
- [ ] Structured Data implementado (LocalBusiness, Product)
- [ ] Verificar Core Web Vitals
- [ ] Mobile-friendly test: https://search.google.com/test/mobile-friendly

### Mantenimiento Continuo
- [ ] Revisar Search Console semanalmente
- [ ] Monitorear posiciones de keywords principales
- [ ] Actualizar contenido con keywords de long-tail
- [ ] Crear blog posts sobre papel artesanal (opcional pero recomendado)

---

## 🎯 Keywords Target (Para contenido futuro)

### Primary Keywords (Alta prioridad)
1. **papel artesanal** - Alta competencia
2. **papel reciclado Chile** - Media competencia
3. **papel semilla** - Baja competencia ✅ OPORTUNIDAD
4. **papel germinable** - Baja competencia ✅ OPORTUNIDAD

### Long-tail Keywords (Baja competencia, alta conversión)
- "invitaciones papel artesanal Chile"
- "tarjetas papel semilla bodas"
- "packaging sostenible papel reciclado"
- "papel hecho a mano Valparaíso"
- "como plantar papel germinable" ✅ Ya tienes contenido
- "comprar papel reciclado artesanal"
- "taller papel reciclado Chile"

### Local Keywords
- "papel artesanal Marga Marga"
- "taller papel Valparaíso"
- "papel reciclado Viña del Mar"

---

## 🛠️ Herramientas Recomendadas

### Análisis SEO
- **Google Search Console** (gratis) - ESENCIAL
- **Google Analytics 4** (gratis) - ESENCIAL
- **Ubersuggest** (freemium) - Investigación keywords
- **AnswerThePublic** (gratis) - Ideas de contenido

### Testing
- **Lighthouse** (gratis, integrado en Chrome DevTools)
- **PageSpeed Insights** - https://pagespeed.web.dev/
- **Mobile-Friendly Test** - https://search.google.com/test/mobile-friendly
- **Rich Results Test** - https://search.google.com/test/rich-results

### Monitoreo
- **Google Search Console** - Tráfico orgánico
- **Vercel Analytics** (ya instalado) - Performance
- **GTmetrix** (freemium) - Speed monitoring

---

## 📚 Recursos Adicionales

### Documentación oficial
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search/docs)
- [Schema.org - Product](https://schema.org/Product)

### Guías internas creadas
- `CAROUSEL_FEATURES.md` - Sistema de carrusel
- `TROUBLESHOOTING_CAROUSEL.md` - Resolución de problemas

---

## 🎉 Resultado Esperado

Con todas estas optimizaciones implementadas:
- ✅ **Indexación rápida** en Google (1-2 semanas)
- ✅ **Rich snippets** en resultados de búsqueda
- ✅ **Mejora en rankings** para keywords target (3-6 meses)
- ✅ **Tráfico orgánico** aumentará progresivamente
- ✅ **Experiencia móvil** óptima
- ✅ **Tasa de conversión** mejorada por mejor UX

**Última actualización:** Diciembre 2024
**Próxima revisión:** Enero 2025 (post-lanzamiento)
