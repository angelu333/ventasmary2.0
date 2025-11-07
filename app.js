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

// Cargar datos iniciales
function cargarDatos() {
    database.ref('pedidos').on('value', (snapshot) => {
        pedidos = snapshot.val() || {};
        // No mostrar resumen automáticamente
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

// Llamar a cargarDatos cuando se inicia la aplicación
cargarDatos();

// Función para actualizar estadísticas rápidas
function actualizarEstadisticasRapidas() {
    const totalVentas = calcularTotalVentas();
    const totalClientas = Object.keys(pedidos).length;
    const totalProductos = calcularTotalProductos();

    document.getElementById('quickTotalVentas').textContent = totalVentas;
    document.getElementById('quickTotalClientas').textContent = totalClientas;
    document.getElementById('quickTotalProductos').textContent = totalProductos;
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-content">
            <i data-feather="${tipo === 'error' ? 'alert-circle' : tipo === 'success' ? 'check-circle' : 'info'}"></i>
            <span>${mensaje}</span>
        </div>
    `;

    // Agregar estilos si no existen
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
            .notificacion-success { border-left-color: #4caf50; }
            .notificacion-error { border-left-color: #f44336; }
            .notificacion-info { border-left-color: #2196f3; }
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
            .notificacion-success svg { color: #4caf50; }
            .notificacion-error svg { color: #f44336; }
            .notificacion-info svg { color: #2196f3; }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notificacion);

    // Inicializar iconos
    feather.replace();

    // Mostrar notificación
    setTimeout(() => notificacion.classList.add('show'), 100);

    // Ocultar después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => document.body.removeChild(notificacion), 300);
    }, 4000);
}

// Variables para el autocompletado
let selectedSuggestionIndex = -1;
let suggestions = [];

// Función para obtener nombres de clientas de la semana actual
function obtenerNombresClientas() {
    return Object.keys(pedidos);
}

// Función para mostrar sugerencias
function mostrarSugerencias(input) {
    const suggestionsList = document.getElementById('suggestionsList');
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

    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        // Resaltar la parte que coincide
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
    document.getElementById('nombreClienta').value = nombre;
    document.getElementById('suggestionsList').style.display = 'none';
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

    // Actualizar selección visual
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    // Si se selecciona una sugerencia, actualizar el input
    if (selectedSuggestionIndex >= 0) {
        document.getElementById('nombreClienta').value = suggestions[selectedSuggestionIndex];
    }
}

// Configurar eventos del input de nombre de clienta
function configurarAutocompletado() {
    const input = document.getElementById('nombreClienta');

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
            document.getElementById('suggestionsList').style.display = 'none';
            selectedSuggestionIndex = -1;
        }
    });

    // Ocultar sugerencias cuando se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            document.getElementById('suggestionsList').style.display = 'none';
            selectedSuggestionIndex = -1;
        }
    });
}

// Configurar autocompletado cuando se carga la página
document.addEventListener('DOMContentLoaded', configurarAutocompletado);

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        if (overlay) {
            overlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    } else {
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
}

// Función auxiliar para cerrar el sidebar
function cerrarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}
function abrirModal(contenido) {
    document.getElementById('modal-contenido').innerHTML = contenido;
    document.getElementById('modal').style.display = 'block';
}
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}
function irAInicio() {
    document.getElementById('resumen').innerHTML = '';
    document.getElementById('welcomeSection').style.display = 'block';
    document.getElementById('producto-form').style.display = 'block';
    document.getElementById('cliente-form').style.display = 'none';

    // Cerrar sidebar en móvil
    cerrarSidebar();

    // Actualizar estadísticas rápidas
    actualizarEstadisticasRapidas();
}
function agregarProducto() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseInt(document.getElementById('precioProducto').value);
    if (nombre && precio > 0) {
        productoActual = { nombre: nombre, precio: precio };
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('producto-form').style.display = 'none';
        document.getElementById('cliente-form').style.display = 'block';

        // Actualizar el título del modal masivo si existe
        const modalMasivo = document.querySelector('#modal-masivo .modal-title');
        if (modalMasivo) {
            modalMasivo.textContent = `Registro Masivo - ${nombre}`;
        }
    } else {
        mostrarNotificacion('Por favor, ingrese un nombre y precio válido para el producto.', 'error');
    }
}
function agregarCliente() {
    const entrada = document.getElementById('nombreClienta').value.trim();
    if (entrada) {
        let partes = entrada.split(' ');
        let cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
        let nombreClienta;
        // Si el último elemento es un número, usarlo como cantidad (compatibilidad con versión anterior)
        if (!isNaN(partes[partes.length - 1])) {
            const cantidadTexto = parseInt(partes.pop());
            // Solo usar la cantidad del texto si no se especificó en el campo de cantidad
            if (cantidad === 1 && cantidadTexto > 1) {
                cantidad = cantidadTexto;
            }
            nombreClienta = partes.join(' ');
        } else {
            nombreClienta = entrada;
        }
        nombreClienta = nombreClienta.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (!pedidos[nombreClienta]) {
            pedidos[nombreClienta] = [];
        }
        // Obtener el color (opcional)
        const color = document.getElementById('colorProducto').value.trim();
        // Crear el objeto de pedido con los nuevos campos
        const nuevoPedido = {
            producto: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: cantidad
        };
        // Agregar el color solo si se especificó
        if (color) {
            nuevoPedido.color = color;
        }
        pedidos[nombreClienta].push(nuevoPedido);
        // Limpiar los campos
        document.getElementById('nombreClienta').value = '';
        document.getElementById('colorProducto').value = '';
        document.getElementById('cantidadProducto').value = '1';
        // Guardar en Firebase
        database.ref('pedidos').set(pedidos);

        // Mostrar notificación de éxito
        mostrarNotificacion(`${nombreClienta} agregada exitosamente`, 'success');

        // Actualizar estadísticas rápidas
        actualizarEstadisticasRapidas();
    } else {
        mostrarNotificacion('Ingrese el nombre completo de la clienta.', 'error');
    }
}
function finalizarProducto() {
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precioProducto').value = '';
    document.getElementById('welcomeSection').style.display = 'block';
    document.getElementById('producto-form').style.display = 'block';
    document.getElementById('cliente-form').style.display = 'none';

    // Limpiar campos del formulario de cliente
    document.getElementById('nombreClienta').value = '';
    document.getElementById('colorProducto').value = '';
    document.getElementById('cantidadProducto').value = '1';

    // Actualizar estadísticas
    actualizarEstadisticasRapidas();
}
// Función mostrarResumen antigua eliminada - usar la nueva versión más abajo
function abrirModalRegistrarClienta() {
    const contenido = `
        <h3>Registrar Clienta</h3>
        <input type="text" id="nombreClientaRegistro" placeholder="Nombre de la clienta">
        <input type="text" id="telefonoClientaRegistro" placeholder="Número de teléfono">
        <button onclick="registrarClienta()">Registrar</button>
    `;
    abrirModal(contenido);
}
function registrarClienta() {
    const nombre = document.getElementById('nombreClientaRegistro').value.trim();
    let telefono = document.getElementById('telefonoClientaRegistro').value.trim();
    if (nombre && telefono) {
        telefono = telefono.replace(/\D/g, '');
        clientasRegistradas[nombre] = telefono;
        database.ref('clientasRegistradas').set(clientasRegistradas);

        // Limpiar campos
        document.getElementById('nombreClientaRegistro').value = '';
        document.getElementById('telefonoClientaRegistro').value = '';

        // Mostrar mensaje de éxito
        const contenidoDiv = document.getElementById('contenidoClientas');
        contenidoDiv.innerHTML = `
            <h4>Registrar Nueva Clienta</h4>
            <p style="color: green; font-weight: bold;">¡Clienta registrada correctamente!</p>
            <input type="text" id="nombreClientaRegistro" placeholder="Nombre de la clienta">
            <input type="text" id="telefonoClientaRegistro" placeholder="Número de teléfono">
            <button onclick="registrarClienta()">Registrar</button>
        `;
    } else {
        alert('Por favor, ingrese el nombre y teléfono de la clienta.');
    }
}

// Función para abrir modal de estadísticas
function abrirModalEstadisticas() {
    const totalGanancia = calcularTotalVentas();
    const clientaTop = obtenerClientaTop();
    const productoTop = obtenerProductoTop();
    const totalProductos = calcularTotalProductos();
    const totalClientas = Object.keys(pedidos).length;

    const contenido = `
        <div class="estadisticas-container">
            <h2 style="text-align:center; margin-bottom: 25px; font-size: 2rem;">Estadísticas de Ventas</h2>
            <div style="display: flex; flex-direction: column; gap: 18px; align-items: center; margin-bottom: 30px;">
                <div class="stat-card" style="width: 100%; max-width: 400px;">
                    <div style="color: #8B4513; font-size: 1.1rem;">Ventas Totales</div>
                    <div style="font-size: 2.5rem; font-weight: bold; color: #8B4513;">$${totalGanancia}</div>
                </div>
                <div class="stat-card" style="width: 100%; max-width: 400px;">
                    <div style="color: #8B4513; font-size: 1.1rem;">Productos Vendidos</div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: #8B4513;">${totalProductos}</div>
                </div>
                <div class="stat-card" style="width: 100%; max-width: 400px;">
                    <div style="color: #8B4513; font-size: 1.1rem;">Clientas Activas</div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: #8B4513;">${totalClientas}</div>
                </div>
                <div class="stat-card" style="width: 100%; max-width: 400px;">
                    <div style="color: #8B4513; font-size: 1.1rem;">Producto Más Vendido</div>
                    <div style="font-size: 1.6rem; font-weight: bold; color: #8B4513;">${productoTop.nombre || 'N/A'}</div>
                </div>
                <div class="stat-card" style="width: 100%; max-width: 400px;">
                    <div style="color: #8B4513; font-size: 1.1rem;">Clienta Que Más Compró</div>
                    <div style="font-size: 1.6rem; font-weight: bold; color: #8B4513;">${clientaTop.nombre || 'N/A'}</div>
                    <div style="font-size: 1.2rem; color: #8B4513;">$${clientaTop.total || 0}</div>
                </div>
            </div>
            <div class="chart-container">
                <h4 style="text-align:center; margin-bottom: 10px;">Tendencia de Ventas por Semana</h4>
                <canvas id="gananciasChart"></canvas>
            </div>
        </div>
    `;
    abrirModal(contenido);
    setTimeout(() => {
        crearGraficoGanancias();
    }, 100);
}

// Función para obtener la clienta que más compró
function obtenerClientaTop() {
    let clientaTop = { nombre: null, total: 0 };

    for (let clienta in pedidos) {
        let total = 0;
        pedidos[clienta].forEach(pedido => {
            total += pedido.precio * pedido.cantidad;
        });

        if (total > clientaTop.total) {
            clientaTop = { nombre: clienta, total: total };
        }
    }

    return clientaTop;
}

// Función para obtener el producto más vendido
function obtenerProductoTop() {
    const productos = {};
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            if (!productos[pedido.producto]) productos[pedido.producto] = 0;
            productos[pedido.producto] += pedido.cantidad;
        });
    }
    let top = { nombre: null, cantidad: 0 };
    for (let nombre in productos) {
        if (productos[nombre] > top.cantidad) {
            top = { nombre, cantidad: productos[nombre] };
        }
    }
    return top;
}

// Función para obtener la semana actual
function obtenerSemanaActual() {
    const fecha = new Date();
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - fecha.getDay());
    return inicioSemana.toISOString().split('T')[0];
}

// Función para guardar ganancia semanal
function guardarGananciaSemanal() {
    const semanaActual = obtenerSemanaActual();
    const gananciaActual = calcularTotalVentas();

    historialGanancias[semanaActual] = gananciaActual;

    // Mantener solo las últimas 6 semanas
    const semanas = Object.keys(historialGanancias).sort();
    if (semanas.length > 6) {
        const semanasAEliminar = semanas.slice(0, semanas.length - 6);
        semanasAEliminar.forEach(semana => {
            delete historialGanancias[semana];
        });
    }

    database.ref('historialGanancias').set(historialGanancias);
}

// Función para crear gráfico de ganancias semanales
function crearGraficoGanancias() {
    const ctx = document.getElementById('gananciasChart');
    if (!ctx) return;

    const semanas = Object.keys(historialGanancias).sort();
    const ganancias = semanas.map(semana => historialGanancias[semana]);

    // Formatear fechas para mostrar
    const fechasFormateadas = semanas.map(semana => {
        const fecha = new Date(semana);
        return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechasFormateadas,
            datasets: [{
                label: 'Ganancia Semanal',
                data: ganancias,
                borderColor: '#FF69B4',
                backgroundColor: 'rgba(255, 105, 180, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Función combinada para gestionar clientas
function abrirModalGestionarClientas() {
    const contenido = `
        <h3>Gestionar Clientas</h3>
        <div style="margin-bottom: 20px;">
            <button onclick="mostrarFormularioRegistro()" style="margin-right: 10px;">Agregar Nueva Clienta</button>
            <button onclick="mostrarListaClientas()" style="margin-right: 10px;">Ver Todas las Clientas</button>
            <button onclick="mostrarEditarClientas()">Editar Clientas</button>
        </div>
        <div id="contenidoClientas"></div>
    `;
    abrirModal(contenido);
}

// Función para mostrar formulario de registro
function mostrarFormularioRegistro() {
    const contenidoDiv = document.getElementById('contenidoClientas');
    contenidoDiv.innerHTML = `
        <h4>Registrar Nueva Clienta</h4>
        <input type="text" id="nombreClientaRegistro" placeholder="Nombre de la clienta">
        <input type="text" id="telefonoClientaRegistro" placeholder="Número de teléfono">
        <button onclick="registrarClienta()">Registrar</button>
    `;
}

// Función para mostrar lista de clientas
function mostrarListaClientas() {
    const contenidoDiv = document.getElementById('contenidoClientas');
    const clientas = Object.keys(clientasRegistradas);

    if (clientas.length === 0) {
        contenidoDiv.innerHTML = '<h4>Lista de Clientas</h4><p>No hay clientas registradas.</p>';
    } else {
        let html = '<h4>Lista de Clientas Registradas</h4><ul>';
        clientas.forEach(clienta => {
            html += `<li><strong>${clienta}</strong> - ${clientasRegistradas[clienta]}</li>`;
        });
        html += '</ul>';
        contenidoDiv.innerHTML = html;
    }
}

// Función para mostrar opciones de edición de clientas
function mostrarEditarClientas() {
    const contenidoDiv = document.getElementById('contenidoClientas');
    const clientas = Object.keys(clientasRegistradas);

    if (clientas.length === 0) {
        contenidoDiv.innerHTML = '<h4>Editar Clientas</h4><p>No hay clientas registradas para editar.</p>';
        return;
    }

    let html = '<h4>Selecciona una clienta para editar:</h4><div style="max-height: 300px; overflow-y: auto;">';
    clientas.forEach(clienta => {
        html += `
            <div style="border: 1px solid #FFB6C1; margin: 10px 0; padding: 10px; border-radius: 5px;">
                <strong>${clienta}</strong> - ${clientasRegistradas[clienta]}
                <button onclick="editarClienta('${clienta}')" style="float: right; padding: 5px 10px; background: #FF69B4; color: white; border: none; border-radius: 3px; cursor: pointer;">Editar</button>
            </div>
        `;
    });
    html += '</div>';
    contenidoDiv.innerHTML = html;
}

// Función para editar una clienta específica
function editarClienta(nombreOriginal) {
    const contenidoDiv = document.getElementById('contenidoClientas');
    const telefono = clientasRegistradas[nombreOriginal];

    contenidoDiv.innerHTML = `
        <h4>Editar Clienta</h4>
        <p><strong>Clienta actual:</strong> ${nombreOriginal}</p>
        <input type="text" id="nuevoNombreClienta" placeholder="Nuevo nombre" value="${nombreOriginal}">
        <input type="text" id="nuevoTelefonoClienta" placeholder="Nuevo teléfono" value="${telefono}">
        <div style="margin-top: 15px;">
            <button onclick="guardarCambiosClienta('${nombreOriginal}')" style="margin-right: 10px; background: #FF69B4; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Guardar Cambios</button>
            <button onclick="mostrarEditarClientas()" style="background: #ccc; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Cancelar</button>
        </div>
    `;
}

// Función para guardar los cambios de una clienta
function guardarCambiosClienta(nombreOriginal) {
    const nuevoNombre = document.getElementById('nuevoNombreClienta').value.trim();
    let nuevoTelefono = document.getElementById('nuevoTelefonoClienta').value.trim();

    if (!nuevoNombre || !nuevoTelefono) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    nuevoTelefono = nuevoTelefono.replace(/\D/g, '');

    // Eliminar la clienta original
    delete clientasRegistradas[nombreOriginal];

    // Agregar con el nuevo nombre
    clientasRegistradas[nuevoNombre] = nuevoTelefono;

    // Guardar en Firebase
    database.ref('clientasRegistradas').set(clientasRegistradas);

    // Mostrar confirmación
    const contenidoDiv = document.getElementById('contenidoClientas');
    contenidoDiv.innerHTML = `
        <h4>Editar Clienta</h4>
        <p style="color: green; font-weight: bold;">¡Clienta actualizada correctamente!</p>
        <button onclick="mostrarEditarClientas()" style="background: #FF69B4; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Volver a la lista</button>
    `;
}

// Función para calcular total de productos
function calcularTotalProductos() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.cantidad;
        });
    }
    return total;
}

// Función para calcular total de ventas
function calcularTotalVentas() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.precio * pedido.cantidad;
        });
    }
    return total;
}

// Función para crear gráfico de ventas
function crearGraficoVentas() {
    const ctx = document.getElementById('ventasChart');
    if (!ctx) return;

    const clientas = Object.keys(pedidos);
    const totales = clientas.map(clienta => {
        let total = 0;
        pedidos[clienta].forEach(pedido => {
            total += pedido.precio * pedido.cantidad;
        });
        return total;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: clientas,
            datasets: [{
                label: 'Total por Cliente',
                data: totales,
                backgroundColor: '#FF69B4',
                borderColor: '#FF1493',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Función para buscar clienta
function abrirModalBuscarClienta() {
    const contenido = `
        <h3>Buscar y Gestionar Clienta</h3>
        <div style="margin-bottom: 20px;">
            <div class="autocomplete-container">
                <input type="text" id="buscarClientaInput" placeholder="Buscar clienta..." autocomplete="off" onkeyup="mostrarSugerenciasBusqueda(this.value)">
                <div class="suggestions-list" id="suggestionsBusqueda"></div>
            </div>
            <button onclick="buscarClienta()" style="margin-top: 10px;">Buscar</button>
        </div>
        <div id="resultadoBusqueda"></div>
    `;
    abrirModal(contenido);
}

// Función para mostrar sugerencias en la búsqueda
function mostrarSugerenciasBusqueda(input) {
    const suggestionsList = document.getElementById('suggestionsBusqueda');
    suggestionsList.innerHTML = '';

    if (!input || input.length < 1) {
        suggestionsList.style.display = 'none';
        return;
    }

    const clientas = Object.keys(pedidos);
    const sugerencias = clientas.filter(clienta =>
        clienta.toLowerCase().includes(input.toLowerCase())
    );

    if (sugerencias.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    sugerencias.forEach((sugerencia) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        // Resaltar la parte que coincide
        const regex = new RegExp(`(${input})`, 'gi');
        const highlightedText = sugerencia.replace(regex, '<span class="suggestion-highlight">$1</span>');

        item.innerHTML = highlightedText;
        item.onclick = () => seleccionarClientaBusqueda(sugerencia);
        suggestionsList.appendChild(item);
    });

    suggestionsList.style.display = 'block';
}

// Función para seleccionar una clienta de la búsqueda
function seleccionarClientaBusqueda(nombre) {
    document.getElementById('buscarClientaInput').value = nombre;
    document.getElementById('suggestionsBusqueda').style.display = 'none';
    buscarClienta();
}

// Función para buscar clienta
function buscarClienta() {
    const nombre = document.getElementById('buscarClientaInput').value.trim();
    const resultadoDiv = document.getElementById('resultadoBusqueda');

    if (!nombre) {
        resultadoDiv.innerHTML = '<p>Ingrese un nombre para buscar.</p>';
        return;
    }

    const clientasEncontradas = Object.keys(pedidos).filter(clienta =>
        clienta.toLowerCase().includes(nombre.toLowerCase())
    );

    if (clientasEncontradas.length === 0) {
        resultadoDiv.innerHTML = '<p>No se encontraron clientas con ese nombre.</p>';
        return;
    }

    if (clientasEncontradas.length === 1) {
        // Si solo hay una clienta, mostrar sus detalles directamente
        mostrarDetallesClienta(clientasEncontradas[0]);
    } else {
        // Si hay múltiples clientas, mostrar lista para seleccionar
        let html = '<h4>Clientas encontradas:</h4>';
        clientasEncontradas.forEach(clienta => {
            let total = 0;
            pedidos[clienta].forEach(pedido => {
                total += pedido.precio * pedido.cantidad;
            });
            html += `
                <div class="clienta-pedido" style="cursor: pointer;" onclick="mostrarDetallesClienta('${clienta}')">
                    <strong>${clienta}</strong> - Total: $${total}
                    <div style="color: #666; font-size: 12px;">Haz clic para ver detalles</div>
                </div>
            `;
        });
        resultadoDiv.innerHTML = html;
    }
}

// Función para mostrar detalles de una clienta específica
function mostrarDetallesClienta(nombreClienta) {
    const resultadoDiv = document.getElementById('resultadoBusqueda');
    const pedidosClienta = pedidos[nombreClienta] || [];

    let total = 0;
    let html = `
        <h4>Detalles de ${nombreClienta}</h4>
        <div style="margin-bottom: 20px;">
            <button onclick="agregarProductoAClienta('${nombreClienta}')" style="background: #FF69B4; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                + Agregar Producto
            </button>
        </div>
        <div id="productos-${nombreClienta.replace(/\s+/g, '-')}">
    `;

    if (pedidosClienta.length === 0) {
        html += '<p>Esta clienta no tiene productos registrados.</p>';
    } else {
        html += '<h5>Productos comprados:</h5>';
        pedidosClienta.forEach((pedido, index) => {
            const subtotal = pedido.precio * pedido.cantidad;
            total += subtotal;
            const colorInfo = pedido.color ? ` (${pedido.color})` : '';

            html += `
                <div class="clienta-pedido" style="margin: 10px 0; padding: 10px; border: 1px solid #FFB6C1; border-radius: 5px;">
                    <strong>${pedido.producto}${colorInfo}</strong><br>
                    Cantidad: ${pedido.cantidad} x $${pedido.precio} = $${subtotal}
                    <button onclick="eliminarProductoDeClienta('${nombreClienta}', ${index})" style="float: right; background: #FF1493; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px;">×</button>
                </div>
            `;
        });
    }

    html += `
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #FFE4E1; border-radius: 5px;">
            <strong>Total de ${nombreClienta}: $${total}</strong>
        </div>
    `;

    resultadoDiv.innerHTML = html;
}

// Función para agregar producto a una clienta
function agregarProductoAClienta(nombreClienta) {
    const resultadoDiv = document.getElementById('resultadoBusqueda');

    // Obtener lista de productos disponibles
    const productosDisponibles = new Set();
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            productosDisponibles.add(pedido.producto);
        });
    }

    const productosArray = Array.from(productosDisponibles);

    let html = `
        <h4>Agregar Producto a ${nombreClienta}</h4>
        <div style="margin-bottom: 15px;">
            <select id="productoSeleccionado" style="width: 100%; padding: 8px; border: 1px solid #FFB6C1; border-radius: 5px; margin-bottom: 10px;">
                <option value="">Selecciona un producto</option>
                ${productosArray.map(producto => `<option value="${producto}">${producto}</option>`).join('')}
            </select>
            <input type="number" id="cantidadProducto" placeholder="Cantidad" min="1" value="1" style="width: 100%; padding: 8px; border: 1px solid #FFB6C1; border-radius: 5px; margin-bottom: 10px;">
            <input type="text" id="colorProducto" placeholder="Color (opcional)" style="width: 100%; padding: 8px; border: 1px solid #FFB6C1; border-radius: 5px; margin-bottom: 10px;">
            <div style="display: flex; gap: 10px;">
                <button onclick="confirmarAgregarProducto('${nombreClienta}')" style="background: #FF69B4; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Agregar</button>
                <button onclick="mostrarDetallesClienta('${nombreClienta}')" style="background: #ccc; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; flex: 1;">Cancelar</button>
            </div>
        </div>
    `;

    resultadoDiv.innerHTML = html;
}

// Función para confirmar agregar producto
function confirmarAgregarProducto(nombreClienta) {
    const producto = document.getElementById('productoSeleccionado').value;
    const cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
    const color = document.getElementById('colorProducto').value.trim();

    if (!producto) {
        alert('Por favor, selecciona un producto.');
        return;
    }

    // Buscar el precio del producto
    let precioProducto = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            if (pedido.producto === producto) {
                precioProducto = pedido.precio;
                return;
            }
        });
        if (precioProducto > 0) break;
    }

    // Crear el nuevo pedido
    const nuevoPedido = {
        producto: producto,
        precio: precioProducto,
        cantidad: cantidad
    };

    if (color) {
        nuevoPedido.color = color;
    }

    // Agregar a la clienta
    if (!pedidos[nombreClienta]) {
        pedidos[nombreClienta] = [];
    }
    pedidos[nombreClienta].push(nuevoPedido);

    // Guardar en Firebase
    database.ref('pedidos').set(pedidos);

    // Volver a mostrar detalles
    mostrarDetallesClienta(nombreClienta);
}

// Función para eliminar producto de una clienta
function eliminarProductoDeClienta(nombreClienta, index) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        pedidos[nombreClienta].splice(index, 1);

        // Si la clienta no tiene más productos, eliminarla
        if (pedidos[nombreClienta].length === 0) {
            delete pedidos[nombreClienta];
        }

        // Guardar en Firebase
        database.ref('pedidos').set(pedidos);

        // Volver a mostrar detalles
        mostrarDetallesClienta(nombreClienta);
    }
}

// Función para ver clientas registradas
function abrirModalVerClientas() {
    const clientas = Object.keys(clientasRegistradas);
    let contenido = '<h3>Clientas Registradas</h3>';

    if (clientas.length === 0) {
        contenido += '<p>No hay clientas registradas.</p>';
    } else {
        contenido += '<ul>';
        clientas.forEach(clienta => {
            contenido += `<li><strong>${clienta}</strong> - ${clientasRegistradas[clienta]}</li>`;
        });
        contenido += '</ul>';
    }

    abrirModal(contenido);
}

// Función para ver productos y clientas
function verProductosYClientas() {
    let contenido = `
        <h3>Gestionar Productos y Clientas</h3>
        <div style="margin-bottom: 20px;">
            <input type="text" id="buscarProducto" placeholder="Buscar producto..." style="width: 100%; padding: 10px; border: 1px solid #FFB6C1; border-radius: 5px; margin-bottom: 10px;" onkeyup="filtrarProductos()">
            <div style="text-align: center; color: #666; font-size: 14px;">
                <span id="contadorProductos">0</span> productos encontrados
            </div>
        </div>
        <div id="listaProductos">
    `;

    const productos = {};

    // Agrupar productos por nombre
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            if (!productos[pedido.producto]) {
                productos[pedido.producto] = {
                    cantidad: 0,
                    total: 0,
                    clientas: [],
                    precio: pedido.precio
                };
            }
            productos[pedido.producto].cantidad += pedido.cantidad;
            productos[pedido.producto].total += pedido.precio * pedido.cantidad;
            if (!productos[pedido.producto].clientas.includes(clienta)) {
                productos[pedido.producto].clientas.push(clienta);
            }
        });
    }

    for (let producto in productos) {
        contenido += `
            <div class="clienta-pedido producto-item" data-producto="${producto.toLowerCase()}">
                <strong>${producto}</strong><br>
                Cantidad total: ${productos[producto].cantidad}<br>
                Total: $${productos[producto].total}<br>
                <div style="margin: 10px 0;">
                    <strong>Clientes:</strong>
                    <div id="clientas-${producto.replace(/\s+/g, '-')}" style="margin: 5px 0;">
                        ${productos[producto].clientas.map(clienta =>
            `<span style="display: inline-block; background: #FFE4E1; padding: 3px 8px; margin: 2px; border-radius: 3px;">
                                ${clienta}
                                <button onclick="borrarClienteDeProducto('${producto}', '${clienta}')" style="background: #FF1493; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; margin-left: 5px; cursor: pointer; font-size: 12px;">×</button>
                            </span>`
        ).join('')}
                    </div>
                    <div style="margin-top: 10px;">
                        <input type="text" id="nuevaCliente-${producto.replace(/\s+/g, '-')}" placeholder="Nombre de la nueva clienta" style="width: 60%; margin-right: 5px;">
                        <button onclick="agregarClienteAProducto('${producto}')" style="background: #FF69B4; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Agregar</button>
                    </div>
                </div>
            </div>
        `;
    }

    contenido += '</div>';
    abrirModal(contenido);

    // Actualizar contador inicial
    setTimeout(() => {
        actualizarContadorProductos();
    }, 100);
}

// Función para filtrar productos
function filtrarProductos() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const productos = document.querySelectorAll('.producto-item');
    let contador = 0;

    productos.forEach(producto => {
        const nombreProducto = producto.getAttribute('data-producto');
        if (nombreProducto.includes(busqueda)) {
            producto.style.display = 'block';
            contador++;
        } else {
            producto.style.display = 'none';
        }
    });

    actualizarContadorProductos();
}

// Función para actualizar el contador de productos
function actualizarContadorProductos() {
    const productosVisibles = document.querySelectorAll('.producto-item[style*="display: block"], .producto-item:not([style*="display: none"])');
    const contador = document.getElementById('contadorProductos');
    if (contador) {
        contador.textContent = productosVisibles.length;
    }
}

// Función para agregar una clienta a un producto
function agregarClienteAProducto(producto) {
    const inputId = `nuevaCliente-${producto.replace(/\s+/g, '-')}`;
    const nuevaCliente = document.getElementById(inputId).value.trim();

    if (!nuevaCliente) {
        alert('Por favor, ingrese el nombre de la clienta.');
        return;
    }

    // Capitalizar el nombre
    const nombreCliente = nuevaCliente.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Verificar si la clienta ya existe en el producto
    const clientasActuales = [];
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            if (pedido.producto === producto) {
                clientasActuales.push(clienta);
            }
        });
    }

    if (clientasActuales.includes(nombreCliente)) {
        alert('Esta clienta ya está registrada para este producto.');
        return;
    }

    // Agregar la nueva clienta al producto
    if (!pedidos[nombreCliente]) {
        pedidos[nombreCliente] = [];
    }

    // Buscar el precio del producto
    let precioProducto = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            if (pedido.producto === producto) {
                precioProducto = pedido.precio;
                return;
            }
        });
        if (precioProducto > 0) break;
    }

    // Agregar el pedido
    pedidos[nombreCliente].push({
        producto: producto,
        precio: precioProducto,
        cantidad: 1
    });

    // Guardar en Firebase
    database.ref('pedidos').set(pedidos);

    // Limpiar el input
    document.getElementById(inputId).value = '';

    // Actualizar la vista
    verProductosYClientas();
}

// Función para borrar una clienta de un producto
function borrarClienteDeProducto(producto, nombreCliente) {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${nombreCliente} del producto ${producto}?`)) {
        // Encontrar y eliminar todos los pedidos de este producto para esta clienta
        if (pedidos[nombreCliente]) {
            pedidos[nombreCliente] = pedidos[nombreCliente].filter(pedido => pedido.producto !== producto);

            // Si la clienta no tiene más pedidos, eliminarla completamente
            if (pedidos[nombreCliente].length === 0) {
                delete pedidos[nombreCliente];
            }
        }

        // Guardar en Firebase
        database.ref('pedidos').set(pedidos);

        // Actualizar la vista
        verProductosYClientas();
    }
}

// Función para generar PDF
function generarPDF() {
    const { jsPDF } = window.jspdf;
    // Crear el PDF en orientación horizontal (landscape)
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(20);
    doc.text('Ventas Mary - Reporte de Pedidos', 20, 20);

    // Configuración de columnas
    const columnas = 4;
    const margenIzq = 20;
    const margenSup = 30;
    const anchoCol = 70;
    const altoMax = 190;
    let col = 0;
    let y = margenSup;
    let x = margenIzq;

    const clientas = Object.keys(pedidos);
    for (let i = 0; i < clientas.length; i++) {
        const clienta = clientas[i];
        // Calcular el espacio necesario para la clienta y sus productos
        let espacioNecesario = 7 + (pedidos[clienta].length * 5.5) + 10;
        // Si no cabe en la columna actual, pasar a la siguiente columna o página
        if (y + espacioNecesario > margenSup + altoMax) {
            col++;
            if (col >= columnas) {
                doc.addPage();
                col = 0;
            }
            x = margenIzq + col * anchoCol;
            y = margenSup;
        }
        // Resaltar el nombre de la clienta con fondo amarillo (marcatexto)
        doc.setFillColor(255, 255, 102); // Amarillo claro
        doc.rect(x - 2, y - 5, anchoCol - 4, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Cliente: ${clienta}`, x, y);
        y += 7;

        let total = 0;
        pedidos[clienta].forEach(pedido => {
            const subtotal = pedido.precio * pedido.cantidad;
            total += subtotal;
            const colorInfo = pedido.color ? ` (${pedido.color})` : '';
            doc.setFontSize(9);
            doc.setTextColor(50, 50, 50);
            doc.text(`- ${pedido.producto}${colorInfo}: ${pedido.cantidad} x $${pedido.precio} = $${subtotal}`, x, y);
            y += 5.5;
        });

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Total: $${total}`, x, y);
        y += 10;
    }

    doc.save('ventas-mary-reporte.pdf');
}

// Función para confirmar reiniciar inventario
function confirmarReiniciarInventario() {
    if (confirm('¿Estás seguro de que quieres reiniciar el inventario? Esto borrará todos los pedidos actuales.')) {
        // Guardar la ganancia de la semana actual antes de reiniciar
        guardarGananciaSemanal();

        pedidos = {};
        database.ref('pedidos').set(pedidos);
        mostrarResumen();
        alert('Inventario reiniciado correctamente. La ganancia de esta semana ha sido guardada en el historial.');
    }
}

// Funciones para el modo masivo
function abrirModoMasivo() {
    const modal = document.getElementById('modal-masivo');
    const titulo = modal.querySelector('h3');
    titulo.textContent = `Registro Masivo - ${productoActual.nombre}`;
    modal.style.display = 'block';
}

function cerrarModoMasivo() {
    document.getElementById('modal-masivo').style.display = 'none';
    document.getElementById('colorMasivo').value = '';
    document.getElementById('cantidadMasivo').value = '1';
    document.getElementById('nuevaClienteMasivo').value = '';
    document.getElementById('suggestionsMasivo').style.display = 'none';

    // Limpiar variables
    clientasMasivo = [];
    selectedSuggestionIndexMasivo = -1;
    suggestionsMasivo = [];
    actualizarListaClientasMasivo();
}

// Variables para el autocompletado masivo (ya declaradas arriba)
// let clientasMasivo = []; - ya declarada en variables globales
let selectedSuggestionIndexMasivo = -1;
let suggestionsMasivo = [];

// Función para mostrar sugerencias en modo masivo
function mostrarSugerenciasMasivo(input) {
    const suggestionsList = document.getElementById('suggestionsMasivo');
    suggestionsList.innerHTML = '';

    if (!input || input.length < 1) {
        suggestionsList.style.display = 'none';
        return;
    }

    const clientas = Object.keys(pedidos);
    suggestionsMasivo = clientas.filter(clienta =>
        clienta.toLowerCase().includes(input.toLowerCase())
    );

    if (suggestionsMasivo.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    suggestionsMasivo.forEach((sugerencia) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        // Resaltar la parte que coincide
        const regex = new RegExp(`(${input})`, 'gi');
        const highlightedText = sugerencia.replace(regex, '<span class="suggestion-highlight">$1</span>');

        item.innerHTML = highlightedText;
        item.onclick = () => seleccionarClienteMasivo(sugerencia);
        suggestionsList.appendChild(item);
    });

    suggestionsList.style.display = 'block';
    selectedSuggestionIndexMasivo = -1;
}

// Función para seleccionar una clienta en modo masivo
function seleccionarClienteMasivo(nombre) {
    document.getElementById('nuevaClienteMasivo').value = nombre;
    document.getElementById('suggestionsMasivo').style.display = 'none';
    selectedSuggestionIndexMasivo = -1;
}

// Función para manejar teclado en modo masivo
function manejarTecladoMasivo(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedSuggestionIndexMasivo < suggestionsMasivo.length - 1) {
            selectedSuggestionIndexMasivo++;
            actualizarSeleccionMasivo();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedSuggestionIndexMasivo > -1) {
            selectedSuggestionIndexMasivo--;
            actualizarSeleccionMasivo();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndexMasivo >= 0) {
            seleccionarClienteMasivo(suggestionsMasivo[selectedSuggestionIndexMasivo]);
        } else {
            agregarClienteAModal();
        }
    } else if (e.key === 'Escape') {
        document.getElementById('suggestionsMasivo').style.display = 'none';
        selectedSuggestionIndexMasivo = -1;
    }
}

