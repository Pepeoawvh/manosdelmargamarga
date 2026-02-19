# 🎠 Solución: Actualizar Carrusel en Desarrollo

## Problema
No se ven las actualizaciones del formulario de carrusel después de subir a desarrollo.

## ✅ El código está correcto
- SlideForm.jsx ✓ (con 3 pestañas)
- HeroCarousel.jsx ✓ (renderiza layout/styling)
- CarouselManager.jsx ✓ (botón editar funciona)

## 🔧 Soluciones (ejecutar en orden)

### 1. Limpiar caché de Next.js 🔴 URGENTE
```bash
# Detener el servidor si está corriendo (Ctrl+C)

# Eliminar carpeta .next
rm -rf .next

# Reinstalar dependencias (opcional, solo si hay problemas)
npm install

# Iniciar en modo desarrollo
npm run dev
```

**PowerShell (Windows):**
```powershell
# Detener servidor (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

### 2. Limpiar caché del navegador
1. **Chrome/Edge:** Ctrl + Shift + Delete
2. Seleccionar "Imágenes y archivos en caché"
3. Click en "Borrar datos"
4. **O** abrir en modo incógnito: Ctrl + Shift + N

### 3. Hard Reload en el navegador
- **Windows:** Ctrl + F5
- **Mac:** Cmd + Shift + R

### 4. Verificar que el código esté actualizado 🔍

Abrir `src/app/components/slides/SlideForm.jsx` y buscar estas líneas:

```javascript
// Debe estar en línea ~30-35
const [activeSection, setActiveSection] = useState("basic"); // basic, layout, styling

// Debe estar en línea ~14-27
layout: {
  horizontalAlign: "left",
  verticalAlign: "center",
  textAlign: "left",
  maxWidth: "2xl",
},
styling: {
  titleSize: "large",
  titleColor: "#ffffff",
  descriptionColor: "#ffffff",
  overlayOpacity: 40,
  overlayColor: "black",
}
```

Si **NO** encuentras estas líneas → el código no se subió correctamente.

### 5. Actualizar slides existentes en Firebase 💾

**Problema:** Los slides antiguos en Firebase no tienen las nuevas propiedades.

**Solución A - Automática (mejor):**

Crear script de migración:

```javascript
// scripts/migrate-carousel.js
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

const defaults = {
  layout: {
    horizontalAlign: "left",
    verticalAlign: "center",
    textAlign: "left",
    maxWidth: "2xl",
  },
  styling: {
    titleSize: "large",
    titleColor: "#ffffff",
    descriptionColor: "#ffffff",
    overlayOpacity: 40,
    overlayColor: "black",
  },
};

async function migrateSlides() {
  console.log('🔄 Migrando slides existentes...');
  
  const snapshot = await db.collection('carousel-slides').get();
  
  let updated = 0;
  const batch = db.batch();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Solo actualizar si no tiene las propiedades
    if (!data.layout || !data.styling) {
      const ref = db.collection('carousel-slides').doc(doc.id);
      batch.update(ref, {
        layout: data.layout || defaults.layout,
        styling: data.styling || defaults.styling,
      });
      updated++;
    }
  });
  
  if (updated > 0) {
    await batch.commit();
    console.log(`✅ ${updated} slides actualizados exitosamente`);
  } else {
    console.log('✅ Todos los slides ya están actualizados');
  }
  
  process.exit(0);
}

migrateSlides().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
```

**Ejecutar:**
```bash
node scripts/migrate-carousel.js
```

**Solución B - Manual:**
1. Ir al admin panel
2. Editar cada slide existente
3. Guardar sin cambios (esto agregará las nuevas propiedades)

### 6. Verificar en Firebase Console 🔥

1. Ir a: https://console.firebase.google.com/
2. Firestore Database > carousel-slides
3. Abrir un slide existente
4. Verificar que tenga estas propiedades:
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

Si **NO** tiene estas propiedades → ejecutar script de migración.

### 7. Verificar en el Admin Panel 🎛️

1. Ir a: http://localhost:3000/adminpanel
2. Sección "Carrusel de Imágenes"
3. Click en "Añadir Nuevo Slide"
4. Deberías ver **3 pestañas**:
   - 📝 Básico
   - 📐 Posicionamiento  
   - 🎨 Estilos

Si **NO** ves las 3 pestañas → ejecutar paso 1 (limpiar caché)

## 🐛 Si nada funciona

### Verificar errores en consola

**Navegador (F12):**
```
Buscar errores en rojo en la consola
```

**Terminal del servidor:**
```
Buscar errores durante npm run dev
```

### Reinstalación completa

```bash
# Limpiar todo
rm -rf node_modules .next

# Reinstalar
npm install

# Iniciar
npm run dev
```

### Verificar variables de entorno

Archivo `.env.local` debe tener:
```
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_CLIENT_EMAIL=tu-email@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## ✅ Confirmación de que funciona

1. Admin panel muestra 3 pestañas en el formulario
2. Puedes cambiar alineación (izquierda/centro/derecha)
3. Puedes cambiar colores de título y descripción
4. Al guardar, el carrusel frontend refleja los cambios

## 📞 Ayuda adicional

Si después de esto no funciona, verifica:
1. ¿El servidor está corriendo en el puerto correcto?
2. ¿Hay errores en la consola del navegador?
3. ¿Firebase está respondiendo correctamente?
4. ¿El build de producción funciona? `npm run build`

---

**Última actualización:** Febrero 2026
