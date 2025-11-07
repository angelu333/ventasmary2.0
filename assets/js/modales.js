// ===== GESTIÓN DE MODALES Y FUNCIONES ADICIONALES =====

// Modo masivo
function abrirModoMasivo() {
    const modal = document.getElementById('modal-masivo');
    if (modal) {
        modal.style.display = 'block';
        const titulo = modal.querySelector('.modal-title');
        if (titulo && productoActual.nombre) {
            titulo.textContent = `Registro Masivo - ${productoActual.nombre}`;
        }
        
        // Limpiar campos
        const colorMasivo = document.getElementById('colorMasivo');
        const cantidadMasivo = document.getElementById('cantidadMasivo');
        if (colorMasivo) colorMasivo.value = '';
        if (cantidadMasivo) cantidadMasivo.value = '1';
        
        clientasMasivo = [];
        actualizarListaClientasMasivo();
    }
}

function cerrarModoMasivo() {
    const modal = document.getElementById('modal-masivo');
    if (modal) {
        modal.style.display = 'none';
    }
    clientasMasivo = [];
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

function agregarClienteAModal() {
    const input = document.getElementById('nuevaClienteMasivo');
    if (!input) return;
    
    const nombre = input.value.trim();
    if (nombre && !clientasMasivo.includes(nombre)) {
        const nombreFormateado = nombre.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        clientasMasivo.push(nombreFormateado);
        actualizarListaClientasMasivo();
        input.value = '';
        
        const suggestions = document.getElementById('suggestionsMasivo');
        if (suggestions) suggestions.style.display = 'none';
    }
}

function procesarRegistroMasivo() {
    const colorInput = document.getElementById('colorMasivo');
    const cantidadInput = document.getElementById('cantidadMasivo');
    
    const color = colorInput ? colorInput.value.trim() : '';
    const cantidad = cantidadInput ? parseInt(cantidadInput.value) || 1 : 1;

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
    guardarPedidos();

    mostrarNotificacion(`${clientasMasivo.length} clientas agregadas exitosamente`, 'success');
    cerrarModoMasivo();
    actualizarEstadisticasRapidas();
}

// Mostrar resumen
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

    // Ocultar sección de bienvenida y formularios
    const welcomeSection = document.getElementById('welcomeSection');
    const productoForm = document.getElementById('producto-form');
    const clienteForm = document.getElementById('cliente-form');
    
    if (welcomeSection) welcomeSection.style.display = 'none';
    if (productoForm) productoForm.style.display = 'none';
    if (clienteForm) clienteForm.style.display = 'none';

    cerrarSidebar();

    // Inicializar iconos
    if (typeof feather !== 'undefined') feather.replace();
}

// Abrir modal de estadísticas
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
        </div>
    `;
    abrirModal(contenido);
    cerrarSidebar();
}

// Gestionar clientas
function abrirModalGestionarClientas() {
    const contenido = `
        <h3>Gestionar Clientas</h3>
        <p>Funcionalidad de gestión de clientas próximamente...</p>
    `;
    abrirModal(contenido);
    cerrarSidebar();
}

// Buscar clienta
function abrirModalBuscarClienta() {
    const contenido = `
        <h3>Buscar Clienta</h3>
        <p>Funcionalidad de búsqueda próximamente...</p>
    `;
    abrirModal(contenido);
    cerrarSidebar();
}

// Ver productos y clientas
function verProductosYClientas() {
    const contenido = `
        <h3>Productos y Clientas</h3>
        <p>Vista de productos y clientas próximamente...</p>
    `;
    abrirModal(contenido);
    cerrarSidebar();
}

// Enviar por WhatsApp
function abrirModalEnviarWhatsApp() {
    const contenido = `
        <h3>Enviar por WhatsApp</h3>
        <p>Funcionalidad de WhatsApp próximamente...</p>
    `;
    abrirModal(contenido);
    cerrarSidebar();
}

// Generar PDF
function generarPDF() {
    mostrarNotificacion('Generando PDF...', 'info');
    cerrarSidebar();
}

// Reiniciar inventario
function confirmarReiniciarInventario() {
    if (confirm('¿Estás seguro de que quieres reiniciar el inventario? Esto borrará todos los pedidos actuales.')) {
        pedidos = {};
        guardarPedidos();
        mostrarNotificacion('Inventario reiniciado correctamente', 'success');
        irAInicio();
    }
    cerrarSidebar();
}