// Función para actualizar selección visual en modo masivo
function actualizarSeleccionMasivo() {
    const items = document.querySelectorAll('#suggestionsMasivo .suggestion-item');
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndexMasivo) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Función para agregar clienta al modal
function agregarClienteAModal() {
    const nombre = document.getElementById('nuevaClienteMasivo').value.trim();

    if (!nombre) {
        alert('Por favor, ingresa un nombre de clienta.');
        return;
    }

    // Capitalizar el nombre
    const nombreFormateado = nombre.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Verificar si ya está en la lista
    if (clientasMasivo.includes(nombreFormateado)) {
        alert('Esta clienta ya está en la lista.');
        return;
    }

    // Agregar a la lista
    clientasMasivo.push(nombreFormateado);
    actualizarListaClientasMasivo();

    // Limpiar input
    document.getElementById('nuevaClienteMasivo').value = '';
    document.getElementById('suggestionsMasivo').style.display = 'none';
}

// Función para actualizar la lista visual de clientas
function actualizarListaClientasMasivo() {
    const listaDiv = document.getElementById('listaClientasAgregadas');

    if (clientasMasivo.length === 0) {
        listaDiv.innerHTML = '<p style="color: #666; font-style: italic;">Las clientas aparecerán aquí...</p>';
        return;
    }

    let html = '';
    clientasMasivo.forEach((clienta, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; margin: 2px 0; background: white; border-radius: 3px;">
                <span>${clienta}</span>
                <button onclick="removerClienteMasivo(${index})" style="background: #FF1493; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
            </div>
        `;
    });

    listaDiv.innerHTML = html;
}

// Función para remover clienta de la lista
function removerClienteMasivo(index) {
    clientasMasivo.splice(index, 1);
    actualizarListaClientasMasivo();
}

function procesarRegistroMasivo() {
    const color = document.getElementById('colorMasivo').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadMasivo').value) || 1;

    if (clientasMasivo.length === 0) {
        alert('Por favor, agrega al menos una clienta a la lista.');
        return;
    }

    let agregadas = 0;
    let duplicadas = 0;

    clientasMasivo.forEach(nombreCliente => {
        // Verificar si ya existe este producto para esta clienta
        const yaExiste = pedidos[nombreCliente] &&
            pedidos[nombreCliente].some(pedido =>
                pedido.producto === productoActual.nombre &&
                pedido.color === color
            );

        if (yaExiste) {
            duplicadas++;
            return;
        }

        // Agregar la clienta si no existe
        if (!pedidos[nombreCliente]) {
            pedidos[nombreCliente] = [];
        }

        // Crear el pedido
        const nuevoPedido = {
            producto: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: cantidad
        };

        if (color) {
            nuevoPedido.color = color;
        }

        pedidos[nombreCliente].push(nuevoPedido);
        agregadas++;
    });

    // Guardar en Firebase
    database.ref('pedidos').set(pedidos);

    // Mostrar resultado
    let mensaje = `Se agregaron ${agregadas} clientas exitosamente.`;
    if (duplicadas > 0) {
        mensaje += `\n${duplicadas} clientas ya tenían este producto y fueron omitidas.`;
    }

    alert(mensaje);

    // Cerrar modal y limpiar
    cerrarModoMasivo();

    // Mostrar mensaje de confirmación
    const resumenDiv = document.getElementById('resumen');
    resumenDiv.innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center;">
            ✅ ${agregadas} clientas agregadas exitosamente
        </div>
    `;

    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => {
        if (resumenDiv.innerHTML.includes('agregadas exitosamente')) {
            resumenDiv.innerHTML = '';
        }
    }, 3000);
}

function abrirModalEnviarWhatsApp() {
    let html = `<h3>Enviar Totales por WhatsApp</h3>`;
    const clientas = Object.keys(clientasRegistradas);
    let hayAlMenosUna = false;
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    if (clientas.length === 0) {
        html += '<p>No hay clientas registradas con número.</p>';
    } else {
        html += '<ul style="list-style:none; padding:0;">';
        clientas.forEach(clienta => {
            const telefono = clientasRegistradas[clienta];
            const pedidosClienta = pedidos[clienta] || [];
            if (!telefono || pedidosClienta.length === 0) return;
            hayAlMenosUna = true;
            let total = 0;
            let productosTexto = '';
            pedidosClienta.forEach(pedido => {
                const subtotal = pedido.precio * pedido.cantidad;
                total += subtotal;
                const colorInfo = pedido.color ? ` (${pedido.color})` : '';
                productosTexto += `- ${pedido.cantidad}x ${pedido.producto}${colorInfo} ($${pedido.precio} c/u) = $${subtotal}\n`;
            });
            const mensaje = encodeURIComponent(
                `¡Hola ${clienta}! Soy de Ventas Mary.\n\nEstos son tus productos de la semana:\n${productosTexto}\nTotal: $${total}\n\n¡Gracias por tu compra y tu preferencia! 🤍🤲🏻`
            );
            const url = `https://wa.me/52${telefono}?text=${mensaje}`;
            html += `<li style="margin-bottom: 15px;">
                <strong>${clienta}</strong> <span style="color:#888;">(${telefono})</span><br>
                <span>Total: <b>$${total}</b></span><br>
                <a href="${url}" target="${isMobile ? '_self' : '_blank'}" style="display:inline-block; margin-top:8px; background:#25D366; color:white; padding:14px 20px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:1.1rem; width:100%; max-width:300px; text-align:center;">Enviar WhatsApp</a>
            </li>`;
        });
        html += '</ul>';
    }
    if (!hayAlMenosUna) {
        html += '<p>No hay clientas con pedidos y número registrados.</p>';
    }
    abrirModal(html);
}

// Función para mostrar resumen con nuevo diseño
function mostrarResumen() {
    const resumenDiv = document.getElementById('resumen');

    if (Object.keys(pedidos).length === 0) {
        resumenDiv.innerHTML = `
            <div class="empty-state">
                <i data-feather="shopping-bag"></i>
                <h3>No hay pedidos registrados</h3>
                <p>Comienza agregando productos y clientas</p>
            </div>
        `;
        feather.replace();
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

    // Ocultar sección de bienvenida y formularios
    document.getElementById('welcomeSection').style.display = 'none';
    document.getElementById('producto-form').style.display = 'none';
    document.getElementById('cliente-form').style.display = 'none';

    // Cerrar sidebar en móvil
    cerrarSidebar();

    // Inicializar iconos
    feather.replace();
}

// Función para calcular total de ventas
function calcularTotalVentas() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.precio * pedido.cantidad;
        });
    }
    return total;
}

