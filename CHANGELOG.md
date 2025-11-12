# 📋 Changelog - Ventas Mary

## 🎉 Versión 2.3.0 - Sistema de Inventario (Pendiente de Deploy)

### ✨ Nuevas Funcionalidades

#### 📦 Sistema de Inventario Completo
- **Gestión de Inventario**: Nueva sección para administrar productos
  - Agregar productos con nombre, precio, stock y stock mínimo
  - Editar productos existentes
  - Eliminar productos del inventario
  - Alertas visuales de stock bajo/medio/alto

#### 🔄 Integración con Ventas
- **Selector de Productos**: En el inicio puedes elegir entre:
  - **Desde Inventario**: Selecciona productos existentes con stock disponible
  - **Manual**: Ingresa productos manualmente (modo anterior)
- **Descuento Automático**: Al vender, el stock se descuenta automáticamente
- **Alertas de Stock**: Notificaciones cuando el stock está bajo

#### 🎨 Mejoras en Gestión de Clientas
- Click en clienta para ver y editar todos sus pedidos
- Agregar nuevos productos a clientas existentes
- Editar pedidos individuales (producto, precio, cantidad, color)
- Eliminar pedidos específicos

#### 📊 Mejoras en Ver Productos
- Click en producto para ver todas las clientas que lo compraron
- Agregar clientas a productos existentes
- Eliminar pedidos específicos por producto

#### 📄 PDF Mejorado
- Formato horizontal (landscape) para mejor aprovechamiento
- Diseño optimizado para ahorrar hojas
- Pedidos de clientas no se cortan entre páginas
- Sin total general (solo subtotales por clienta)

### 🎨 Mejoras Visuales
- Badges de stock con colores (rojo/amarillo/verde)
- Iconos mejorados en todo el sistema
- Diseño responsive para móvil
- Transiciones suaves

### 🔧 Mejoras Técnicas
- Nuevo archivo `inventario.js` para gestión de stock
- Sincronización con Firebase en tiempo real
- Validaciones mejoradas
- Código modular y mantenible

---

## 📝 Versión 2.2.0 - Funcionalidades Completas

### ✨ Implementaciones
- Buscar Clienta con búsqueda en tiempo real
- Gestionar Clientas con estadísticas
- Ver Productos vendidos con detalles
- Enviar por WhatsApp (completo o por clienta)
- Generar PDF profesional
- Reconocimiento de voz mejorado

---

## 🎨 Versión 2.1.0 - Reorganización

### 🗂️ Estructura
- Carpeta `assets/` con subcarpetas organizadas
- Carpeta `docs/` para documentación
- README actualizado

---

## 🚀 Versión 2.0.0 - PWA Inicial

### ✨ Características Iniciales
- PWA instalable
- Firebase Realtime Database
- Modo offline
- Diseño responsive
