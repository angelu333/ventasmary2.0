// ===== GESTIÓN DE CLIENTAS =====

// Agregar cliente
function agregarCliente() {
    const entrada = document.getElementById('nombreClienta').value.trim();
    if (entrada) {
        let partes = entrada.split(' ');
        let cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
        let nombreClienta;
        
        // Si el último elemento es un número, usarlo como cantidad
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
        
        // Obtener el color (opcional)
        const color = document.getElementById('colorProducto').value.trim();
        
        // Crear el objeto de pedido
        const nuevoPedido = {
            producto: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: cantidad
        };
        
        if (color) {
            nuevoPedido.color = color;
        }
        
        pedidos[nombreClienta].push(nuevoPedido);
        
        // Descontar del inventario si usa inventario
        if (productoActual.usaInventario && productoActual.id) {
            descontarStock(productoActual.nombre, cantidad);
        }
        
        // Limpiar los campos
        document.getElementById('nombreClienta').value = '';
        document.getElementById('colorProducto').value = '';
        document.getElementById('cantidadProducto').value = '1';
        
        // Guardar en Firebase
        guardarPedidos();
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`${nombreClienta} agregada exitosamente`, 'success');
        
        // Actualizar estadísticas rápidas
        actualizarEstadisticasRapidas();
    } else {
        mostrarNotificacion('Ingrese el nombre completo de la clienta.', 'error');
    }
}

// Registrar clienta con teléfono
function registrarClienta() {
    const nombre = document.getElementById('nombreClientaRegistro').value.trim();
    let telefono = document.getElementById('telefonoClientaRegistro').value.trim();
    
    if (nombre && telefono) {
        telefono = telefono.replace(/\D/g, '');
        clientasRegistradas[nombre] = telefono;
        guardarClientasRegistradas();
        
        // Limpiar campos
        document.getElementById('nombreClientaRegistro').value = '';
        document.getElementById('telefonoClientaRegistro').value = '';
        
        mostrarNotificacion('Clienta registrada correctamente', 'success');
    } else {
        mostrarNotificacion('Por favor, ingrese el nombre y teléfono de la clienta.', 'error');
    }
}

// Obtener clienta que más compró
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

// Obtener producto más vendido
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