// ===== GESTIÓN DE INVENTARIO =====

// Cargar inventario desde Firebase
function cargarInventario() {
    database.ref('inventario').on('value', (snapshot) => {
        inventario = snapshot.val() || {};
        console.log('📦 Inventario cargado:', Object.keys(inventario).length, 'productos');
    });
}

// Guardar inventario en Firebase
function guardarInventario() {
    database.ref('inventario').set(inventario);
}

// Abrir modal de gestión de inventario
function abrirGestionInventario() {
    let contenido = `
        <h3 style="margin-bottom: 1.5rem;"><i data-feather="package"></i> Gestión de Inventario</h3>
        <p style="margin-bottom: 1rem; color: #7d6450;">Total de productos: <strong>${Object.keys(inventario).length}</strong></p>
        
        <button onclick="agregarProductoInventario()" class="btn btn-primary btn-large" style="width: 100%; margin-bottom: 1.5rem;">
            <i data-feather="plus"></i> Agregar Nuevo Producto
        </button>
        
        <div class="inventario-list">
    `;

    if (Object.keys(inventario).length === 0) {
        contenido += `
            <div class="empty-state">
                <i data-feather="package"></i>
                <h3>No hay productos en inventario</h3>
                <p>Comienza agregando productos</p>
            </div>
        `;
    } else {
        for (let id in inventario) {
            const prod = inventario[id];
            const stockClass = prod.stock <= prod.stockMinimo ? 'stock-bajo' : prod.stock <= (prod.stockMinimo * 2) ? 'stock-medio' : 'stock-alto';
            const stockIcon = prod.stock <= prod.stockMinimo ? 'alert-circle' : 'check-circle';
            
            contenido += `
                <div class="inventario-item ${stockClass}">
                    <div class="inventario-info">
                        <div class="inventario-header">
                            <strong>${prod.nombre}</strong>
                            <span class="precio-tag">$${prod.precio}</span>
                        </div>
                        <div class="inventario-stats">
                            <span class="stock-badge ${stockClass}">
                                <i data-feather="${stockIcon}"></i>
                                Stock: <strong>${prod.stock}</strong>
                            </span>
                            <span style="font-size: 0.875rem; color: #9d8066;">
                                Mínimo: ${prod.stockMinimo}
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="editarProductoInventario('${id}')" class="btn btn-secondary btn-small">
                            <i data-feather="edit-2"></i>
                        </button>
                        <button onclick="eliminarProductoInventario('${id}')" class="btn btn-danger btn-small">
                            <i data-feather="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    contenido += `</div>`;
    abrirModal(contenido);
    cerrarSidebar();
    if (typeof feather !== 'undefined') feather.replace();
}

// Agregar producto al inventario
function agregarProductoInventario() {
    const contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="plus"></i> Agregar Producto</h3>
        <div class="input-group">
            <label class="input-label">Nombre del Producto</label>
            <input type="text" id="invNombre" class="form-input" placeholder="Ej: Esmalte Rojo">
        </div>
        <div class="form-row">
            <div class="input-group">
                <label class="input-label">Precio</label>
                <input type="number" id="invPrecio" class="form-input" placeholder="0" min="0">
            </div>
            <div class="input-group">
                <label class="input-label">Stock Inicial</label>
                <input type="number" id="invStock" class="form-input" placeholder="0" min="0">
            </div>
        </div>
        <div class="input-group">
            <label class="input-label">Stock Mínimo (Alerta)</label>
            <input type="number" id="invStockMin" class="form-input" placeholder="5" min="0" value="5">
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
            <button onclick="guardarProductoInventario()" class="btn btn-primary btn-large" style="flex: 1;">
                <i data-feather="check"></i> Guardar
            </button>
            <button onclick="abrirGestionInventario()" class="btn btn-outline btn-large" style="flex: 1;">
                <i data-feather="x"></i> Cancelar
            </button>
        </div>
    `;
    
    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
    setTimeout(() => document.getElementById('invNombre').focus(), 100);
}

// Guardar producto en inventario
function guardarProductoInventario() {
    const nombre = document.getElementById('invNombre').value.trim();
    const precio = parseInt(document.getElementById('invPrecio').value) || 0;
    const stock = parseInt(document.getElementById('invStock').value) || 0;
    const stockMinimo = parseInt(document.getElementById('invStockMin').value) || 5;

    if (!nombre || precio <= 0) {
        mostrarNotificacion('Completa todos los campos correctamente', 'error');
        return;
    }

    const id = Date.now().toString();
    inventario[id] = {
        nombre: nombre,
        precio: precio,
        stock: stock,
        stockMinimo: stockMinimo,
        fechaCreacion: new Date().toISOString()
    };

    guardarInventario();
    mostrarNotificacion('Producto agregado al inventario', 'success');
    abrirGestionInventario();
}

// Editar producto del inventario
function editarProductoInventario(id) {
    const prod = inventario[id];
    
    const contenido = `
        <h3 style="margin-bottom: 1rem;"><i data-feather="edit-2"></i> Editar Producto</h3>
        <div class="input-group">
            <label class="input-label">Nombre del Producto</label>
            <input type="text" id="invNombre" class="form-input" value="${prod.nombre}">
        </div>
        <div class="form-row">
            <div class="input-group">
                <label class="input-label">Precio</label>
                <input type="number" id="invPrecio" class="form-input" value="${prod.precio}" min="0">
            </div>
            <div class="input-group">
                <label class="input-label">Stock Actual</label>
                <input type="number" id="invStock" class="form-input" value="${prod.stock}" min="0">
            </div>
        </div>
        <div class="input-group">
            <label class="input-label">Stock Mínimo (Alerta)</label>
            <input type="number" id="invStockMin" class="form-input" value="${prod.stockMinimo}" min="0">
        </div>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
            <button onclick="actualizarProductoInventario('${id}')" class="btn btn-primary btn-large" style="flex: 1;">
                <i data-feather="check"></i> Guardar
            </button>
            <button onclick="abrirGestionInventario()" class="btn btn-outline btn-large" style="flex: 1;">
                <i data-feather="x"></i> Cancelar
            </button>
        </div>
    `;
    
    abrirModal(contenido);
    if (typeof feather !== 'undefined') feather.replace();
}

// Actualizar producto del inventario
function actualizarProductoInventario(id) {
    const nombre = document.getElementById('invNombre').value.trim();
    const precio = parseInt(document.getElementById('invPrecio').value) || 0;
    const stock = parseInt(document.getElementById('invStock').value) || 0;
    const stockMinimo = parseInt(document.getElementById('invStockMin').value) || 5;

    if (!nombre || precio <= 0) {
        mostrarNotificacion('Completa todos los campos correctamente', 'error');
        return;
    }

    inventario[id].nombre = nombre;
    inventario[id].precio = precio;
    inventario[id].stock = stock;
    inventario[id].stockMinimo = stockMinimo;

    guardarInventario();
    mostrarNotificacion('Producto actualizado', 'success');
    abrirGestionInventario();
}

// Eliminar producto del inventario
function eliminarProductoInventario(id) {
    const prod = inventario[id];
    if (confirm(`¿Eliminar "${prod.nombre}" del inventario?`)) {
        delete inventario[id];
        guardarInventario();
        mostrarNotificacion('Producto eliminado', 'success');
        abrirGestionInventario();
    }
}

// Descontar stock del inventario
function descontarStock(nombreProducto, cantidad) {
    for (let id in inventario) {
        if (inventario[id].nombre === nombreProducto) {
            inventario[id].stock -= cantidad;
            
            // Alerta de stock bajo
            if (inventario[id].stock <= inventario[id].stockMinimo) {
                mostrarNotificacion(
                    `⚠️ Stock bajo de ${nombreProducto}: ${inventario[id].stock} unidades`,
                    'warning'
                );
            }
            
            guardarInventario();
            return true;
        }
    }
    return false;
}

// Obtener productos del inventario para selector
function obtenerProductosInventario() {
    const productos = [];
    for (let id in inventario) {
        if (inventario[id].stock > 0) {
            productos.push({
                id: id,
                nombre: inventario[id].nombre,
                precio: inventario[id].precio,
                stock: inventario[id].stock
            });
        }
    }
    return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
}
