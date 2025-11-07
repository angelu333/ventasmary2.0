// Configuración de Firebase
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

// Variables globales
let pedidos = {};
let clientasRegistradas = {};
let productoActual = {};
let estadisticasSemanales = {};
let graficosEstadisticas = {};
let historialGanancias = {};
let clientasMasivo = [];

// Variables para el autocompletado
let selectedSuggestionIndex = -1;
let suggestions = [];

// Cargar datos iniciales
function cargarDatos() {
    database.ref('pedidos').on('value', (snapshot) => {
        pedidos = snapshot.val() || {};
        actualizarEstadisticasRapidas();
    });

    database.ref('clientasRegistradas').on('value', (snapshot) => {
        clientasRegistradas = snapshot.val() || {};
    });

    database.ref('estadisticasSemanales').on('value', (snapshot) => {
        estadisticasSemanales = snapshot.val() || {};
    });

    database.ref('historialGanancias').on('value', (snapshot) => {
        historialGanancias = snapshot.val() || {};
    });
}

// Función para actualizar estadísticas rápidas
function actualizarEstadisticasRapidas() {
    const totalVentas = calcularTotalVentas();
    const totalClientas = Object.keys(pedidos).length;
    const totalProductos = calcularTotalProductos();

    const ventasEl = document.getElementById('quickTotalVentas');
    const clientasEl = document.getElementById('quickTotalClientas');
    const productosEl = document.getElementById('quickTotalProductos');

    if (ventasEl) ventasEl.textContent = totalVentas;
    if (clientasEl) clientasEl.textContent = totalClientas;
    if (productosEl) productosEl.textContent = totalProductos;
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-content">
            <i data-feather="${tipo === 'error' ? 'alert-circle' : tipo === 'success' ? 'check-circle' : 'info'}"></i>
            <span>${mensaje}</span>
        </div>
    `;

    if (!document.querySelector('#notificacion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notificacion-styles';
        styles.textContent = `
            .notificacion {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                z-index: 1100;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 350px;
                border-left: 4px solid;
            }
            .notificacion-success { border-left-color: #81c784; }
            .notificacion-error { border-left-color: #e57373; }
            .notificacion-info { border-left-color: #64b5f6; }
            .notificacion.show { transform: translateX(0); }
            .notificacion-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                color: #333;
            }
            .notificacion-content svg {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
            .notificacion-success svg { color: #81c784; }
            .notificacion-error svg { color: #e57373; }
            .notificacion-info svg { color: #64b5f6; }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notificacion);

    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    setTimeout(() => notificacion.classList.add('show'), 100);

    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Función para obtener nombres de clientas
function obtenerNombresClientas() {
    return Object.keys(pedidos);
}

// Función para mostrar sugerencias
function mostrarSugerencias(input) {
    const suggestionsList = document.getElementById('suggestionsList');
    if (!suggestionsList) return;

    suggestionsList.innerHTML = '';

    if (!input || input.length < 1) {
        suggestionsList.style.display = 'none';
        return;
    }

    const nombresClientas = obtenerNombresClientas();
    suggestions = nombresClientas.filter(nombre =>
        nombre.toLowerCase().includes(input.toLowerCase())
    );

    if (suggestions.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach((suggestion) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        const regex = new RegExp(`(${input})`, 'gi');
        const highlightedText = suggestion.replace(regex, '<span class="suggestion-highlight">$1</span>');

        item.innerHTML = highlightedText;
        item.onclick = () => seleccionarSugerencia(suggestion);
        suggestionsList.appendChild(item);
    });

    suggestionsList.style.display = 'block';
    selectedSuggestionIndex = -1;
}

// Función para seleccionar una sugerencia
function seleccionarSugerencia(nombre) {
    const input = document.getElementById('nombreClienta');
    const suggestionsList = document.getElementById('suggestionsList');

    if (input) input.value = nombre;
    if (suggestionsList) suggestionsList.style.display = 'none';
    selectedSuggestionIndex = -1;
}

// Función para navegar con teclado
function navegarSugerencias(direction) {
    if (suggestions.length === 0) return;

    if (direction === 'down') {
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
    } else if (direction === 'up') {
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
    }

    const items = document.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    if (selectedSuggestionIndex >= 0) {
        const input = document.getElementById('nombreClienta');
        if (input) input.value = suggestions[selectedSuggestionIndex];
    }
}

// Configurar eventos del input de nombre de clienta
function configurarAutocompletado() {
    const input = document.getElementById('nombreClienta');
    if (!input) return;

    input.addEventListener('input', (e) => {
        mostrarSugerencias(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navegarSugerencias('down');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navegarSugerencias('up');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                seleccionarSugerencia(suggestions[selectedSuggestionIndex]);
            } else {
                agregarCliente();
            }
        } else if (e.key === 'Escape') {
            const suggestionsList = document.getElementById('suggestionsList');
            if (suggestionsList) suggestionsList.style.display = 'none';
            selectedSuggestionIndex = -1;
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            const suggestionsList = document.getElementById('suggestionsList');
            if (suggestionsList) suggestionsList.style.display = 'none';
            selectedSuggestionIndex = -1;
        }
    });
}

// Función auxiliar para cerrar el sidebar
function cerrarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Función para toggle del sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    sidebar.classList.toggle('open');

    if (sidebar.classList.contains('open')) {
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Funciones principales
function abrirModal(contenido) {
    const modal = document.getElementById('modal');
    const modalContenido = document.getElementById('modal-contenido');
    if (modal && modalContenido) {
        modalContenido.innerHTML = contenido;
        modal.style.display = 'block';
    }
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

function irAInicio() {
    const resumen = document.getElementById('resumen');
    const welcomeSection = document.getElementById('welcomeSection');
    const productoForm = document.getElementById('producto-form');
    const clienteForm = document.getElementById('cliente-form');

    if (resumen) resumen.innerHTML = '';
    if (welcomeSection) welcomeSection.style.display = 'block';
    if (productoForm) productoForm.style.display = 'block';
    if (clienteForm) clienteForm.style.display = 'none';

    cerrarSidebar();
    actualizarEstadisticasRapidas();
}

function agregarProducto() {
    const nombreInput = document.getElementById('nombreProducto');
    const precioInput = document.getElementById('precioProducto');

    if (!nombreInput || !precioInput) return;

    const nombre = nombreInput.value.trim();
    const precio = parseInt(precioInput.value);

    if (nombre && precio > 0) {
        productoActual = { nombre: nombre, precio: precio };

        const welcomeSection = document.getElementById('welcomeSection');
        const productoForm = document.getElementById('producto-form');
        const clienteForm = document.getElementById('cliente-form');

        if (welcomeSection) welcomeSection.style.display = 'none';
        if (productoForm) productoForm.style.display = 'none';
        if (clienteForm) clienteForm.style.display = 'block';

        const modalMasivo = document.querySelector('#modal-masivo .modal-title');
        if (modalMasivo) {
            modalMasivo.textContent = `Registro Masivo - ${nombre}`;
        }
    } else {
        mostrarNotificacion('Por favor, ingrese un nombre y precio válido para el producto.', 'error');
    }
}

function agregarCliente() {
    const entradaInput = document.getElementById('nombreClienta');
    if (!entradaInput) return;

    const entrada = entradaInput.value.trim();
    if (entrada) {
        let partes = entrada.split(' ');
        const cantidadInput = document.getElementById('cantidadProducto');
        let cantidad = parseInt(cantidadInput ? cantidadInput.value : '1') || 1;
        let nombreClienta;

        if (!isNaN(partes[partes.length - 1])) {
            const cantidadTexto = parseInt(partes.pop());
            if (cantidad === 1 && cantidadTexto > 1) {
                cantidad = cantidadTexto;
            }
            nombreClienta = partes.join(' ');
        } else {
            nombreClienta = entrada;
        }

        nombreClienta = nombreClienta.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        if (!pedidos[nombreClienta]) {
            pedidos[nombreClienta] = [];
        }

        const colorInput = document.getElementById('colorProducto');
        const color = colorInput ? colorInput.value.trim() : '';

        const nuevoPedido = {
            producto: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: cantidad
        };

        if (color) {
            nuevoPedido.color = color;
        }

        pedidos[nombreClienta].push(nuevoPedido);

        // Limpiar campos
        entradaInput.value = '';
        if (colorInput) colorInput.value = '';
        if (cantidadInput) cantidadInput.value = '1';

        // Guardar en Firebase
        database.ref('pedidos').set(pedidos);

        mostrarNotificacion(`${nombreClienta} agregada exitosamente`, 'success');
        actualizarEstadisticasRapidas();
    } else {
        mostrarNotificacion('Ingrese el nombre completo de la clienta.', 'error');
    }
}

function finalizarProducto() {
    const nombreProducto = document.getElementById('nombreProducto');
    const precioProducto = document.getElementById('precioProducto');
    const nombreClienta = document.getElementById('nombreClienta');
    const colorProducto = document.getElementById('colorProducto');
    const cantidadProducto = document.getElementById('cantidadProducto');
    const welcomeSection = document.getElementById('welcomeSection');
    const productoForm = document.getElementById('producto-form');
    const clienteForm = document.getElementById('cliente-form');

    if (nombreProducto) nombreProducto.value = '';
    if (precioProducto) precioProducto.value = '';
    if (nombreClienta) nombreClienta.value = '';
    if (colorProducto) colorProducto.value = '';
    if (cantidadProducto) cantidadProducto.value = '1';

    if (welcomeSection) welcomeSection.style.display = 'block';
    if (productoForm) productoForm.style.display = 'block';
    if (clienteForm) clienteForm.style.display = 'none';

    actualizarEstadisticasRapidas();
}

// Función para mostrar resumen con nuevo diseño
function mostrarResumen() {
    const resumenDiv = document.getElementById('resumen');
    if (!resumenDiv) return;

    if (Object.keys(pedidos).length === 0) {
        resumenDiv.innerHTML = `
            <div class="empty-state">
                <i data-feather="shopping-bag"></i>
                <h3>No hay pedidos registrados</h3>
                <p>Comienza agregando productos y clientas</p>
            </div>
        `;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    let totalGeneral = 0;
    let resumen = `
        <div class="resumen-header">
            <h3><i data-feather="bar-chart-2"></i> Resumen de Pedidos</h3>
        </div>
        <div class="resumen-body">
    `;

    for (let clienta in pedidos) {
        let total = 0;
        resumen += `
            <div class="clienta-pedido">
                <div class="clienta-header">
                    <strong><i data-feather="user"></i> ${clienta}</strong>
                </div>
                <ul class="pedidos-list">
        `;

        pedidos[clienta].forEach((pedido) => {
            let subtotal = pedido.precio * pedido.cantidad;
            total += subtotal;
            const colorInfo = pedido.color ? ` <span class="color-tag">${pedido.color}</span>` : '';
            resumen += `
                <li class="pedido-item">
                    <span class="producto-info">
                        <i data-feather="package"></i>
                        ${pedido.producto}${colorInfo}
                    </span>
                    <span class="cantidad-info">${pedido.cantidad} x $${pedido.precio}</span>
                    <span class="subtotal-info">$${subtotal}</span>
                </li>
            `;
        });

        totalGeneral += total;
        resumen += `
                </ul>
                <div class="clienta-total">
                    <strong>Total: $${total}</strong>
                </div>
            </div>
        `;
    }

    resumen += `
        </div>
        <div class="resumen-footer">
            <div class="total-general">
                <strong><i data-feather="dollar-sign"></i> Total General: $${totalGeneral}</strong>
            </div>
        </div>
    `;

    resumenDiv.innerHTML = resumen;

    // Ocultar otras secciones
    const welcomeSection = document.getElementById('welcomeSection');
    const productoForm = document.getElementById('producto-form');
    const clienteForm = document.getElementById('cliente-form');

    if (welcomeSection) welcomeSection.style.display = 'none';
    if (productoForm) productoForm.style.display = 'none';
    if (clienteForm) clienteForm.style.display = 'none';

    cerrarSidebar();

    if (typeof feather !== 'undefined') feather.replace();
}

// Funciones de cálculo
function calcularTotalVentas() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.precio * pedido.cantidad;
        });
    }
    return total;
}

function calcularTotalProductos() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.cantidad;
        });
    }
    return total;
}

// Funciones para modo masivo
function abrirModoMasivo() {
    const modal = document.getElementById('modal-masivo');
    if (modal) {
        modal.style.display = 'block';

        const colorMasivo = document.getElementById('colorMasivo');
        const cantidadMasivo = document.getElementById('cantidadMasivo');
        const colorProducto = document.getElementById('colorProducto');
        const cantidadProducto = document.getElementById('cantidadProducto');

        if (colorMasivo && colorProducto) colorMasivo.value = colorProducto.value;
        if (cantidadMasivo && cantidadProducto) cantidadMasivo.value = cantidadProducto.value;

        clientasMasivo = [];
        actualizarListaClientasMasivo();
    }
}

function cerrarModoMasivo() {
    const modal = document.getElementById('modal-masivo');
    if (modal) modal.style.display = 'none';
    clientasMasivo = [];
}

function agregarClienteAModal() {
    const input = document.getElementById('nuevaClienteMasivo');
    if (!input) return;

    const nombre = input.value.trim();
    if (nombre && !clientasMasivo.includes(nombre)) {
        clientasMasivo.push(nombre);
        actualizarListaClientasMasivo();
        input.value = '';

        const suggestions = document.getElementById('suggestionsMasivo');
        if (suggestions) suggestions.style.display = 'none';
    }
}

function actualizarListaClientasMasivo() {
    const listaDiv = document.getElementById('listaClientasAgregadas');
    if (!listaDiv) return;

    if (clientasMasivo.length === 0) {
        listaDiv.innerHTML = `
            <div class="empty-state">
                <i data-feather="users"></i>
                <p>Las clientas aparecerán aquí...</p>
            </div>
        `;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    let html = '';
    clientasMasivo.forEach((clienta, index) => {
        html += `
            <div class="clienta-masivo-item">
                <span>${clienta}</span>
                <button onclick="removerClienteMasivo(${index})" class="btn-remove">
                    <i data-feather="x"></i>
                </button>
            </div>
        `;
    });

    listaDiv.innerHTML = html;
    if (typeof feather !== 'undefined') feather.replace();
}

function removerClienteMasivo(index) {
    clientasMasivo.splice(index, 1);
    actualizarListaClientasMasivo();
}

function procesarRegistroMasivo() {
    const colorInput = document.getElementById('colorMasivo');
    const cantidadInput = document.getElementById('cantidadMasivo');

    const color = colorInput ? colorInput.value.trim() : '';
    const cantidad = parseInt(cantidadInput ? cantidadInput.value : '1') || 1;

    if (clientasMasivo.length === 0) {
        mostrarNotificacion('Agrega al menos una clienta', 'error');
        return;
    }

    clientasMasivo.forEach(nombreClienta => {
        if (!pedidos[nombreClienta]) {
            pedidos[nombreClienta] = [];
        }

        const nuevoPedido = {
            producto: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: cantidad
        };

        if (color) {
            nuevoPedido.color = color;
        }

        pedidos[nombreClienta].push(nuevoPedido);
    });

    database.ref('pedidos').set(pedidos);

    mostrarNotificacion(`${clientasMasivo.length} clientas agregadas exitosamente`, 'success');
    cerrarModoMasivo();
    actualizarEstadisticasRapidas();
}

// ===== PWA FUNCTIONALITY ===== 
let deferredPrompt;
let isInstalled = false;

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ PWA: Service Worker registrado', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            mostrarNotificacion('Nueva versión disponible. Recarga para actualizar.', 'info');
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('❌ PWA: Error al registrar Service Worker', error);
            });
    });
}

