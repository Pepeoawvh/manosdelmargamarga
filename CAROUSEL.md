# Sistema de Carrusel — Manos del Marga Marga

Gestión completa del banner principal desde el panel de administración. Permite crear, editar y ordenar slides con control total sobre imagen, texto, posicionamiento y estilos.

---

## Tipos de Slide

| Tipo | Contenido | Uso ideal |
|---|---|---|
| **Completo** (`full`) | Imagen + título + descripción + botones | Llamadas a la acción principales |
| **Solo imagen** (`image`) | Solo imagen | Banners puramente visuales |
| **Imagen + Texto** (`imageText`) | Imagen + título + descripción | Mensajes informativos sin acción |

---

## Opciones de personalización

### Posicionamiento

**Alineación horizontal** — dónde se ubica el bloque de contenido en el ancho del banner:
- Izquierda / Centro / Derecha

**Alineación vertical** — dónde se ubica en la altura del banner:
- Arriba / Centro / Abajo

**Alineación del texto** — dirección del texto dentro del bloque:
- Izquierda / Centro

**Ancho máximo del contenido:**

| Opción | Tamaño aproximado |
|---|---|
| Pequeño | 384 px |
| Mediano | 448 px |
| Grande | 512 px |
| Extra Grande | 576 px |
| 2X Grande *(recomendado)* | 672 px |
| Ancho completo | Sin límite |

---

### Estilos

**Tamaño del título:** Pequeño (24px) · Mediano (32px) · Grande (40px) · Extra Grande (48px)

**Colores de texto — paleta de marca:**

| Color | Hex | Uso sugerido |
|---|---|---|
| Blanco | `#ffffff` | Fondos oscuros |
| Negro | `#000000` | Fondos claros |
| Verde Marca | `#798f38` | Títulos destacados |
| Verde Oscuro | `#3a5729` | Subtítulos |
| Verde Claro | `#b4cf66` | Acentos |
| Gris Oscuro | `#535550` | Texto neutro |
| Gris Claro | `#9ca3af` | Texto sutil |

También disponible: **selector de color libre** HTML5.

**Overlay — capa semitransparente sobre la imagen:**
- Color: Negro / Blanco / Verde Marca
- Opacidad: 0% (sin capa) → 100% (sólido). Rango recomendado: 30–50%

---

### Imagen para móvil

Se puede especificar una URL de imagen alternativa para pantallas pequeñas. Si se omite, se usa la imagen principal en todos los dispositivos.

---

## Flujo de trabajo recomendado

1. **Crear el slide** — elegir tipo, imagen, título y descripción
2. **Ajustar posición** — alineación horizontal/vertical, ancho máximo
3. **Personalizar estilos** — colores, tamaño de título, opacidad del overlay
4. **Revisar en móvil** — verificar imagen alternativa si es necesario
5. **Activar y ordenar** — marcar como visible y arrastrar para reordenar

---

## Combinaciones de diseño sugeridas

**Máxima legibilidad**
```
Overlay: Negro 40%  |  Título: Blanco  |  Descripción: Blanco
Posición: Izquierda – Centro
```

**Look moderno**
```
Overlay: Blanco 30%  |  Título: Verde Oscuro  |  Descripción: Gris Oscuro
Posición: Centro – Centro  |  Texto: Centro
```

**Identidad de marca**
```
Overlay: Verde Marca 50%  |  Título: Blanco  |  Descripción: Blanco
Posición: Derecha – Centro
```

**Promoción de producto**
```
Tipo: Completo  |  Posición: Derecha – Centro
Título: Grande, Verde Marca  |  Overlay: Blanco 30%
Botón primario: "Ver Colección"
```

**Anuncio informativo**
```
Tipo: Imagen + Texto  |  Posición: Izquierda – Arriba
Título: Mediano, Negro  |  Overlay: Blanco 40%
```

---

## Retrocompatibilidad

Los slides creados antes de la actualización funcionan sin cambios. Sus valores por defecto son:

