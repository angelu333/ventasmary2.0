// ===== INTERFAZ DE USUARIO =====

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
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
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Mostrar notificación
    setTimeout(() => notificacion.classList.add('show'), 100);

    // Ocultar después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Actualizar estadísticas rápidas (ya no se usa pero se mantiene por compatibilidad)
function actualizarEstadisticasRapidas() {
    // Esta función ya no hace nada porque eliminamos la sección de estadísticas
    // Se mantiene para evitar errores en otras partes del código
    return;
}

// Toggle sidebar
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

// Cerrar sidebar
function cerrarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Ir a inicio
function irAInicio() {
    // Limpiar resumen
    document.getElementById('resumen').innerHTML = '';
    
    // Mostrar formulario de productos
    document.getElementById('producto-form').style.display = 'block';
    document.getElementById('cliente-form').style.display = 'none';
    
    // Limpiar campos
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precioProducto').value = '';
    document.getElementById('nombreClienta').value = '';
    document.getElementById('colorProducto').value = '';
    document.getElementById('cantidadProducto').value = '1';
    
    // Limpiar producto actual
    productoActual = {};

    cerrarSidebar();
    
    // Enfocar el campo de nombre de producto
    setTimeout(() => {
        document.getElementById('nombreProducto').focus();
    }, 100);
}

// Abrir modal
function abrirModal(contenido) {
    document.getElementById('modal-contenido').innerHTML = contenido;
    document.getElementById('modal').style.display = 'block';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}