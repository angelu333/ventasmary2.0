// ===== GESTIÓN DE PRODUCTOS =====

// Agregar producto
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

// Finalizar producto
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

// Calcular total de ventas
function calcularTotalVentas() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.precio * pedido.cantidad;
        });
    }
    return total;
}

// Calcular total de productos
function calcularTotalProductos() {
    let total = 0;
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            total += pedido.cantidad;
        });
    }
    return total;
}