// Función para calcular total de productos
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
    document.getElementById('modal-masivo').style.display = 'block';
    document.getElementById('colorMasivo').value = document.getElementById('colorProducto').value;
    document.getElementById('cantidadMasivo').value = document.getElementById('cantidadProducto').value;
    clientasMasivo = [];
    actualizarListaClientasMasivo();
}

function cerrarModoMasivo() {
    document.getElementById('modal-masivo').style.display = 'none';
    clientasMasivo = [];
}

function mostrarSugerenciasMasivo(input) {
    const suggestionsList = document.getElementById('suggestionsMasivo');
    suggestionsList.innerHTML = '';

    if (!input || input.length < 1) {
        suggestionsList.style.display = 'none';
        return;
    }

    const nombresClientas = obtenerNombresClientas();
    const sugerencias = nombresClientas.filter(nombre =>
        nombre.toLowerCase().includes(input.toLowerCase())
    );

    if (sugerencias.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    sugerencias.forEach((sugerencia) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        const regex = new RegExp(`(${input})`, 'gi');
        const highlightedText = sugerencia.replace(regex, '<span class="suggestion-highlight">$1</span>');

        item.innerHTML = highlightedText;
        item.onclick = () => {
            document.getElementById('nuevaClienteMasivo').value = sugerencia;
            suggestionsList.style.display = 'none';
        };
        suggestionsList.appendChild(item);
    });

    suggestionsList.style.display = 'block';
}