```json
{
  "layout": {
    "horizontalAlign": "left",
    "verticalAlign": "center",
    "textAlign": "left",
    "maxWidth": "2xl"
  },
  "styling": {
    "titleSize": "large",
    "titleColor": "#ffffff",
    "descriptionColor": "#ffffff",
    "overlayOpacity": 40,
    "overlayColor": "black"
  }
}
```

Si un slide antiguo no tiene estas propiedades en Firestore, editarlo y guardar (sin cambios) las agrega automáticamente.

Para migrar todos los slides de una sola vez existe el script [`scripts/migrate-carousel.js`](scripts/migrate-carousel.js):

```bash
node scripts/migrate-carousel.js
```

---

## Bugs conocidos y correcciones aplicadas

### Slides no se actualizaban al editar

**Síntoma:** Los cambios no se reflejaban al editar el mismo slide más de una vez.

**Causa:** El `useEffect` en `SlideForm` usaba `initialData?.id` como dependencia, por lo que no se ejecutaba al reeditar el mismo slide.

**Corrección aplicada en `SlideForm.jsx`:**
- La dependencia del `useEffect` se cambió a `initialData` completo (no solo el `id`)
- El objeto `SLIDE_DEFAULTS` se movió fuera del componente para evitar recreación en cada render
- Se agregó reset explícito al abrir el formulario en modo "nuevo slide"

**Corrección aplicada en `useCarouselManager.jsx` → `updateSlide`:**
- Los objetos anidados (`layout`, `styling`, `primaryButton`, `secondaryButton`) se envían explícitamente al `updateDoc` para evitar campos `undefined`

---

## Troubleshooting

### Los cambios no se ven tras actualizar el código

**1. Limpiar caché de Next.js** *(primer paso siempre)*

```powershell
# Detener el servidor (Ctrl+C), luego:
Remove-Item -Recurse -Force .next
npm run dev
```

**2. Limpiar caché del navegador**
- Chrome/Edge: `Ctrl + Shift + Delete` → Imágenes y archivos en caché
- Hard reload: `Ctrl + F5`
- O abrir en modo incógnito: `Ctrl + Shift + N`

**3. Verificar que el código está actualizado**

Buscar en `SlideForm.jsx` la constante `SLIDE_DEFAULTS` y el estado `activeSection`:
```bash
# PowerShell
Get-Content src\app\components\slides\SlideForm.jsx | Select-String "SLIDE_DEFAULTS"
# Debe retornar varias líneas
```

Si no aparece → el archivo no se guardó o actualizó correctamente.

**4. Verificar propiedades en Firestore**

En [Firebase Console](https://console.firebase.google.com/) → Firestore → `carousel-slides` → abrir un documento. Debe tener los campos `layout` y `styling`. Si no los tiene, ejecutar el script de migración o editar y guardar el slide desde el admin panel.

---

### Los slides no guardan / error al guardar

**Verificar en consola del navegador (`F12`):**

Al guardar un slide deberían aparecer estos logs:
```
📝 SlideForm enviando datos: { type, title, hasLayout: true, hasStyling: true, ... }
💾 Guardando slide... { editing: true/false, slideId: "...", hasLayout: true }
✅ Slide actualizado exitosamente
```

Si aparece `❌ Error guardando slide:` — el mensaje junto al error indica la causa.

**Causas frecuentes:**
- Permisos de Firestore: verificar que las reglas permitan escritura en `carousel-slides`
- Variables de entorno faltantes en `.env.local`:
  ```
  FIREBASE_PROJECT_ID=...
  FIREBASE_CLIENT_EMAIL=...
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
  ```

---

### El formulario del admin no muestra las 3 pestañas

El formulario debe tener las pestañas **Básico · Posicionamiento · Estilos**. Si no aparecen:

1. Limpiar caché de Next.js (paso 1 de arriba)
2. Verificar que `SlideForm.jsx` contiene `const [activeSection, setActiveSection] = useState("basic")`

---

### Reinstalación completa

Si ninguna solución anterior funciona:
```bash
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev
```