// Detectar si la app ya está instalada
window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA: App instalada exitosamente');
    isInstalled = true;
    mostrarNotificacion('¡Ventas Mary instalada correctamente!', 'success');
    ocultarBotonInstalar();
});

// Capturar el evento de instalación
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 PWA: Prompt de instalación disponible');
    e.preventDefault();
    deferredPrompt = e;
    mostrarBotonInstalar();
});

// Función para mostrar botón de instalación
function mostrarBotonInstalar() {
    if (isInstalled) return;

    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.className = 'btn btn-primary install-btn';
    installButton.innerHTML = '<i data-feather="download"></i> Instalar App';
    installButton.onclick = instalarPWA;

    const headerContent = document.querySelector('.header-content');
    if (headerContent && !document.getElementById('install-button')) {
        headerContent.appendChild(installButton);
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Función para ocultar botón de instalación
function ocultarBotonInstalar() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.remove();
    }
}

// Función para instalar PWA
async function instalarPWA() {
    if (!deferredPrompt) {
        mostrarNotificacion('La instalación no está disponible en este momento', 'info');
        return;
    }

    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ PWA: Usuario aceptó la instalación');
            mostrarNotificacion('Instalando Ventas Mary...', 'success');
        } else {
            console.log('❌ PWA: Usuario rechazó la instalación');
        }

        deferredPrompt = null;
        ocultarBotonInstalar();
    } catch (error) {
        console.error('❌ PWA: Error durante la instalación', error);
        mostrarNotificacion('Error durante la instalación', 'error');
    }
}

