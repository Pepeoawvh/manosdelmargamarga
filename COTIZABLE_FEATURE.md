# Funcionalidad: Productos Cotizables

## ¿Para qué sirve?

Permite publicar en el catálogo productos que **no tienen stock fijo** porque están asociados a un servicio o trabajo personalizado: impresión personalizada, papel a pedido, diseño exclusivo, etc.

En lugar de los botones de compra o reserva, estos productos muestran un botón **"Cotizar por WhatsApp"** que abre una conversación pre-armada con el equipo, incluyendo los datos del producto.

---

## Nueva propiedad en Firestore

| Campo      | Tipo      | Valor por defecto |
|------------|-----------|-------------------|
| `cotizable` | `Boolean` | `false`           |

Se guarda junto al resto de las propiedades del producto en la colección `productosmmm`.

---

## Cómo activar un producto como cotizable

### Producto nuevo
1. Ir al **Panel de Administración → Agregar producto**
2. Completar los campos normalmente (título, descripción, categorías, imagen)
3. Marcar el checkbox **"Producto cotizable"** en la sección de opciones
4. Guardar

### Producto existente
1. Ir al **Panel de Administración**
2. Buscar el producto y presionar **Editar**
3. Marcar el checkbox **"Producto cotizable"**
4. Guardar

> **Nota sobre precio y stock:** En productos cotizables se recomienda dejar el precio en `0` (se mostrará "Precio a cotizar") y el stock en `0`. Ambos campos siguen siendo editables pero no tienen efecto visible para el cliente.

---

## Comportamiento en el sitio

### Tarjeta de producto (`/catalogo`)

| Elemento         | Producto normal            | Producto cotizable               |
|------------------|----------------------------|----------------------------------|
| Badge superior   | Categoría / Agotado        | Categoría + badge **"Cotizable"** (terracota) |
| Precio           | `CLP $X.XXX`               | `Precio a cotizar` (tono suave)  |
| Botón de acción  | Agregar al carrito         | **Cotizar** (con ícono WhatsApp) |

### Detalle del producto (`/producto/[slug]`)

| Elemento           | Producto normal               | Producto cotizable                          |
|--------------------|-------------------------------|---------------------------------------------|
| Precio             | `$X.XXX`                      | `Precio a cotizar`                          |
| Subtexto precio    | IVA incluido                  | Precio según requerimiento                  |
| Badge de stock     | En stock / ¡Solo quedan X!    | **Producto a pedido** (fondo terracota suave) |
| Botones de acción  | Agregar al carrito + Reservar | Nota informativa + **Cotizar por WhatsApp** |

### Carrito lateral

Si el usuario agrega un producto cotizable al carrito (por ejemplo, navegando directamente):

- Se muestra un aviso: _"Tienes productos a pedido en tu carrito. Usa el botón de cotizar para consultarlos."_
- Aparece el botón **"Cotizar por WhatsApp"** (o "Cotizar productos a pedido" si hay mezcla)
- El botón **"Iniciar Compra"** queda deshabilitado mientras haya productos cotizables
- El mensaje de WhatsApp lista todos los productos cotizables del carrito con su URL

---

## Mensaje enviado a WhatsApp

### Desde el detalle del producto (1 producto):

```
¡Hola! Me gustaría cotizar el siguiente producto de Manos del Marga Marga:

📦 *Nombre del producto*
🏷️ Categoría: Categoría 1, Categoría 2
🔗 https://www.manosdelmargamarga.cl/producto/slug-del-producto

¡Gracias!
```

### Desde el carrito (múltiples productos cotizables):

```
¡Hola! Quisiera cotizar los siguientes productos de Manos del Marga Marga:

1. *Producto A* — https://www.manosdelmargamarga.cl/producto/producto-a
2. *Producto B* — https://www.manosdelmargamarga.cl/producto/producto-b

¿Podrían informarme disponibilidad y precios? ¡Gracias!
```

El número de destino es **+56 32 212 1504**.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/app/components/cart/QuoteButton.jsx` | **Nuevo.** Componente botón WhatsApp reutilizable (modo `compact` para tarjeta y modo completo para detalle) |
| `src/app/components/product/ProductForm.jsx` | Checkbox "Producto cotizable" en el formulario de creación/edición |
| `src/app/components/product/ProductCard.jsx` | Badge, precio y botón adaptados para cotizables |
| `src/app/components/product/ProductDetails.jsx` | Precio, badge de stock y botones adaptados para cotizables |
| `src/app/components/cart/ShoppingCart.jsx` | Detección de cotizables en carrito + botón y mensaje de cotización múltiple |

---

## Compatibilidad con otras propiedades

| Propiedad    | Interacción con `cotizable: true`                                              |
|--------------|--------------------------------------------------------------------------------|
| `reservable` | Ignorado. Si el producto es cotizable, solo se muestra el botón de cotizar     |
| `stock`      | No se muestra al usuario. No afecta la disponibilidad del botón cotizar        |
| `price`      | Si es `0`, se muestra "Precio a cotizar". Si tiene valor, se muestra como referencia en el mensaje de WhatsApp |
| `featured`   | Compatible. Un producto cotizable puede ser destacado y aparecer en el inicio  |

---

## Casos de uso recomendados

- Impresión personalizada con logo o diseño del cliente
- Papel con semillas a medida o en colores especiales
- Pedidos al por mayor con precio por volumen
- Productos en desarrollo o pre-lanzamiento
- Servicios de diseño o protocolo gráfico
