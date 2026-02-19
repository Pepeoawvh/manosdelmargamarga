# 🎨 Guía de Favicons - Manos del Marga Marga

## Estado Actual
❌ **No hay favicons configurados actualmente**

## ✅ Favicons Requeridos

### 1. Archivos Necesarios
Coloca estos archivos en `/public/`:

```
/public/
  ├── favicon.ico          # 32x32px - Navegadores antiguos
  ├── favicon-16x16.png    # 16x16px - Navegadores
  ├── favicon-32x32.png    # 32x32px - Navegadores
  ├── apple-touch-icon.png # 180x180px - iOS Safari
  ├── android-chrome-192x192.png  # 192x192px - Android
  └── android-chrome-512x512.png  # 512x512px - Android
```

### 2. Generador Recomendado (OPCIÓN MÁS FÁCIL)
**🔗 https://realfavicongenerator.net/**

**Pasos:**
1. Cargar logo de Manos del Marga Marga (mmm.png)
2. Configurar:
   - iOS: Background color = `#798f38` (verde corporativo)
   - Android: Background color = `#798f38`
   - Windows Metro: Tile color = `#798f38`
3. Descargar paquete completo
4. Extraer todos los archivos en `/public/`
5. Copiar código HTML generado (ya está implementado en layout.js)

### 3. Diseño del Favicon
**Recomendaciones:**
- Usar logo simplificado de MMM
- Colores: Verde corporativo (#798f38) + crema (#fff9f2)
- Fondo sólido verde con iniciales "MMM" en crema
- O ícono de hoja/papel estilizado

### 4. Implementación Manual (Alternativa)

#### Opción A: Desde Canva
1. Ir a https://www.canva.com/
2. Crear diseño personalizado: 512 x 512 px
3. Diseñar favicon con logo MMM
4. Descargar como PNG (alta calidad)
5. Redimensionar:
   ```bash
   # Si tienes ImageMagick instalado:
   magick favicon-512.png -resize 32x32 favicon.ico
   magick favicon-512.png -resize 16x16 favicon-16x16.png
   magick favicon-512.png -resize 32x32 favicon-32x32.png
   magick favicon-512.png -resize 180x180 apple-touch-icon.png
   magick favicon-512.png -resize 192x192 android-chrome-192x192.png
   # Mantener 512x512 como android-chrome-512x512.png
   ```

#### Opción B: Desde Figma (gratis)
1. Crear documento 512x512px
2. Diseñar favicon
3. Exportar:
   - 512x512 → android-chrome-512x512.png
   - 192x192 → android-chrome-192x192.png
   - 180x180 → apple-touch-icon.png
   - 32x32 → favicon-32x32.png & favicon.ico
   - 16x16 → favicon-16x16.png

### 5. Verificación en layout.js

El código ya está preparado en `src/app/layout.js`:

```javascript
export const metadata = {
  // ... otras propiedades
  
  manifest: "/manifest.json", // ✅ Ya configurado
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MMM Papel",
  }, // ✅ Ya configurado
  
  // Los favicons se detectan automáticamente si están en /public/
}
```

**Next.js detecta automáticamente:**
- `/public/favicon.ico`
- `/public/favicon-16x16.png`
- `/public/favicon-32x32.png`
- `/public/apple-touch-icon.png`

### 6. Actualizar manifest.json

Ya está creado en `/public/manifest.json` con referencias a iconos:

```json
{
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**ACCIÓN REQUERIDA:** Crear estos iconos y colocarlos en `/public/`

### 7. Testing de Favicons

Una vez creados, verificar en:

1. **Navegadores:**
   - Chrome: Verificar pestaña y favoritos
   - Firefox: Verificar pestaña
   - Safari: Verificar pestaña y pantalla de inicio iOS
   - Edge: Verificar pestaña

2. **PWA:**
   - Android: Instalar PWA y ver icono en home screen
   - iOS: "Agregar a pantalla de inicio"

3. **Herramientas online:**
   - https://realfavicongenerator.net/favicon_checker
   - Pegar URL: `https://www.manosdelmargamarga.cl`

### 8. Checklist de Implementación

- [ ] Descargar/crear favicon base (512x512px)
- [ ] Generar todos los tamaños en realfavicongenerator.net
- [ ] Copiar archivos a `/public/`
- [ ] Verificar que manifest.json apunta a los archivos correctos
- [ ] Hacer deploy
- [ ] Verificar en múltiples navegadores
- [ ] Verificar en dispositivos móviles
- [ ] Limpiar caché de navegador si no aparecen

### 9. Diseño Sugerido para MMM

**Opción 1 - Minimalista:**
```
┌─────────────┐
│             │
│    MMM      │  ← Letras crema en verde
│    [hoja]   │  ← Icono pequeño de hoja/papel
│             │
└─────────────┘
Fondo: #798f38 (verde)
Texto: #fff9f2 (crema)
```

**Opción 2 - Icónico:**
```
┌─────────────┐
│             │
│   [papel]   │  ← Silueta de papel/hoja
│   doblado   │     estilizada
│             │
└─────────────┘
Fondo: #798f38
Icono: #fff9f2
```

**Opción 3 - Letra M:**
```
┌─────────────┐
│             │
│      M      │  ← M grande y elegante
│    [dot]    │  ← Punto decorativo abajo
│             │
└─────────────┘
Fondo: Degradado verde
Letra: Blanco/crema
```

## 🚀 Acción Inmediata

**Prioridad:** 🟡 Media (antes del lanzamiento, pero no crítico)

**Tiempo estimado:** 20-30 minutos

**Pasos rápidos:**
1. Ve a https://realfavicongenerator.net/
2. Sube `public/images/logos/mmm.png`
3. Descarga paquete generado
4. Copia todos los archivos a `/public/`
5. ✅ Listo

## 📝 Notas

- Los favicons mejoran la profesionalidad del sitio
- Son parte del branding visual
- Importante para reconocimiento en pestañas del navegador
- PWA no funcionará correctamente sin los iconos Android
- iOS requiere apple-touch-icon para "Agregar a pantalla de inicio"

**Última actualización:** Febrero 2026