// Detectar si está ejecutándose como PWA
function esPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

// Función para verificar conectividad
function verificarConectividad() {
    if (navigator.onLine) {
        console.log('🌐 Conectado a internet');
        document.body.classList.remove('offline');

        // Verificar Firebase también
        verificarFirebase();
    } else {
        console.log('📴 Sin conexión a internet');
        document.body.classList.add('offline');
        mostrarNotificacion('Sin conexión. Trabajando en modo offline.', 'warning');
    }
}

// Función para verificar Firebase
function verificarFirebase() {
    try {
        // Hacer una prueba simple de conexión a Firebase
        database.ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === true) {
                console.log('✅ Firebase conectado');
                document.body.classList.remove('firebase-offline');
            } else {
                console.log('❌ Firebase desconectado');
                document.body.classList.add('firebase-offline');
            }
        });
    } catch (error) {
        console.error('❌ Error de Firebase:', error);
        document.body.classList.add('firebase-offline');
    }
}

// Escuchar cambios de conectividad
window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    document.body.classList.remove('offline');
    // Solo mostrar notificación si estaba offline antes
    if (document.body.classList.contains('was-offline')) {
        mostrarNotificacion('Conexión restaurada', 'success');
        document.body.classList.remove('was-offline');
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Conexión perdida');
    document.body.classList.add('offline', 'was-offline');
    mostrarNotificacion('Sin conexión. Trabajando offline.', 'warning');
});

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Ventas Mary PWA...');

    // Verificar si es PWA
    if (esPWA()) {
        console.log('📱 Ejecutándose como PWA');
        document.body.classList.add('pwa-mode');
        isInstalled = true;
    }

    // Verificar conectividad inicial (sin mostrar notificación)
    setTimeout(() => {
        verificarConectividad();
    }, 2000); // Esperar 2 segundos antes de verificar

    // Cargar datos de Firebase
    cargarDatos();

    // Configurar autocompletado
    configurarAutocompletado();

    // Actualizar estadísticas iniciales
    setTimeout(() => {
        actualizarEstadisticasRapidas();
    }, 1000);

    // Inicializar iconos de Feather
    if (typeof feather !== 'undefined') {
        feather.replace();
        console.log('✅ Iconos de Feather inicializados');
    }

    // Mostrar botón de instalación si está disponible
    setTimeout(mostrarBotonInstalar, 2000);

    console.log('✅ Ventas Mary PWA inicializada correctamente');
});// ====
= RECONOCIMIENTO DE VOZ ===== 

