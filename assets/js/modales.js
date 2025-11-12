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
        <h3><i data-feather="users"></i> Gestionar Clientas</h3>
        <div class="clientas-gestion-list">
    `;

    for (let clienta in pedidos) {
        const totalCompras = pedidos[clienta].reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const cantidadProductos = pedidos[clienta].reduce((sum, p) => sum + p.cantidad, 0);
        
        contenido += `
            <div class="clienta-gestion-item">
                <div class="clienta-info">
                    <strong><i data-feather="user"></i> ${clienta}</strong>
                    <div class="clienta-stats">
                        <span><i data-feather="package"></i> ${cantidadProductos} productos</span>
                        <span><i data-feather="dollar-sign"></i> ${totalCompras}</span>
                    </div>
                </div>
                <button onclick="eliminarClienta('${clienta}')" class="btn btn-danger btn-small">
                    <i data-feather="trash-2"></i> Eliminar
                </button>
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
        
        html += `
            <div class="clienta-resultado">
                <div class="clienta-info">
                    <strong><i data-feather="user"></i> ${clienta}</strong>
                    <div class="clienta-stats">
                        <span><i data-feather="package"></i> ${cantidadProductos} productos</span>
                        <span><i data-feather="dollar-sign"></i> ${totalCompras}</span>
                    </div>
                </div>
                <button onclick="verDetalleClienta('${clienta}')" class="btn btn-primary btn-small">
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
        <h3><i data-feather="package"></i> Productos Vendidos</h3>
        <div class="productos-list">
    `;

    for (let key in productosPorNombre) {
        const prod = productosPorNombre[key];
        contenido += `
            <div class="producto-card">
                <div class="producto-header">
                    <strong><i data-feather="tag"></i> ${prod.nombre}</strong>
                    <span class="precio-tag">${prod.precio}</span>
                </div>
                <div class="producto-stats">
                    <div class="stat-item">
                        <i data-feather="hash"></i>
                        <span>${prod.cantidad} vendidos</span>
                    </div>
                    <div class="stat-item">
                        <i data-feather="users"></i>
                        <span>${prod.clientas.length} clientas</span>
                    </div>
                    <div class="stat-item">
                        <i data-feather="dollar-sign"></i>
                        <span>Total: ${prod.total}</span>
                    </div>
                </div>
            </div>
        `;
    }

    contenido += `</div>`;
    abrirModal(contenido);
    cerrarSidebar();
    if (typeof feather !== 'undefined') feather.replace();
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

    const contenido = `
        <h3><i data-feather="message-circle"></i> Enviar Resumen por WhatsApp</h3>
        <div class="whatsapp-container">
            <p>Selecciona qué enviar:</p>
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
        <h3><i data-feather="user"></i> Selecciona una Clienta</h3>
        <div class="clientas-whatsapp-list">
    `;

    for (let clienta in pedidos) {
        contenido += `
            <button onclick="enviarMensajeClienta('${clienta}')" class="btn btn-outline btn-large">
                <i data-feather="message-circle"></i>
                ${clienta}
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