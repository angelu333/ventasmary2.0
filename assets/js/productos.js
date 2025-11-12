// ===== GESTIÓN DE PRODUCTOS =====

// Agregar producto
function agregarProducto() {
    const selectProducto = document.getElementById('selectProductoInventario');
    
    // Si hay selector de inventario (modo inventario)
    if (selectProducto && selectProducto.value) {
        const productoId = selectProducto.value;
        const prod = inventario[productoId];
        
        if (prod && prod.stock > 0) {
            productoActual = { 
                id: productoId,
                nombre: prod.nombre, 
                precio: prod.precio,
                usaInventario: true
            };
            
            document.getElementById('producto-form').style.display = 'none';
            document.getElementById('cliente-form').style.display = 'block';
            
            // Actualizar el título del modal masivo
            const modalMasivo = document.querySelector('#modal-masivo .modal-title');
            if (modalMasivo) {
                modalMasivo.textContent = `Registro Masivo - ${prod.nombre}`;
            }
            
            setTimeout(() => {
                document.getElementById('nombreClienta').focus();
            }, 100);
        } else {
            mostrarNotificacion('Producto sin stock disponible', 'error');
        }
    } else {
        // Modo manual (sin inventario)
        const nombre = document.getElementById('nombreProducto').value.trim();
        const precio = parseInt(document.getElementById('precioProducto').value);
        
        if (nombre && precio > 0) {
            productoActual = { 
                nombre: nombre, 
                precio: precio,
                usaInventario: false
            };
            
            document.getElementById('producto-form').style.display = 'none';
            document.getElementById('cliente-form').style.display = 'block';
            
            const modalMasivo = document.querySelector('#modal-masivo .modal-title');
            if (modalMasivo) {
                modalMasivo.textContent = `Registro Masivo - ${nombre}`;
            }
            
            setTimeout(() => {
                document.getElementById('nombreClienta').focus();
            }, 100);
        } else {
            mostrarNotificacion('Por favor, ingrese un nombre y precio válido para el producto.', 'error');
        }
    }
}

// Cambiar modo de entrada de producto
function cambiarModoProducto(modo) {
    const modoInventario = document.getElementById('modo-inventario');
    const modoManual = document.getElementById('modo-manual');
    const btnInventario = document.getElementById('btn-modo-inventario');
    const btnManual = document.getElementById('btn-modo-manual');
    
    if (modo === 'inventario') {
        modoInventario.style.display = 'block';
        modoManual.style.display = 'none';
        btnInventario.classList.add('active');
        btnManual.classList.remove('active');
        cargarSelectorInventario();
    } else {
        modoInventario.style.display = 'none';
        modoManual.style.display = 'block';
        btnInventario.classList.remove('active');
        btnManual.classList.add('active');
    }
}

// Cargar selector de inventario
function cargarSelectorInventario() {
    const select = document.getElementById('selectProductoInventario');
    if (!select) return;
    
    const productos = obtenerProductosInventario();
    
    select.innerHTML = '<option value="">Selecciona un producto...</option>';
    
    productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = `${prod.nombre} - $${prod.precio} (Stock: ${prod.stock})`;
        select.appendChild(option);
    });
    
    // Actualizar precio al seleccionar
    select.addEventListener('change', function() {
        const productoId = this.value;
        if (productoId && inventario[productoId]) {
            // Mostrar info del producto seleccionado
            const prod = inventario[productoId];
            const infoDiv = document.getElementById('info-producto-seleccionado');
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <div style="background: #f9f1e8; padding: 1rem; border-radius: 0.75rem; margin-top: 1rem;">
                        <p style="margin: 0; color: #7d6450;">
                            <strong>${prod.nombre}</strong> • $${prod.precio} • Stock disponible: <strong>${prod.stock}</strong>
                        </p>
                    </div>
                `;
            }
        }
    });
}

// Finalizar producto
function finalizarProducto() {
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precioProducto').value = '';
    document.getElementById('producto-form').style.display = 'block';
    document.getElementById('cliente-form').style.display = 'none';
    
    // Limpiar campos del formulario de cliente
    document.getElementById('nombreClienta').value = '';
    document.getElementById('colorProducto').value = '';
    document.getElementById('cantidadProducto').value = '1';
    
    // Limpiar producto actual
    productoActual = {};
    
    // Actualizar estadísticas
    actualizarEstadisticasRapidas();
    
    // Enfocar el campo de nombre de producto
    setTimeout(() => {
        document.getElementById('nombreProducto').focus();
    }, 100);
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

// Obtener clienta que más compró
function obtenerClientaTop() {
    let clientaTop = { nombre: '', total: 0 };
    
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
    const productosCantidad = {};
    
    for (let clienta in pedidos) {
        pedidos[clienta].forEach(pedido => {
            if (!productosCantidad[pedido.producto]) {
                productosCantidad[pedido.producto] = 0;
            }
            productosCantidad[pedido.producto] += pedido.cantidad;
        });
    }
    
    let productoTop = { nombre: '', cantidad: 0 };
    for (let producto in productosCantidad) {
        if (productosCantidad[producto] > productoTop.cantidad) {
            productoTop = { nombre: producto, cantidad: productosCantidad[producto] };
        }
    }
    
    return productoTop;
}