let recognition = null;
let isListening = false;
let voiceTimeout = null;

// Verificar soporte de reconocimiento de voz
function verificarSoporteVoz() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Inicializar reconocimiento de voz
function inicializarReconocimientoVoz() {
    if (!verificarSoporteVoz()) {
        console.log('❌ Reconocimiento de voz no soportado');
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Configuración
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES'; // Español
    recognition.maxAlternatives = 1;

    // Eventos
    recognition.onstart = () => {
        console.log('🎤 Reconocimiento de voz iniciado');
        isListening = true;
        actualizarBotonVoz('listening');
        mostrarIndicadorVoz('🎤 Escuchando... Habla ahora');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🗣️ Texto reconocido:', transcript);
        procesarComandoVoz(transcript);
    };

    recognition.onerror = (event) => {
        console.error('❌ Error de reconocimiento:', event.error);
        isListening = false;
        actualizarBotonVoz('error');
        ocultarIndicadorVoz();
        
        let mensaje = 'Error de reconocimiento de voz';
        switch(event.error) {
            case 'no-speech':
                mensaje = 'No se detectó voz. Intenta de nuevo.';
                break;
            case 'audio-capture':
                mensaje = 'No se puede acceder al micrófono.';
                break;
            case 'not-allowed':
                mensaje = 'Permiso de micrófono denegado.';
                break;
            case 'network':
                mensaje = 'Error de conexión. Verifica tu internet.';
                break;
        }
        mostrarNotificacion(mensaje, 'error');
    };

    recognition.onend = () => {
        console.log('🎤 Reconocimiento de voz terminado');
        isListening = false;
        actualizarBotonVoz('normal');
        ocultarIndicadorVoz();
    };

    return recognition;
}

// Iniciar reconocimiento de voz
function iniciarReconocimientoVoz() {
    if (!verificarSoporteVoz()) {
        mostrarNotificacion('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.', 'error');
        return;
    }

    if (isListening) {
        detenerReconocimientoVoz();
        return;
    }

    if (!recognition) {
        recognition = inicializarReconocimientoVoz();
    }

    if (!recognition) {
        mostrarNotificacion('No se pudo inicializar el reconocimiento de voz', 'error');
        return;
    }

    try {
        recognition.start();
        
        // Timeout de seguridad (10 segundos)
        voiceTimeout = setTimeout(() => {
            if (isListening) {
                detenerReconocimientoVoz();
                mostrarNotificacion('Tiempo de escucha agotado. Intenta de nuevo.', 'warning');
            }
        }, 10000);
        
    } catch (error) {
        console.error('❌ Error al iniciar reconocimiento:', error);
        mostrarNotificacion('Error al iniciar reconocimiento de voz', 'error');
    }
}

// Detener reconocimiento de voz
function detenerReconocimientoVoz() {
    if (recognition && isListening) {
        recognition.stop();
    }
    if (voiceTimeout) {
        clearTimeout(voiceTimeout);
        voiceTimeout = null;
    }
}

// Procesar comando de voz
function procesarComandoVoz(texto) {
    console.log('🧠 Procesando comando:', texto);
    actualizarBotonVoz('processing');
    
    // Limpiar y normalizar texto
    const textoLimpio = texto.toLowerCase().trim();
    
    // Patrones de reconocimiento
    const patrones = {
        // Patrón: "agregar [clienta] [producto] [cantidad]"
        agregarVenta: /(?:agregar|registrar|nueva venta|anotar)\s+(.+?)(?:\s+(?:esmalte|tratamiento|producto|servicio)\s+(.+?))?(?:\s+(?:cantidad|unidades?|piezas?)\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez))?/i,
        
        // Patrón más específico: "agregar maria gonzalez esmalte rojo dos unidades"
        ventaCompleta: /(?:agregar|registrar)\s+([a-záéíóúñ\s]+?)(?:\s+(?:esmalte|tratamiento)\s+([a-záéíóúñ\s]+?))?(?:\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)(?:\s+(?:unidades?|piezas?))?)?/i
    };
    
    // Intentar reconocer el comando
    let comandoReconocido = false;
    
    // Probar patrón completo
    const matchCompleto = textoLimpio.match(patrones.ventaCompleta);
    if (matchCompleto) {
        const clienta = matchCompleto[1] ? matchCompleto[1].trim() : '';
        const producto = matchCompleto[2] ? matchCompleto[2].trim() : '';
        const cantidad = matchCompleto[3] ? convertirNumeroTexto(matchCompleto[3]) : 1;
        
        if (clienta) {
            mostrarConfirmacionVoz({
                texto: texto,
                clienta: clienta,
                producto: producto || 'Producto actual',
                cantidad: cantidad
            });
            comandoReconocido = true;
        }
    }
    
    // Si no se reconoció, mostrar opciones
    if (!comandoReconocido) {
        mostrarConfirmacionVoz({
            texto: texto,
            clienta: extraerNombreClienta(textoLimpio),
            producto: extraerProducto(textoLimpio),
            cantidad: extraerCantidad(textoLimpio)
        });
    }
    
    actualizarBotonVoz('normal');
}

