# 📁 Estructura del Proyecto Ventas Mary

## 🏗️ Arquitectura Limpia y Modular

```
Ventas-mary/
│
├── 📱 PWA Core
│   ├── index.html              # Interfaz principal
│   ├── manifest.json           # Configuración PWA
│   ├── sw.js                   # Service Worker
│   └── styles.css              # Estilos globales
│
├── 🎨 Assets
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
│
├── 💻 JavaScript Modules
│   ├── config.js               # Configuración Firebase y variables
│   ├── firebase.js             # Gestión de base de datos
│   ├── ui.js                   # Interfaz de usuario
│   ├── productos.js            # Lógica de productos
│   ├── clientas.js             # Gestión de clientas
│   ├── autocompletado.js       # Sistema de sugerencias
│   ├── modales.js              # Modales y vistas
│   ├── pwa.js                  # Funcionalidad PWA
│   ├── voz.js                  # Reconocimiento de voz
│   ├── main.js                 # Inicialización
│   └── README.md               # Documentación de módulos
│
├── 📚 Documentación
│   ├── README.md               # Documentación principal
│   ├── INSTRUCCIONES-PWA.md    # Guía de instalación PWA
│   ├── ESTRUCTURA.md           # Este archivo
│   └── create-icons.html       # Generador de iconos
│
└── ⚙️ Configuración
    ├── .gitignore              # Archivos ignorados
    └── .vscode/
        └── settings.json       # Configuración del editor

```

## 🎯 Archivos Principales

### **index.html**
- Interfaz de usuario principal
- Estructura HTML semántica
- Integración de módulos JS

### **styles.css**
- Paleta de colores cálidos
- Diseño responsivo
- Animaciones y transiciones

### **manifest.json**
- Configuración de la PWA
- Iconos y colores de tema
- Atajos de aplicación

### **sw.js**
- Service Worker para offline
- Caché de recursos
- Actualizaciones automáticas

## 🔧 Módulos JavaScript

Cada módulo tiene una responsabilidad específica:

1. **config.js** - Variables globales y configuración
2. **firebase.js** - Conexión y operaciones de BD
3. **ui.js** - Notificaciones y navegación
4. **productos.js** - CRUD de productos
5. **clientas.js** - CRUD de clientas
6. **autocompletado.js** - Sugerencias inteligentes
7. **modales.js** - Ventanas modales y vistas
8. **pwa.js** - Instalación y offline
9. **voz.js** - Comandos de voz
10. **main.js** - Orquestación e inicialización

## 📦 Dependencias Externas

- Firebase 8.10.0 (Base de datos)
- Feather Icons (Iconografía)
- Chart.js (Gráficos)
- jsPDF (Generación de PDFs)
- Moment.js (Manejo de fechas)

## 🚀 Características

- ✅ PWA instalable
- ✅ Funciona offline
- ✅ Reconocimiento de voz
- ✅ Diseño responsivo
- ✅ Sincronización en tiempo real
- ✅ Notificaciones elegantes
- ✅ Código modular y limpio

## 📱 Compatibilidad

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS)
- ✅ Firefox
- ✅ Opera

## 🔄 Flujo de Datos

```
Usuario → UI → Módulos JS → Firebase → Sincronización
```

## 🎨 Paleta de Colores

- **Primario**: #d4a574 (Dorado suave)
- **Secundario**: #e8b4b8 (Rosa suave)
- **Acento**: #f7d794 (Amarillo cálido)
- **Fondos**: #fef7f0 → #f4e4d1 (Gradiente cálido)

## 📊 Tamaño del Proyecto

- **HTML**: ~300 líneas
- **CSS**: ~1500 líneas
- **JavaScript**: ~1200 líneas (modular)
- **Total**: Ligero y optimizado

---

**Última actualización**: 2025
**Versión**: 2.0.0
**Autor**: angelu333