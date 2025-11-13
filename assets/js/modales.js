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
    if (Object.keys(pedidos).length === 0) {
        const contenido = `
            <div class="empty-state">
                <i data-feather="users"></i>
                <h3>No hay clientas registradas</h3>
                <p>Comienza agregando productos y clientas</p>
            </div>
        `;
        abrirModal(contenido);
        cerrarSidebar();
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    let contenido = `
        <h3 style="margin-bottom: 1.5rem;"><i data-feather="users"></i> Gestionar Clientas</h3>
        <p style="margin-bottom: 1rem; color: #7d6450;">Total de clientas: <strong>${Object.keys(pedidos).length}</strong></p>
        <div class="clientas-gestion-list">
    `;

    for (let clienta in pedidos) {
        const totalCompras = pedidos[clienta].reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const cantidadProductos = pedidos[clienta].reduce((sum, p) => sum + p.cantidad, 0);
        const clientaSafe = clienta.replace(/'/g, "\\'").replace(/"/g, '\\"');

        contenido += `
            <div class="clienta-gestion-item" onclick="editarPedidosClienta('${clientaSafe}')" style="cursor: pointer;">
                <div class="clienta-info">
                    <strong><i data-feather="user"></i> ${clienta}</strong>
                    <div class="clienta-stats">
                        <span><i data-feather="package"></i> <strong>${cantidadProductos}</strong> productos</span>
                        <span><i data-feather="dollar-sign"></i> <strong>$${totalCompras}</strong></span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="event.stopPropagation(); eliminarClienta('${clientaSafe}')" class="btn btn-danger btn-small">
                        <i data-feather="trash-2"></i>
                    </button>
                    <button onclick="event.stopPropagation(); editarPedidosClienta('${clientaSafe}')" class="btn btn-primary btn-small">
                        <i data-feather="edit-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    contenido += `</div>`;
    abrirModal(contenido);
    cerrarSidebar();
    if (typeof feather !== 'undefined') feather.replace();
}

function eliminarClienta(nombre) {
    if (confirm(`¿Estás seguro de eliminar a ${nombre} y todos sus pedidos?`)) {
        delete pedidos[nombre];
        guardarPedidos();
        mostrarNotificacion(`${nombre} eliminada correctamente`, 'success');
        abrirModalGestionarClientas();
    }
}

// Editar pedidos de clienta
function editarPedidosClienta(nombreClienta) {
    const pedidosClienta = pedidos[nombreClienta];
    const totalCompras = pedidosClienta.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    let contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="user"></i> ${nombreClienta}</h3>
        <div style="background: #f9f1e8; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
            <p style="margin: 0; color: #7d6450;">Total: <strong>$${totalCompras}</strong> • ${pedidosClienta.length} pedidos</p>
        </div>
        <div class="pedidos-editar-list">
    `;

    pedidosClienta.forEach((pedido, index) => {
        const subtotal = pedido.precio * pedido.cantidad;
        const colorInfo = pedido.color ? ` <span class="color-tag">${pedido.color}</span>` : '';
        const clientaSafe = nombreClienta.replace(/'/g, "\\'").replace(/"/g, '\\"');

        contenido += `
            <div class="pedido-editar-item">
                <div class="pedido-editar-info">
                    <strong><i data-feather="package"></i> ${pedido.producto}</strong>${colorInfo}
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: #7d6450;">
                        <span>Cantidad: <strong>${pedido.cantidad}</strong></span>
                        <span>Precio: <strong>$${pedido.precio}</strong></span>
                        <span>Subtotal: <strong>$${subtotal}</strong></span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editarPedidoIndividual('${clientaSafe}', ${index})" class="btn btn-secondary btn-small">
                        <i data-feather="edit-2"></i>
                    </button>
                    <button onclick="eliminarPedidoIndividual('${clientaSafe}', ${index})" class="btn btn-danger btn-small">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    });

    contenido += `
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #f0e6d6;">
            <button onclick="agregarPedidoAClienta('${nombreClienta.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" class="btn btn-primary btn-large" style="width: 100%;">
                <i data-feather="plus"></i> Agregar Nuevo Producto
            </button>
        </div>
    `;

    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
}

// Eliminar pedido individual
function eliminarPedidoIndividual(nombreClienta, index) {
    if (confirm('¿Eliminar este pedido?')) {
        pedidos[nombreClienta].splice(index, 1);

        // Si no quedan pedidos, eliminar clienta
        if (pedidos[nombreClienta].length === 0) {
            delete pedidos[nombreClienta];
            guardarPedidos();
            mostrarNotificacion('Pedido eliminado. Clienta sin pedidos fue eliminada.', 'success');
            abrirModalGestionarClientas();
        } else {
            guardarPedidos();
            mostrarNotificacion('Pedido eliminado', 'success');
            editarPedidosClienta(nombreClienta);
        }
    }
}

// Editar pedido individual
function editarPedidoIndividual(nombreClienta, index) {
    const pedido = pedidos[nombreClienta][index];

    const contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="edit-2"></i> Editar Pedido</h3>
        <p style="margin-bottom: 1rem; color: #7d6450;"><strong>${nombreClienta}</strong> - ${pedido.producto}</p>
        <div class="input-group">
            <label class="input-label">Producto</label>
            <input type="text" id="editProducto" class="form-input" value="${pedido.producto}">
        </div>
        <div class="form-row">
            <div class="input-group">
                <label class="input-label">Precio</label>
                <input type="number" id="editPrecio" class="form-input" value="${pedido.precio}" min="0">
            </div>
            <div class="input-group">
                <label class="input-label">Cantidad</label>
                <input type="number" id="editCantidad" class="form-input" value="${pedido.cantidad}" min="1">
            </div>
        </div>
        <div class="input-group">
            <label class="input-label">Color (Opcional)</label>
            <input type="text" id="editColor" class="form-input" value="${pedido.color || ''}" placeholder="Color">
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
            <button onclick="guardarEdicionPedido('${nombreClienta.replace(/'/g, "\\'").replace(/"/g, '\\"')}', ${index})" class="btn btn-primary btn-large" style="flex: 1;">
                <i data-feather="check"></i> Guardar
            </button>
            <button onclick="editarPedidosClienta('${nombreClienta.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" class="btn btn-outline btn-large" style="flex: 1;">
                <i data-feather="x"></i> Cancelar
            </button>
        </div>
    `;

    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
}

// Guardar edición de pedido
function guardarEdicionPedido(nombreClienta, index) {
    const producto = document.getElementById('editProducto').value.trim();
    const precio = parseInt(document.getElementById('editPrecio').value) || 0;
    const cantidad = parseInt(document.getElementById('editCantidad').value) || 1;
    const color = document.getElementById('editColor').value.trim();

    if (!producto || precio <= 0) {
        mostrarNotificacion('Completa todos los campos correctamente', 'error');
        return;
    }

    pedidos[nombreClienta][index] = {
        producto: producto,
        precio: precio,
        cantidad: cantidad
    };

    if (color) {
        pedidos[nombreClienta][index].color = color;
    }

    guardarPedidos();
    mostrarNotificacion('Pedido actualizado', 'success');
    editarPedidosClienta(nombreClienta);
}

// Agregar pedido a clienta existente
function agregarPedidoAClienta(nombreClienta) {
    const contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="plus"></i> Agregar Producto</h3>
        <p style="margin-bottom: 1rem; color: #7d6450;">Clienta: <strong>${nombreClienta}</strong></p>
        <div class="input-group">
            <label class="input-label">Producto</label>
            <input type="text" id="nuevoProducto" class="form-input" placeholder="Nombre del producto">
        </div>
        <div class="form-row">
            <div class="input-group">
                <label class="input-label">Precio</label>
                <input type="number" id="nuevoPrecio" class="form-input" placeholder="0" min="0">
            </div>
            <div class="input-group">
                <label class="input-label">Cantidad</label>
                <input type="number" id="nuevaCantidad" class="form-input" value="1" min="1">
            </div>
        </div>
        <div class="input-group">
            <label class="input-label">Color (Opcional)</label>
            <input type="text" id="nuevoColor" class="form-input" placeholder="Color">
        </div>
        <div style="margin-top: 1.5rem;">
            <button onclick="confirmarAgregarPedido('${nombreClienta.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" class="btn btn-primary btn-large" style="width: 100%;">
                <i data-feather="check"></i> Agregar
            </button>
        </div>
    `;

    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
    setTimeout(() => document.getElementById('nuevoProducto').focus(), 100);
}

// Confirmar agregar pedido
function confirmarAgregarPedido(nombreClienta) {
    const producto = document.getElementById('nuevoProducto').value.trim();
    const precio = parseInt(document.getElementById('nuevoPrecio').value) || 0;
    const cantidad = parseInt(document.getElementById('nuevaCantidad').value) || 1;
    const color = document.getElementById('nuevoColor').value.trim();

    if (!producto || precio <= 0) {
        mostrarNotificacion('Completa todos los campos correctamente', 'error');
        return;
    }

    const nuevoPedido = {
        producto: producto,
        precio: precio,
        cantidad: cantidad
    };

    if (color) {
        nuevoPedido.color = color;
    }

    pedidos[nombreClienta].push(nuevoPedido);
    guardarPedidos();
    mostrarNotificacion('Producto agregado', 'success');
    editarPedidosClienta(nombreClienta);
}

// Buscar clienta
function abrirModalBuscarClienta() {
    const contenido = `
        <h3><i data-feather="search"></i> Buscar Clienta</h3>
        <div class="buscar-clienta-container">
            <div class="input-group">
                <input type="text" id="buscarClientaInput" class="form-input" placeholder="Escribe el nombre de la clienta..." onkeyup="buscarClientaEnTiempoReal(this.value)">
            </div>
            <div id="resultadosBusqueda" class="resultados-busqueda"></div>
        </div>
    `;
    abrirModal(contenido);
    cerrarSidebar();
    if (typeof feather !== 'undefined') feather.replace();

    setTimeout(() => {
        document.getElementById('buscarClientaInput').focus();
    }, 100);
}

function buscarClientaEnTiempoReal(query) {
    const resultadosDiv = document.getElementById('resultadosBusqueda');
    if (!resultadosDiv) return;

    if (!query.trim()) {
        resultadosDiv.innerHTML = '<p style="text-align:center; color:#999;">Escribe para buscar...</p>';
        return;
    }

    const queryLower = query.toLowerCase();
    const resultados = Object.keys(pedidos).filter(clienta =>
        clienta.toLowerCase().includes(queryLower)
    );

    if (resultados.length === 0) {
        resultadosDiv.innerHTML = `
            <div class="empty-state">
                <i data-feather="search"></i>
                <p>No se encontraron clientas con "${query}"</p>
            </div>
        `;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    let html = '<div class="clientas-encontradas">';
    resultados.forEach(clienta => {
        const totalCompras = pedidos[clienta].reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const cantidadProductos = pedidos[clienta].reduce((sum, p) => sum + p.cantidad, 0);
        const clientaSafe = clienta.replace(/'/g, "\\'").replace(/"/g, '\\"');

        html += `
            <div class="clienta-resultado">
                <div class="clienta-info">
                    <strong><i data-feather="user"></i> ${clienta}</strong>
                    <div class="clienta-stats">
                        <span><i data-feather="package"></i> ${cantidadProductos} productos</span>
                        <span><i data-feather="dollar-sign"></i> ${totalCompras}</span>
                    </div>
                </div>
                <button onclick="verDetalleClienta('${clientaSafe}')" class="btn btn-primary btn-small">
                    <i data-feather="eye"></i> Ver Detalle
                </button>
            </div>
        `;
    });
    html += '</div>';

    resultadosDiv.innerHTML = html;
    if (typeof feather !== 'undefined') feather.replace();
}

function verDetalleClienta(nombre) {
    const pedidosClienta = pedidos[nombre];
    const totalCompras = pedidosClienta.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    let contenido = `
        <h3><i data-feather="user"></i> ${nombre}</h3>
        <div class="detalle-clienta">
            <div class="stat-card">
                <div>Total Comprado</div>
                <div style="font-size: 2rem; font-weight: bold; color: #8B4513;">${totalCompras}</div>
            </div>
            <h4>Pedidos:</h4>
            <ul class="pedidos-list">
    `;

    pedidosClienta.forEach(pedido => {
        const subtotal = pedido.precio * pedido.cantidad;
        const colorInfo = pedido.color ? ` <span class="color-tag">${pedido.color}</span>` : '';
        contenido += `
            <li class="pedido-item">
                <span class="producto-info">
                    <i data-feather="package"></i>
                    ${pedido.producto}${colorInfo}
                </span>
                <span class="cantidad-info">${pedido.cantidad} x ${pedido.precio}</span>
                <span class="subtotal-info">${subtotal}</span>
            </li>
        `;
    });

    contenido += `
            </ul>
        </div>
    `;

    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
}

// Ver productos y clientas
function verProductosYClientas() {
    if (Object.keys(pedidos).length === 0) {
        const contenido = `
            <div class="empty-state">
                <i data-feather="package"></i>
                <h3>No hay productos registrados</h3>
                <p>Comienza agregando productos y clientas</p>
            </div>
        `;
        abrirModal(contenido);
        cerrarSidebar();
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    // Agrupar por producto
    const productosPorNombre = {};
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            const key = pedido.producto;
            if (!productosPorNombre[key]) {
                productosPorNombre[key] = {
                    nombre: pedido.producto,
                    precio: pedido.precio,
                    cantidad: 0,
                    total: 0,
                    clientas: []
                };
            }
            productosPorNombre[key].cantidad += pedido.cantidad;
            productosPorNombre[key].total += pedido.precio * pedido.cantidad;
            if (!productosPorNombre[key].clientas.includes(clienta)) {
                productosPorNombre[key].clientas.push(clienta);
            }
        });
    }

    let contenido = `
        <h3 style="margin-bottom: 1.5rem;"><i data-feather="package"></i> Productos Vendidos</h3>
        <div class="productos-list">
    `;

    for (let key in productosPorNombre) {
        const prod = productosPorNombre[key];
        const productoSafe = prod.nombre.replace(/'/g, "\\'").replace(/"/g, '\\"');
        contenido += `
            <div class="producto-card" onclick="verDetalleProducto('${productoSafe}')" style="cursor: pointer;">
                <div class="producto-header">
                    <strong><i data-feather="tag"></i> ${prod.nombre}</strong>
                    <span class="precio-tag">$${prod.precio}</span>
                </div>
                <div class="producto-stats">
                    <div class="stat-item">
                        <i data-feather="hash"></i>
                        <span><strong>${prod.cantidad}</strong> vendidos</span>
                    </div>
                    <div class="stat-item">
                        <i data-feather="users"></i>
                        <span><strong>${prod.clientas.length}</strong> clientas</span>
                    </div>
                    <div class="stat-item">
                        <i data-feather="dollar-sign"></i>
                        <span>Total: <strong>$${prod.total}</strong></span>
                    </div>
                </div>
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f0e6d6; text-align: center; color: #b8a082; font-size: 0.875rem;">
                    <i data-feather="eye"></i> Click para ver detalles
                </div>
            </div>
        `;
    }

    contenido += `</div>`;
    abrirModal(contenido);
    cerrarSidebar();
    if (typeof feather !== 'undefined') feather.replace();
}

// Ver detalle de producto
function verDetalleProducto(nombreProducto) {
    const clientasConProducto = [];

    for (let clienta in pedidos) {
        pedidos[clienta].forEach((pedido, index) => {
            if (pedido.producto === nombreProducto) {
                clientasConProducto.push({
                    nombre: clienta,
                    pedido: pedido,
                    index: index
                });
            }
        });
    }

    let contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="tag"></i> ${nombreProducto}</h3>
        <p style="margin-bottom: 1.5rem; color: #7d6450;">Clientas que ordenaron este producto:</p>
        <div class="clientas-producto-list">
    `;

    clientasConProducto.forEach(item => {
        const clientaSafe = item.nombre.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const colorInfo = item.pedido.color ? ` <span class="color-tag">${item.pedido.color}</span>` : '';
        const subtotal = item.pedido.precio * item.pedido.cantidad;

        contenido += `
            <div class="clienta-producto-item">
                <div class="clienta-producto-info">
                    <strong><i data-feather="user"></i> ${item.nombre}</strong>
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: #7d6450;">
                        <span>Cantidad: <strong>${item.pedido.cantidad}</strong></span>
                        ${colorInfo}
                        <span>Subtotal: <strong>$${subtotal}</strong></span>
                    </div>
                </div>
                <button onclick="eliminarPedidoProducto('${clientaSafe}', ${item.index})" class="btn btn-danger btn-small">
                    <i data-feather="trash-2"></i> Eliminar
                </button>
            </div>
        `;
    });

    contenido += `
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #f0e6d6;">
            <button onclick="agregarClientaAProducto('${nombreProducto.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" class="btn btn-primary btn-large" style="width: 100%;">
                <i data-feather="user-plus"></i> Agregar Clienta a este Producto
            </button>
        </div>
    `;

    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
}

// Agregar clienta a producto existente
function agregarClientaAProducto(nombreProducto) {
    const contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="user-plus"></i> Agregar Clienta</h3>
        <p style="margin-bottom: 1rem; color: #7d6450;">Producto: <strong>${nombreProducto}</strong></p>
        <div class="input-group">
            <label class="input-label">Nombre de la Clienta</label>
            <input type="text" id="nombreClientaNueva" class="form-input" placeholder="Nombre de la clienta">
        </div>
        <div class="form-row">
            <div class="input-group">
                <label class="input-label">Color (Opcional)</label>
                <input type="text" id="colorNuevo" class="form-input" placeholder="Color">
            </div>
            <div class="input-group">
                <label class="input-label">Cantidad</label>
                <input type="number" id="cantidadNueva" class="form-input" value="1" min="1">
            </div>
        </div>
        <div style="margin-top: 1.5rem;">
            <button onclick="confirmarAgregarClientaAProducto('${nombreProducto.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" class="btn btn-primary btn-large" style="width: 100%;">
                <i data-feather="check"></i> Agregar
            </button>
        </div>
    `;
    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
    setTimeout(() => document.getElementById('nombreClientaNueva').focus(), 100);
}

// Confirmar agregar clienta a producto
function confirmarAgregarClientaAProducto(nombreProducto) {
    const nombre = document.getElementById('nombreClientaNueva').value.trim();
    const color = document.getElementById('colorNuevo').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadNueva').value) || 1;

    if (!nombre) {
        mostrarNotificacion('Ingresa el nombre de la clienta', 'error');
        return;
    }

    // Capitalizar nombre
    const nombreFormateado = nombre.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Buscar el precio del producto
    let precio = 15; // Precio por defecto
    for (let clienta in pedidos) {
        const pedido = pedidos[clienta].find(p => p.producto === nombreProducto);
        if (pedido) {
            precio = pedido.precio;
            break;
        }
    }

    // Agregar pedido
    if (!pedidos[nombreFormateado]) {
        pedidos[nombreFormateado] = [];
    }

    const nuevoPedido = {
        producto: nombreProducto,
        precio: precio,
        cantidad: cantidad
    };

    if (color) {
        nuevoPedido.color = color;
    }

    pedidos[nombreFormateado].push(nuevoPedido);
    guardarPedidos();

    mostrarNotificacion(`${nombreFormateado} agregada a ${nombreProducto}`, 'success');
    verDetalleProducto(nombreProducto);
}

// Eliminar pedido de producto
function eliminarPedidoProducto(nombreClienta, index) {
    if (confirm(`¿Eliminar este pedido de ${nombreClienta}?`)) {
        pedidos[nombreClienta].splice(index, 1);

        // Si la clienta no tiene más pedidos, eliminarla
        if (pedidos[nombreClienta].length === 0) {
            delete pedidos[nombreClienta];
        }

        guardarPedidos();
        mostrarNotificacion('Pedido eliminado', 'success');
        verProductosYClientas();
    }
}

// Enviar por WhatsApp
function abrirModalEnviarWhatsApp() {
    if (Object.keys(pedidos).length === 0) {
        const contenido = `
            <div class="empty-state">
                <i data-feather="message-circle"></i>
                <h3>No hay pedidos para enviar</h3>
                <p>Comienza agregando productos y clientas</p>
            </div>
        `;
        abrirModal(contenido);
        cerrarSidebar();
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    const totalVentas = calcularTotalVentas();
    const totalClientas = Object.keys(pedidos).length;

    const contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="message-circle"></i> Enviar por WhatsApp</h3>
        <div class="whatsapp-container">
            <div style="background: #f9f1e8; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; color: #7d6450;"><strong>${totalClientas}</strong> clientas • Total: <strong>$${totalVentas}</strong></p>
            </div>
            <p style="font-weight: 500;">Selecciona qué enviar:</p>
            <div class="whatsapp-options">
                <button onclick="enviarResumenCompleto()" class="btn btn-primary btn-large">
                    <i data-feather="send"></i>
                    Enviar Resumen Completo
                </button>
                <button onclick="enviarPorClienta()" class="btn btn-secondary btn-large">
                    <i data-feather="user"></i>
                    Enviar a Clienta Específica
                </button>
            </div>
        </div>
    `;
    abrirModal(contenido);
    cerrarSidebar();
    if (typeof feather !== 'undefined') feather.replace();
}

function enviarResumenCompleto() {
    let mensaje = '🌟 *RESUMEN DE VENTAS - VENTAS MARY* 🌟\n\n';
    let totalGeneral = 0;

    for (let clienta in pedidos) {
        let totalClienta = 0;
        mensaje += `👤 *${clienta}*\n`;

        pedidos[clienta].forEach(pedido => {
            const subtotal = pedido.precio * pedido.cantidad;
            totalClienta += subtotal;
            const colorInfo = pedido.color ? ` (${pedido.color})` : '';
            mensaje += `   • ${pedido.producto}${colorInfo} - ${pedido.cantidad} x $${pedido.precio} = $${subtotal}\n`;
        });

        mensaje += `   💰 Subtotal: $${totalClienta}\n\n`;
        totalGeneral += totalClienta;
    }

    mensaje += `━━━━━━━━━━━━━━━━\n`;
    mensaje += `💵 *TOTAL GENERAL: $${totalGeneral}*\n`;
    mensaje += `📦 Total Productos: ${calcularTotalProductos()}\n`;
    mensaje += `👥 Total Clientas: ${Object.keys(pedidos).length}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    cerrarModal();
}

function enviarPorClienta() {
    let contenido = `
        <h3 style="margin-bottom: 1.5rem;"><i data-feather="user"></i> Selecciona una Clienta</h3>
        <div class="clientas-whatsapp-list">
    `;

    for (let clienta in pedidos) {
        const clientaSafe = clienta.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const totalClienta = pedidos[clienta].reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const cantidadProductos = pedidos[clienta].reduce((sum, p) => sum + p.cantidad, 0);

        contenido += `
            <button onclick="enviarMensajeClienta('${clientaSafe}')" class="btn btn-outline btn-large" style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <i data-feather="message-circle"></i>
                    ${clienta}
                </span>
                <span style="font-size: 0.875rem; color: #9d8066;">
                    ${cantidadProductos} productos • $${totalClienta}
                </span>
            </button>
        `;
    }

    contenido += `</div>`;
    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
}

function enviarMensajeClienta(nombre) {
    let mensaje = `🌟 *RESUMEN DE COMPRA* 🌟\n\n`;
    mensaje += `Hola *${nombre}*! 👋\n\n`;
    mensaje += `Aquí está el detalle de tu compra:\n\n`;

    let total = 0;
    pedidos[nombre].forEach(pedido => {
        const subtotal = pedido.precio * pedido.cantidad;
        total += subtotal;
        const colorInfo = pedido.color ? ` (${pedido.color})` : '';
        mensaje += `• ${pedido.producto}${colorInfo}\n`;
        mensaje += `  ${pedido.cantidad} x $${pedido.precio} = $${subtotal}\n\n`;
    });

    mensaje += `━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL: $${total}*\n\n`;
    mensaje += `¡Gracias por tu compra! 💅✨`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    cerrarModal();
}

// Generar PDF
function generarPDF() {
    if (Object.keys(pedidos).length === 0) {
        mostrarNotificacion('No hay pedidos para generar PDF', 'error');
        cerrarSidebar();
        return;
    }

    mostrarNotificacion('Generando PDF...', 'info');
    cerrarSidebar();

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Título
        doc.setFontSize(20);
        doc.setTextColor(139, 69, 19);
        doc.text('VENTAS MARY', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text('Resumen de Ventas', 105, 30, { align: 'center' });

        // Fecha
        doc.setFontSize(10);
        doc.setTextColor(100);
        const fecha = new Date().toLocaleDateString('es-ES');
        doc.text(`Fecha: ${fecha}`, 20, 40);

        let y = 50;
        let totalGeneral = 0;

        doc.setFontSize(12);
        doc.setTextColor(0);

        for (let clienta in pedidos) {
            // Verificar si necesitamos nueva página
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            // Nombre de clienta
            doc.setFont(undefined, 'bold');
            doc.text(clienta, 20, y);
            y += 7;

            let totalClienta = 0;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);

            pedidos[clienta].forEach(pedido => {
                const subtotal = pedido.precio * pedido.cantidad;
                totalClienta += subtotal;
                const colorInfo = pedido.color ? ` (${pedido.color})` : '';
                const linea = `  ${pedido.producto}${colorInfo} - ${pedido.cantidad} x $${pedido.precio} = $${subtotal}`;
                doc.text(linea, 25, y);
                y += 6;
            });

            doc.setFont(undefined, 'bold');
            doc.text(`  Subtotal: $${totalClienta}`, 25, y);
            y += 10;

            totalGeneral += totalClienta;
            doc.setFont(undefined, 'normal');
        }

        // Total general
        y += 5;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(139, 69, 19);
        doc.text(`TOTAL GENERAL: $${totalGeneral}`, 105, y, { align: 'center' });

        // Estadísticas
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Total Productos: ${calcularTotalProductos()}`, 105, y, { align: 'center' });
        y += 5;
        doc.text(`Total Clientas: ${Object.keys(pedidos).length}`, 105, y, { align: 'center' });

        // Guardar PDF
        doc.save(`ventas-mary-${fecha}.pdf`);
        mostrarNotificacion('PDF generado correctamente', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarNotificacion('Error al generar PDF', 'error');
    }
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


// Generar PDF
function generarPDF() {
    if (Object.keys(pedidos).length === 0) {
        mostrarNotificacion('No hay pedidos para generar PDF', 'error');
        cerrarSidebar();
        return;
    }

    mostrarNotificacion('Generando PDF...', 'info');
    cerrarSidebar();

    try {
        const { jsPDF } = window.jspdf;
        // Formato horizontal (landscape)
        const doc = new jsPDF('landscape', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Título
        doc.setFontSize(18);
        doc.setTextColor(139, 69, 19);
        doc.text('VENTAS MARY', pageWidth / 2, 15, { align: 'center' });

        // Fecha
        doc.setFontSize(9);
        doc.setTextColor(100);
        const fecha = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Fecha: ${fecha}`, pageWidth / 2, 22, { align: 'center' });

        let y = 32;
        const lineHeight = 5;
        const clientaSpacing = 3;
        const maxY = pageHeight - margin;

        doc.setFontSize(9);
        doc.setTextColor(0);

        // Calcular espacio necesario para cada clienta
        function calcularAlturaClienta(clienta) {
            const numPedidos = pedidos[clienta].length;
            return lineHeight + (numPedidos * lineHeight) + lineHeight + clientaSpacing;
        }

        for (let clienta in pedidos) {
            const alturaClienta = calcularAlturaClienta(clienta);

            // Si no cabe en la página actual, crear nueva página
            if (y + alturaClienta > maxY) {
                doc.addPage();
                y = margin;
            }

            // Nombre de clienta con fondo
            doc.setFillColor(244, 228, 209);
            doc.rect(margin, y - 4, contentWidth, lineHeight + 2, 'F');
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text(clienta, margin + 3, y);
            y += lineHeight + 1;

            let totalClienta = 0;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);

            // Pedidos de la clienta
            pedidos[clienta].forEach(pedido => {
                const subtotal = pedido.precio * pedido.cantidad;
                totalClienta += subtotal;
                const colorInfo = pedido.color ? ` (${pedido.color})` : '';

                // Producto
                doc.text(`${pedido.producto}${colorInfo}`, margin + 5, y);

                // Cantidad
                doc.text(`${pedido.cantidad} x $${pedido.precio}`, margin + 120, y);

                // Subtotal
                doc.setFont(undefined, 'bold');
                doc.text(`$${subtotal}`, margin + 160, y, { align: 'right' });
                doc.setFont(undefined, 'normal');

                y += lineHeight;
            });

            // Subtotal de clienta
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text(`Subtotal: $${totalClienta}`, margin + 160, y, { align: 'right' });
            y += lineHeight + clientaSpacing;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
        }

        // Guardar PDF
        const nombreArchivo = `ventas-mary-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        mostrarNotificacion('PDF generado correctamente', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarNotificacion('Error al generar PDF', 'error');
    }
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


// Generar PDF con diseño en columnas
function generarPDF() {
    if (Object.keys(pedidos).length === 0) {
        mostrarNotificacion('No hay pedidos para generar PDF', 'error');
        cerrarSidebar();
        return;
    }

    mostrarNotificacion('Generando PDF...', 'info');
    cerrarSidebar();

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const numColumns = 4; // 4 columnas
        const columnWidth = (pageWidth - (margin * 2) - (3 * 3)) / numColumns; // 3mm de espacio entre columnas
        const maxY = pageHeight - margin;
        
        // Título
        doc.setFontSize(16);
        doc.setTextColor(139, 69, 19);
        doc.text('Ventas Mary - Reporte de Pedidos', pageWidth / 2, margin + 5, { align: 'center' });
        
        // Fecha
        doc.setFontSize(8);
        doc.setTextColor(100);
        const fecha = new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(`Fecha: ${fecha}`, pageWidth / 2, margin + 10, { align: 'center' });

        // Preparar datos de clientas
        const clientasArray = [];
        for (let clienta in pedidos) {
            const pedidosClienta = pedidos[clienta];
            const totalClienta = pedidosClienta.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
            
            clientasArray.push({
                nombre: clienta,
                pedidos: pedidosClienta,
                total: totalClienta
            });
        }

        // Calcular altura de cada clienta
        function calcularAlturaClienta(clientaData) {
            const headerHeight = 6;
            const pedidoHeight = 3.5;
            const totalHeight = 4;
            const padding = 2;
            return headerHeight + (clientaData.pedidos.length * pedidoHeight) + totalHeight + padding;
        }

        let currentColumn = 0;
        let currentY = margin + 15;
        let clientaIndex = 0;

        while (clientaIndex < clientasArray.length) {
            const clientaData = clientasArray[clientaIndex];
            const alturaClienta = calcularAlturaClienta(clientaData);
            
            // Calcular posición X de la columna actual
            const columnX = margin + (currentColumn * (columnWidth + 3));
            
            // Si no cabe en la columna actual, pasar a la siguiente
            if (currentY + alturaClienta > maxY) {
                currentColumn++;
                currentY = margin + 15;
                
                // Si ya no hay más columnas, crear nueva página
                if (currentColumn >= numColumns) {
                    doc.addPage();
                    currentColumn = 0;
                    currentY = margin;
                }
                continue; // Volver a intentar con la nueva posición
            }

            // Dibujar fondo amarillo para el nombre de la clienta
            doc.setFillColor(255, 255, 153); // Amarillo suave
            doc.rect(columnX, currentY, columnWidth, 5, 'F');
            
            // Nombre de la clienta
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0);
            doc.text(`Cliente: ${clientaData.nombre}`, columnX + 1, currentY + 3.5);
            currentY += 6;

            // Pedidos
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(50);
            
            clientaData.pedidos.forEach(pedido => {
                const colorInfo = pedido.color ? ` (${pedido.color})` : '';
                const subtotal = pedido.precio * pedido.cantidad;
                const linea = `- ${pedido.producto}${colorInfo}: ${pedido.cantidad} x $${pedido.precio} = $${subtotal}`;
                
                // Dividir texto si es muy largo
                const lines = doc.splitTextToSize(linea, columnWidth - 2);
                lines.forEach(line => {
                    doc.text(line, columnX + 1, currentY);
                    currentY += 3.5;
                });
            });

            // Total de la clienta
            doc.setFont(undefined, 'bold');
            doc.setFontSize(8);
            doc.text(`Total: $${clientaData.total}`, columnX + 1, currentY);
            currentY += 5;

            clientaIndex++;
        }

        // Guardar PDF
        const nombreArchivo = `ventas-mary-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        mostrarNotificacion('PDF generado correctamente', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarNotificacion('Error al generar PDF. Verifica que jsPDF esté cargado.', 'error');
    }
}
