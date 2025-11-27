// ===== INICIALIZACIÓN PRINCIPAL =====

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Ventas Mary PWA...');

    // Verificar si es PWA
    if (esPWA()) {
        console.log('📱 Ejecutándose como PWA');
        document.body.classList.add('pwa-mode');
        isInstalled = true;
    }

    // Cargar datos de Firebase
    cargarDatos();
    cargarInventario();

    // Verificar conectividad inicial (sin mostrar notificación)
    setTimeout(() => {
        verificarConectividad();
    }, 2000);

    // Configurar autocompletado
    configurarAutocompletado();

    // Actualizar estadísticas iniciales
    setTimeout(() => {
        actualizarEstadisticasRapidas();
    }, 1000);

    // Cargar selector de inventario
    setTimeout(() => {
        cambiarModoProducto('inventario');
    }, 1500);

    // Inicializar iconos de Feather
    if (typeof feather !== 'undefined') {
        feather.replace();
        console.log('✅ Iconos de Feather inicializados');
    }

    // Mostrar botón de instalación si está disponible
    setTimeout(mostrarBotonInstalar, 2000);

    console.log('✅ Ventas Mary PWA inicializada correctamente');
});

// Funciones que necesitan estar disponibles globalmente para el HTML
window.toggleSidebar = toggleSidebar;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.irAInicio = irAInicio;
window.agregarProducto = agregarProducto;
window.agregarCliente = agregarCliente;
window.finalizarProducto = finalizarProducto;
window.iniciarReconocimientoVoz = iniciarReconocimientoVoz;
window.instalarPWA = instalarPWA;
window.mostrarResumen = mostrarResumen;
window.abrirModoMasivo = abrirModoMasivo;
window.cerrarModoMasivo = cerrarModoMasivo;
window.agregarClienteAModal = agregarClienteAModal;
window.removerClienteMasivo = removerClienteMasivo;
window.procesarRegistroMasivo = procesarRegistroMasivo;
window.abrirModalEstadisticas = abrirModalEstadisticas;
window.abrirModalGestionarClientas = abrirModalGestionarClientas;
window.abrirModalBuscarClienta = abrirModalBuscarClienta;
window.verProductosYClientas = verProductosYClientas;
window.abrirModalEnviarWhatsApp = abrirModalEnviarWhatsApp;
window.generarPDF = generarPDF;
window.confirmarReiniciarInventario = confirmarReiniciarInventario;
// Funciones de gestión
window.eliminarClienta = eliminarClienta;
window.buscarClientaEnTiempoReal = buscarClientaEnTiempoReal;
window.verDetalleClienta = verDetalleClienta;
window.enviarResumenCompleto = enviarResumenCompleto;
window.enviarPorClienta = enviarPorClienta;
window.enviarMensajeClienta = enviarMensajeClienta;
// Funciones de edición de pedidos
window.editarPedidosClienta = editarPedidosClienta;
window.eliminarPedidoIndividual = eliminarPedidoIndividual;
window.editarPedidoIndividual = editarPedidoIndividual;
window.guardarEdicionPedido = guardarEdicionPedido;
window.agregarPedidoAClienta = agregarPedidoAClienta;
window.confirmarAgregarPedido = confirmarAgregarPedido;
// Funciones de productos
window.verDetalleProducto = verDetalleProducto;
window.agregarClientaAProducto = agregarClientaAProducto;
window.confirmarAgregarClientaAProducto = confirmarAgregarClientaAProducto;
window.eliminarPedidoProducto = eliminarPedidoProducto;
window.cambiarModoProducto = cambiarModoProducto;
// Funciones de inventario
window.abrirGestionInventario = abrirGestionInventario;
window.agregarProductoInventario = agregarProductoInventario;
window.guardarProductoInventario = guardarProductoInventario;
window.editarProductoInventario = editarProductoInventario;
window.actualizarProductoInventario = actualizarProductoInventario;
window.eliminarProductoInventario = eliminarProductoInventario;
window.filtrarClientasGestion = filtrarClientasGestion;
window.sugerirProductosModal = sugerirProductosModal;
window.seleccionarProductoModal = seleccionarProductoModal;
window.sugerirClientasModal = sugerirClientasModal;
window.seleccionarClientaModal = seleccionarClientaModal;

