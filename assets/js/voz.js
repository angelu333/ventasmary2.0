// ===== RECONOCIMIENTO DE VOZ =====

let recognition = null;
let isListening = false;

// Verificar soporte de reconocimiento de voz
function soportaReconocimientoVoz() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Inicializar reconocimiento de voz
function inicializarReconocimientoVoz() {
    if (!soportaReconocimientoVoz()) {
        mostrarNotificacion('Tu navegador no soporta reconocimiento de voz', 'error');
        return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        console.log('🎤 Reconocimiento de voz iniciado');
        isListening = true;
        actualizarBotonVoz();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🗣️ Texto reconocido:', transcript);
        procesarComandoVoz(transcript);
    };

    recognition.onerror = (event) => {
        console.error('❌ Error de reconocimiento:', event.error);
        isListening = false;
        actualizarBotonVoz();

        let mensaje = 'Error en el reconocimiento de voz';
        switch (event.error) {
            case 'no-speech':
                mensaje = 'No se detectó voz. Intenta de nuevo.';
                break;
            case 'audio-capture':
                mensaje = 'No se puede acceder al micrófono';
                break;
            case 'not-allowed':
                mensaje = 'Permiso de micrófono denegado';
                break;
        }
        mostrarNotificacion(mensaje, 'error');
    };

    recognition.onend = () => {
        console.log('🎤 Reconocimiento de voz terminado');
        isListening = false;
        actualizarBotonVoz();
    };

    return true;
}

// Iniciar reconocimiento de voz
function iniciarReconocimientoVoz() {
    if (!recognition && !inicializarReconocimientoVoz()) {
        return;
    }

    if (isListening) {
        recognition.stop();
        return;
    }

    // Verificar que hay un producto registrado
    if (!productoActual || !productoActual.nombre) {
        mostrarNotificacion('⚠️ Primero debes registrar un producto', 'warning');
        return;
    }

    try {
        recognition.start();
        mostrarNotificacion(`🎤 Habla ahora... Di: "María rojo dos" para agregar a ${productoActual.nombre}`, 'info');
    } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
        mostrarNotificacion('Error al iniciar el micrófono', 'error');
    }
}

// Procesar comando de voz
function procesarComandoVoz(texto) {
    console.log('Procesando comando:', texto);

    // Verificar que hay un producto registrado
    if (!productoActual || !productoActual.nombre) {
        mostrarNotificacion('⚠️ Primero debes registrar un producto', 'warning');
        return;
    }

    // Limpiar y normalizar el texto
    const textoLimpio = texto.toLowerCase()
        .replace(/[.,!?]/g, '')
        .trim();

    // Patrones simplificados - solo nombre, color opcional y cantidad
    const patrones = [
        // "maria rojo dos" o "maria dos"
        /^(.+?)\s+(rojo|azul|rosa|negro|blanco|verde|amarillo|morado|naranja|plateado|dorado|transparente)?\s*(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|1|2|3|4|5|6|7|8|9|10)?$/,
        // "agregar maria rojo dos"
        /^agregar\s+(.+?)\s+(rojo|azul|rosa|negro|blanco|verde|amarillo|morado|naranja|plateado|dorado|transparente)?\s*(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|1|2|3|4|5|6|7|8|9|10)?$/,
        // Solo nombre "maria"
        /^(.+)$/
    ];

    let match = null;
    let patronIndex = -1;
    
    for (let i = 0; i < patrones.length; i++) {
        match = textoLimpio.match(patrones[i]);
        if (match) {
            patronIndex = i;
            break;
        }
    }

    if (match) {
        let nombre, color, cantidad;
        
        if (patronIndex === 0) {
            // Patrón "[nombre] [color] [cantidad]"
            nombre = match[1].trim();
            color = match[2] || '';
            cantidad = convertirCantidadTextoANumero(match[3] || '1');
        } else if (patronIndex === 1) {
            // Patrón "agregar [nombre] [color] [cantidad]"
            nombre = match[1].trim();
            color = match[2] || '';
            cantidad = convertirCantidadTextoANumero(match[3] || '1');
        } else {
            // Solo nombre
            nombre = match[1].trim();
            color = '';
            cantidad = 1;
        }

        // Procesar el comando
        procesarVentaPorVoz(nombre, color, cantidad);
    } else {
        mostrarNotificacion('No entendí el comando. Intenta: "María rojo dos"', 'warning');
        mostrarEjemplosComandos();
    }
}

