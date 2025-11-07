// ===== GESTIÓN DE FIREBASE =====

// Cargar datos iniciales
function cargarDatos() {
    database.ref('pedidos').on('value', (snapshot) => {
        pedidos = snapshot.val() || {};
    });

    database.ref('clientasRegistradas').on('value', (snapshot) => {
        clientasRegistradas = snapshot.val() || {};
    });

    database.ref('estadisticasSemanales').on('value', (snapshot) => {
        estadisticasSemanales = snapshot.val() || {};
    });

    database.ref('historialGanancias').on('value', (snapshot) => {
        historialGanancias = snapshot.val() || {};
    });
}

// Guardar pedidos en Firebase
function guardarPedidos() {
    return database.ref('pedidos').set(pedidos);
}

// Guardar clientas registradas
function guardarClientasRegistradas() {
    return database.ref('clientasRegistradas').set(clientasRegistradas);
}

// Guardar estadísticas semanales
function guardarEstadisticasSemanales() {
    return database.ref('estadisticasSemanales').set(estadisticasSemanales);
}

// Guardar historial de ganancias
function guardarHistorialGanancias() {
    return database.ref('historialGanancias').set(historialGanancias);
}

// Verificar conexión Firebase
function verificarFirebase() {
    try {
        database.ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === true) {
                console.log('✅ Firebase conectado');
                document.body.classList.remove('firebase-offline');
            } else {
                console.log('❌ Firebase desconectado');
                document.body.classList.add('firebase-offline');
            }
        });
    } catch (error) {
        console.error('❌ Error de Firebase:', error);
        document.body.classList.add('firebase-offline');
    }
}