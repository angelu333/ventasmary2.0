# 💅 Ventas Mary - Sistema de Gestión de Ventas

Sistema PWA profesional para gestionar ventas de productos de belleza con reconocimiento de voz.

## 🚀 Características

- ✅ **PWA Instalable** - Funciona como app nativa
- 🎤 **Reconocimiento de Voz** - Agrega clientas por voz
- 📊 **Estadísticas en Tiempo Real** - Gráficos y reportes
- 🔄 **Modo Offline** - Funciona sin conexión
- 📱 **Responsive** - Optimizado para móvil y desktop
- 🔥 **Firebase** - Base de datos en tiempo real
- 📄 **Exportar PDF** - Genera reportes profesionales
- 💬 **WhatsApp** - Envía mensajes directos

## 📁 Estructura del Proyecto

```
Ventas-mary/
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── icons/
│   │   └── icon-*.png
│   └── js/
│       ├── autocompletado.js
│       ├── clientas.js
│       ├── config.js
│       ├── firebase.js
│       ├── main.js
│       ├── modales.js
│       ├── productos.js
│       ├── pwa.js
│       ├── ui.js
│       └── voz.js
├── docs/
│   ├── create-icons.html
│   ├── ESTRUCTURA.md
│   └── INSTRUCCIONES-PWA.md
├── index.html
├── manifest.json
├── sw.js
└── README.md
```

## 🎤 Uso del Reconocimiento de Voz

1. Registra un producto con nombre y precio
2. Presiona el botón del micrófono 🎤
3. Di el comando: **"[Nombre] [Color] [Cantidad]"**

**Ejemplos:**
- "María rojo dos"
- "Ana Pérez azul"
- "Lucia tres"

**Colores reconocidos:** rojo, azul, rosa, negro, blanco, verde, amarillo, morado, naranja, plateado, dorado, transparente

## 🛠️ Tecnologías

- HTML5, CSS3, JavaScript (Vanilla)
- Firebase Realtime Database
- Web Speech API
- Service Workers (PWA)
- Chart.js
- jsPDF

## 📦 Instalación

1. Clona el repositorio
2. Configura Firebase en `assets/js/config.js`
3. Abre `index.html` en un servidor local
4. Instala la PWA desde el navegador

## 🌐 Deploy

Compatible con:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

---

Desarrollado con ❤️ para Ventas Mary