// Convertir cantidad de texto a número
function convertirCantidadTextoANumero(texto) {
    const numeros = {
        'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
    };
    return numeros[texto.toLowerCase()] || 1;
}

// Procesar venta por voz
function procesarVentaPorVoz(nombre, color, cantidad) {
    // Capitalizar nombre
    const nombreFormateado = nombre.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Capitalizar color si existe
    const colorFormateado = color ? color.charAt(0).toUpperCase() + color.slice(1) : '';

    // Usar el producto actual que ya está registrado
    const precio = productoActual.precio;
    const nombreProducto = productoActual.nombre;

    // Verificar stock si usa inventario
    if (productoActual.usaInventario && productoActual.id) {
        const prod = inventario[productoActual.id];
        if (prod && prod.stock < cantidad) {
            mostrarNotificacion(`⚠️ Stock insuficiente. Disponible: ${prod.stock}`, 'error');
            return;
        }
    }

    // Agregar a pedidos
    if (!pedidos[nombreFormateado]) {
        pedidos[nombreFormateado] = [];
    }

    const nuevoPedido = {
        producto: nombreProducto,
        precio: precio,
        cantidad: cantidad
    };

    if (colorFormateado) {
        nuevoPedido.color = colorFormateado;
    }

    pedidos[nombreFormateado].push(nuevoPedido);

    // Descontar del inventario si usa inventario
    if (productoActual.usaInventario && productoActual.id) {
        descontarStock(nombreProducto, cantidad);
    }

    // Guardar en Firebase
    guardarPedidos();

    // Mostrar confirmación
    const mensajeColor = colorFormateado ? ` (${colorFormateado})` : '';
    mostrarNotificacion(
        `✅ ${nombreFormateado} - ${nombreProducto}${mensajeColor} x${cantidad}`,
        'success'
    );

    // Actualizar estadísticas
    actualizarEstadisticasRapidas();
    
    // Limpiar campos del formulario
    const nombreInput = document.getElementById('nombreClienta');
    const colorInput = document.getElementById('colorProducto');
    const cantidadInput = document.getElementById('cantidadProducto');
    
    if (nombreInput) nombreInput.value = '';
    if (colorInput) colorInput.value = '';
    if (cantidadInput) cantidadInput.value = '1';
}

// Obtener precio por defecto según tipo de producto
function obtenerPrecioPorDefecto(tipo) {
    const precios = {
        'esmalte': 15,
        'tratamiento': 25,
        'base': 20,
        'top': 20,
        'removedor': 10
    };
    return precios[tipo] || 15;
}

// Mostrar ejemplos de comandos
function mostrarEjemplosComandos() {
    const productoNombre = productoActual && productoActual.nombre ? productoActual.nombre : 'el producto actual';
    
    const ejemplos = `
        <h4>Comandos de voz para agregar clientas:</h4>
        <p><strong>Producto actual:</strong> ${productoNombre}</p>
        <h5>Ejemplos:</h5>
        <ul>
            <li>"María rojo dos" → Agrega María con color rojo, cantidad 2</li>
            <li>"Ana Pérez azul" → Agrega Ana Pérez con color azul, cantidad 1</li>
            <li>"Lucia tres" → Agrega Lucia sin color, cantidad 3</li>
            <li>"Carmen" → Agrega Carmen sin color, cantidad 1</li>
        </ul>
        <p><strong>Formato:</strong> [Nombre] [Color opcional] [Cantidad opcional]</p>
        <p><small>Colores reconocidos: rojo, azul, rosa, negro, blanco, verde, amarillo, morado, naranja, plateado, dorado, transparente</small></p>
    `;

    setTimeout(() => {
        abrirModal(ejemplos);
    }, 2000);
}

// Actualizar botón de voz
function actualizarBotonVoz() {
    const btn = document.getElementById('voiceBtn');
    const text = document.getElementById('voiceBtnText');

    if (!btn || !text) return;

    if (isListening) {
        btn.classList.add('listening');
        text.textContent = 'Escuchando...';
        btn.style.background = '#e57373';
    } else {
        btn.classList.remove('listening');
        text.textContent = 'Registro por Voz';
        btn.style.background = '';
    }
}