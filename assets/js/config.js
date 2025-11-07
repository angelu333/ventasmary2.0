// ===== CONFIGURACIÓN FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyDrr78dgKymDyjxgZitGq0QLddCy8thkXU",
    authDomain: "ventasmary-f0aa0.firebaseapp.com",
    databaseURL: "https://ventasmary-f0aa0-default-rtdb.firebaseio.com",
    projectId: "ventasmary-f0aa0",
    storageBucket: "ventasmary-f0aa0.firebasestorage.app",
    messagingSenderId: "45177270937",
    appId: "1:45177270937:web:040e6c5f0f8c7233cf3e08",
    measurementId: "G-GZ5LH02RS6"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ===== VARIABLES GLOBALES =====
let pedidos = {};
let clientasRegistradas = {};
let productoActual = {};
let estadisticasSemanales = {};
let graficosEstadisticas = {};
let historialGanancias = {};
let clientasMasivo = [];

// Variables para autocompletado
let selectedSuggestionIndex = -1;
let suggestions = [];

// Variables PWA
let deferredPrompt;
let isInstalled = false;