function manejarTecladoMasivo(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        agregarClienteAModal();
    }
}

function agregarClienteAModal() {
    const nombre = document.getElementById('nuevaClienteMasivo').value.trim();
    if (nombre && !clientasMasivo.includes(nombre)) {
        clientasMasivo.push(nombre);
        actualizarListaClientasMasivo();
        document.getElementById('nuevaClienteMasivo').value = '';
        document.getElementById('suggestionsMasivo').style.display = 'none';
    }
}

function actualizarListaClientasMasivo() {
    const listaDiv = document.getElementById('listaClientasAgregadas');

    if (clientasMasivo.length === 0) {
        listaDiv.innerHTML = `
            <div class="empty-state">
                <i data-feather="users"></i>
                <p>Las clientas aparecerán aquí...</p>
            </div>
        `;
        feather.replace();
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
    feather.replace();
}

function removerClienteMasivo(index) {
    clientasMasivo.splice(index, 1);
    actualizarListaClientasMasivo();
}

function procesarRegistroMasivo() {
    const color = document.getElementById('colorMasivo').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadMasivo').value) || 1;

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

    // Guardar en Firebase
    database.ref('pedidos').set(pedidos);

    mostrarNotificacion(`${clientasMasivo.length} clientas agregadas exitosamente`, 'success');
    cerrarModoMasivo();
    actualizarEstadisticasRapidas();
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    console.log('Inicializando aplicación...');
    
    // Configurar autocompletado
    configurarAutocompletado();

    // Actualizar estadísticas iniciales
    setTimeout(() => {
        actualizarEstadisticasRapidas();
    }, 1000);

    // Inicializar iconos de Feather
    if (typeof feather !== 'undefined') {
        feather.replace();
        console.log('Iconos de Feather inicializados');
    } else {
        console.error('Feather icons no está disponible');
    }
    
    console.log('Aplicación inicializada correctamente');
});