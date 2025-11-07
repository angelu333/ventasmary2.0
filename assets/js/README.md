# 📁 Estructura Modular de JavaScript

Esta carpeta contiene todos los módulos JavaScript de Ventas Mary organizados de manera limpia y mantenible.

## 📂 Archivos y Responsabilidades

### **config.js** 🔧
- Configuración de Firebase
- Variables globales de la aplicación
- Constantes y configuraciones iniciales

### **firebase.js** 🔥
- Gestión de conexión con Firebase
- Funciones para cargar y guardar datos
- Verificación de estado de Firebase

### **productos.js** 📦
- Gestión de productos
- Agregar y finalizar productos
- Cálculos de ventas y totales

### **clientas.js** 👥
- Gestión de clientas
- Agregar y registrar clientas
- Obtener estadísticas de clientas

### **autocompletado.js** 🔍
- Sistema de autocompletado
- Sugerencias de nombres
- Navegación por teclado

### **ui.js** 🎨
- Interfaz de usuario
- Notificaciones
- Navegación y modales
- Actualización de estadísticas

### **pwa.js** 📱
- Funcionalidad PWA
- Service Worker
- Instalación de la app
- Detección de conectividad

### **voz.js** 🎤
- Reconocimiento de voz
- Procesamiento de comandos
- Registro de ventas por voz

### **main.js** 🚀
- Inicialización de la aplicación
- Coordinación de módulos
- Configuración inicial

## 🔄 Flujo de Carga

```
1. config.js      → Configuración y variables
2. firebase.js    → Conexión a base de datos
3. ui.js          → Funciones de interfaz
4. productos.js   → Lógica de productos
5. clientas.js    → Lógica de clientas
6. autocompletado.js → Sistema de sugerencias
7. pwa.js         → Funcionalidad PWA
8. voz.js         → Reconocimiento de voz
9. main.js        → Inicialización final
```

## ✨ Ventajas de esta Estructura

- ✅ **Código organizado** y fácil de mantener
- ✅ **Módulos independientes** y reutilizables
- ✅ **Fácil de debuggear** y encontrar errores
- ✅ **Escalable** para futuras funcionalidades
- ✅ **Mejor rendimiento** con carga modular
- ✅ **Código limpio** y profesional

## 🔧 Cómo Agregar Nuevas Funcionalidades

1. **Crear nuevo módulo** en esta carpeta
2. **Agregar script** al index.html
3. **Exportar funciones** necesarias
4. **Documentar** en este README

## 📝 Notas

- Todos los módulos dependen de `config.js`
- `main.js` debe cargarse al final
- Las funciones globales se exportan en `main.js`