// Convertir números en texto a números
function convertirNumeroTexto(texto) {
    const numeros = {
        'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10
    };
    
    const numero = parseInt(texto);
    if (!isNaN(numero)) return numero;
    
    return numeros[texto.toLowerCase()] || 1;
}

// Extraer nombre de clienta del texto
function extraerNombreClienta(texto) {
    // Buscar patrones comunes de nombres
    const patrones = [
        /(?:agregar|registrar|para)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i,
        /^([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i
    ];
    
    for (const patron of patrones) {
        const match = texto.match(patron);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return '';
}

// Extraer producto del texto
function extraerProducto(texto) {
    const productos = ['esmalte', 'tratamiento', 'manicure', 'pedicure', 'gel'];
    const colores = ['rojo', 'azul', 'rosa', 'negro', 'blanco', 'verde', 'amarillo', 'morado'];
    
    let producto = '';
    let color = '';
    
    // Buscar producto
    for (const prod of productos) {
        if (texto.includes(prod)) {
            producto = prod;
            break;
        }
    }
    
    // Buscar color
    for (const col of colores) {
        if (texto.includes(col)) {
            color = col;
            break;
        }
    }
    
    if (producto && color) {
        return `${producto} ${color}`;
    } else if (producto) {
        return producto;
    } else if (color) {
        return `esmalte ${color}`;
    }
    
    return '';
}

// Extraer cantidad del texto
function extraerCantidad(texto) {
    const match = texto.match(/(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i);
    if (match) {
        return convertirNumeroTexto(match[1]);
    }
    return 1;
}

// Mostrar confirmación de comando de voz
function mostrarConfirmacionVoz(datos) {
    const modal = document.createElement('div');
    modal.className = 'voice-confirmation';
    modal.innerHTML = `
        <h3>🎤 ¿Es esto correcto?</h3>
        <div class="recognized-text">
            <strong>Texto reconocido:</strong><br>
            "${datos.texto}"
        </div>
        <div style="text-align: left; margin: 20px 0;">
            <p><strong>Clienta:</strong> ${datos.clienta || 'No detectada'}</p>
            <p><strong>Producto:</strong> ${datos.producto || 'Usar producto actual'}</p>
            <p><strong>Cantidad:</strong> ${datos.cantidad}</p>
        </div>
        <div class="actions">
            <button onclick="confirmarComandoVoz(${JSON.stringify(datos).replace(/"/g, '&quot;')})" class="btn btn-primary">
                ✅ Confirmar
            </button>
            <button onclick="editarComandoVoz(${JSON.stringify(datos).replace(/"/g, '&quot;')})" class="btn btn-secondary">
                ✏️ Editar
            </button>
            <button onclick="cancelarComandoVoz()" class="btn btn-outline">
                ❌ Cancelar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            cancelarComandoVoz();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Confirmar comando de voz
function confirmarComandoVoz(datos) {
    if (datos.clienta) {
        // Llenar formulario automáticamente
        document.getElementById('nombreClienta').value = datos.clienta;
        
        if (datos.producto && datos.producto !== 'Producto actual') {
            // Si hay producto específico, podríamos agregarlo al nombre del producto actual
            const colorMatch = datos.producto.match(/(rojo|azul|rosa|negro|blanco|verde|amarillo|morado)/i);
            if (colorMatch) {
                document.getElementById('colorProducto').value = colorMatch[1];
            }
        }
        
        document.getElementById('cantidadProducto').value = datos.cantidad;
        
        // Agregar automáticamente
        agregarCliente();
        
        mostrarNotificacion(`✅ ${datos.clienta} agregada por voz`, 'success');
    } else {
        mostrarNotificacion('No se pudo detectar el nombre de la clienta', 'error');
    }
    
    cancelarComandoVoz();
}

// Editar comando de voz
function editarComandoVoz(datos) {
    // Llenar formulario para edición manual
    if (datos.clienta) {
        document.getElementById('nombreClienta').value = datos.clienta;
    }
    if (datos.producto && datos.producto !== 'Producto actual') {
        const colorMatch = datos.producto.match(/(rojo|azul|rosa|negro|blanco|verde|amarillo|morado)/i);
        if (colorMatch) {
            document.getElementById('colorProducto').value = colorMatch[1];
        }
    }
    document.getElementById('cantidadProducto').value = datos.cantidad;
    
    cancelarComandoVoz();
    mostrarNotificacion('Formulario llenado. Revisa y confirma los datos.', 'info');
}

// Cancelar comando de voz
function cancelarComandoVoz() {
    const modal = document.querySelector('.voice-confirmation');
    if (modal) {
        modal.remove();
    }
}

// Actualizar botón de voz
function actualizarBotonVoz(estado) {
    const btn = document.getElementById('voiceBtn');
    const text = document.getElementById('voiceBtnText');
    
    if (!btn || !text) return;
    
    btn.className = 'btn btn-voice';
    
    switch(estado) {
        case 'listening':
            btn.classList.add('listening');
            text.textContent = 'Escuchando...';
            break;
        case 'processing':
            btn.classList.add('processing');
            text.textContent = 'Procesando...';
            break;
        case 'error':
            text.textContent = 'Error';
            setTimeout(() => {
                text.textContent = 'Hablar';
            }, 2000);
            break;
        default:
            text.textContent = 'Hablar';
    }
}

// Mostrar indicador de voz
function mostrarIndicadorVoz(mensaje) {
    // Remover indicador anterior si existe
    ocultarIndicadorVoz();
    
    const indicator = document.createElement('div');
    indicator.className = 'voice-indicator';
    indicator.id = 'voiceIndicator';
    indicator.textContent = mensaje;
    
    document.body.appendChild(indicator);
}

// Ocultar indicador de voz
function ocultarIndicadorVoz() {
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Inicializar reconocimiento de voz al cargar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar soporte al cargar
    if (verificarSoporteVoz()) {
        console.log('✅ Reconocimiento de voz soportado');
        inicializarReconocimientoVoz();
    } else {
        console.log('❌ Reconocimiento de voz no soportado');
        // Ocultar botón de voz si no hay soporte
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.style.display = 'none';
        }
    }
});