# ✅ CHECKLIST SEO - Próximos Pasos Críticos

## 🔴 URGENTE - Antes de Lanzar

### 1. Crear Imagen Open Graph
**Archivo:** `/public/og.jpg`  
**Especificaciones:**
- Tamaño: 1200 x 630 píxeles
- Formato: JPG (peso < 200KB)
- Contenido sugerido:
  - Logo de Manos del Marga Marga
  - Texto: "Papel Artesanal Sostenible"
  - Fondo con texturas de papel o colores corporativos (#798f38)
  
**Herramientas recomendadas:**
- Canva (gratis): https://www.canva.com/create/og-images/
- Figma (gratis)
- Photoshop / GIMP

**Uso actual:**
```
⚠️ Actualmente usando: /images/logos/mmm.png
✅ Deberías tener: /public/og.jpg (optimizado para redes sociales)
```

---

### 2. Verificar Google Search Console
**URL:** https://search.google.com/search-console

**Pasos:**
1. Registrarse con cuenta de Google
2. Agregar propiedad: `https://www.manosdelmargamarga.cl`
3. Verificar con método HTML Tag (más fácil):
   ```javascript
   // Ya está listo en layout.js, solo descomenta:
   verification: {
     google: "TU_CODIGO_AQUI", // Pega el código que te da Google
   }
   ```
4. Enviar sitemap: `https://www.manosdelmargamarga.cl/sitemap.xml`

**Estado:**
```
⚠️ PENDIENTE - Requiere acción manual
✅ Código preparado en el sitio (solo falta tu código)
```

---

### 3. Instalar Google Analytics 4
**URL:** https://analytics.google.com/

**Pasos:**
1. Crear cuenta GA4 (si no tienes)
2. Obtener ID de medición (formato: `G-XXXXXXXXXX`)
3. Instalar dependencia:
   ```bash
   npm install @next/third-parties
   ```
4. Agregar en layout.js:
   ```javascript
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   // Dentro del <body>:
   <GoogleAnalytics gaId="G-XXXXXXXXXX" />
   ```

**Estado:**
```
❌ NO INSTALADO
⚠️ Necesitas instalar paquete y obtener ID
```

---

## 🟡 IMPORTANTE - Primera Semana

### 4. Crear Favicon Completo
**Archivos necesarios:**
- `/public/favicon.ico` (32x32)
- `/public/favicon-16x16.png`
- `/public/favicon-32x32.png`
- `/public/apple-touch-icon.png` (180x180)

**Generador recomendado:**
- https://realfavicongenerator.net/

**Estado actual:**
```
⚠️ Revisar si existen favicons actuales
```

---

### 5. Optimizar Página Principal (Homepage)
**Archivo:** `src/app/page.js`

**Problema actual:**
```javascript
"use client"; // ❌ Malo para SEO (no hay SSR)
```

**Solución:**
1. Crear `src/app/components/HomeClient.jsx` (client component)
2. Convertir `page.js` en server component
3. Estructura recomendada:
   ```javascript
   // page.js (Server Component)
   import HomeClient from './components/HomeClient';
   
   export const metadata = {
     title: "Inicio",
     description: "...",
   };
   
   export default function Home() {
     return <HomeClient />;
   }
   ```

**Estado:**
```
❌ PENDIENTE - Requiere refactorización
📝 Impacto: Mejora SEO de homepage significativamente
```

---

### 6. Auditar Textos Alt en Imágenes
**Archivos a revisar:**
- `src/app/components/product/ProductCard.jsx`
- `src/app/components/product/ProductDetails.jsx` ✅ Ya tiene alt dinámico
- `src/app/components/HeroCarousel.jsx`

**Regla:**
```jsx
// ❌ Mal
<Image alt="imagen" />
<Image alt={product.title} /> // Muy genérico

// ✅ Bien
<Image alt="Tarjeta de boda en papel semilla con flores silvestres" />
<Image alt={`${product.title} - papel artesanal hecho a mano`} />
```

**Estado:**
```
⚠️ REVISAR - Necesita auditoría manual
```

---

## 🟢 OPCIONAL - Mejoras Adicionales

### 7. Crear Contenido de Blog (Recomendado)
**Estructura sugerida:**
```
/tutoriales/
  ├── como-plantar-papel-germinable ✅ Ya existe
  ├── ideas-invitaciones-papel-artesanal (nuevo)
  ├── diferencia-papel-reciclado-artesanal (nuevo)
  └── packaging-sostenible-marcas (nuevo)
```

**Beneficio:** Aumenta tráfico orgánico con keywords de long-tail

---

### 8. Agregar Reseñas de Clientes
**Implementación:**
```javascript
// En ProductDetails.jsx o componente nuevo
const reviewSchema = {
  "@type": "Review",
  "author": { "@type": "Person", "name": "Cliente" },
  "reviewRating": { "@type": "Rating", "ratingValue": "5" },
  "reviewBody": "Excelente calidad..."
};
```

**Beneficio:** Rich snippets con estrellas en Google

---

## 📊 Verificación Post-Lanzamiento

### Chequeos en 24-48 horas:

1. **Indexación de Google:**
   ```
   Buscar en Google: site:manosdelmargamarga.cl
   ```
   Deberías ver páginas indexadas

2. **Test de Rich Snippets:**
   https://search.google.com/test/rich-results
   - Pegar URL de producto
   - Verificar que detecta schema Product

3. **Lighthouse Audit:**
   ```bash
   npx lighthouse https://www.manosdelmargamarga.cl --view
   ```
   Meta: SEO score > 90

4. **Mobile-Friendly:**
   https://search.google.com/test/mobile-friendly

5. **PageSpeed Insights:**
   https://pagespeed.web.dev/
   Meta: Performance > 80

---

## 📝 Resumen de Estado

| Tarea | Estado | Prioridad | Requiere Acción |
|-------|--------|-----------|-----------------|
| Metadata global | ✅ Completo | 🔴 Alta | No |
| Product metadata | ✅ Completo | 🔴 Alta | No |
| Sitemap dinámico | ✅ Completo | 🔴 Alta | No |
| Robots.txt | ✅ Completo | 🔴 Alta | No |
| PWA Manifest | ✅ Completo | 🟡 Media | No |
| JSON-LD schemas | ✅ Completo | 🟡 Media | No |
| Imagen OG | ⚠️ Temporal | 🔴 Alta | **Sí - Crear** |
| Google Console | ❌ Pendiente | 🔴 Alta | **Sí - Registrar** |
| Google Analytics | ❌ Pendiente | 🔴 Alta | **Sí - Instalar** |
| Homepage SSR | ❌ Pendiente | 🟡 Media | **Sí - Refactorizar** |
| Alt texts | ⚠️ Revisar | 🟡 Media | **Sí - Auditar** |
| Favicons | ⚠️ Revisar | 🟡 Media | **Sí - Verificar** |

---

## 🚀 Acción Inmediata Recomendada

**Si vas a lanzar HOY**, haz esto en orden:

1. ✅ Crear `/public/og.jpg` (30 mins) → Usa Canva
2. ✅ Registrar Google Search Console (15 mins)
3. ✅ Instalar Google Analytics 4 (15 mins)
4. ✅ Verificar que el sitio se ve bien en móvil
5. ✅ Hacer una compra de prueba completa
6. 🚀 **LANZAR**

**Después del lanzamiento** (primera semana):
1. Monitorear Search Console diario
2. Verificar indexación con `site:manosdelmargamarga.cl`
3. Ejecutar auditorías de Lighthouse
4. Optimizar homepage para SSR
5. Completar alt texts

---

## 📞 Soporte

**Documentación creada:**
- `SEO_OPTIMIZATION_GUIDE.md` - Guía completa y detallada
- `CAROUSEL_FEATURES.md` - Sistema de carrusel
- `TROUBLESHOOTING_CAROUSEL.md` - Solución de problemas

**Necesitas ayuda?**
```
npm run build  # Verifica errores antes de deploy
npm run dev    # Prueba local
```

**Última actualización:** Diciembre 2024
