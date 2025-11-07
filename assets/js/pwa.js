// ===== PWA FUNCTIONALITY =====

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ PWA: Service Worker registrado', registration.scope);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            mostrarNotificacion('Nueva versión disponible. Recarga para actualizar.', 'info');
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('❌ PWA: Error al registrar Service Worker', error);
            });
    });
}

// Detectar si la app ya está instalada
window.addEventListener('appinstalled', (evt) => {
    console.log('🎉 PWA: App instalada exitosamente');
    isInstalled = true;
    mostrarNotificacion('¡Ventas Mary instalada correctamente!', 'success');
    ocultarBotonInstalar();
});

// Capturar el evento de instalación
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 PWA: Prompt de instalación disponible');
    e.preventDefault();
    deferredPrompt = e;
    mostrarBotonInstalar();
});

// Mostrar botón de instalación
function mostrarBotonInstalar() {
    if (isInstalled) return;
    
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.className = 'btn btn-primary install-btn';
    installButton.innerHTML = '<i data-feather="download"></i> Instalar App';
    installButton.onclick = instalarPWA;
    
    const headerContent = document.querySelector('.header-content');
    if (headerContent && !document.getElementById('install-button')) {
        headerContent.appendChild(installButton);
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Ocultar botón de instalación
function ocultarBotonInstalar() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.remove();
    }
}

// Instalar PWA
async function instalarPWA() {
    if (!deferredPrompt) {
        mostrarNotificacion('La instalación no está disponible en este momento', 'info');
        return;
    }
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ PWA: Usuario aceptó la instalación');
            mostrarNotificacion('Instalando Ventas Mary...', 'success');
        } else {
            console.log('❌ PWA: Usuario rechazó la instalación');
        }
        
        deferredPrompt = null;
        ocultarBotonInstalar();
    } catch (error) {
        console.error('❌ PWA: Error durante la instalación', error);
        mostrarNotificacion('Error durante la instalación', 'error');
    }
}

// Detectar si está ejecutándose como PWA
function esPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// Verificar conectividad
function verificarConectividad() {
    if (navigator.onLine) {
        console.log('🌐 Conectado a internet');
        document.body.classList.remove('offline');
        verificarFirebase();
    } else {
        console.log('📴 Sin conexión a internet');
        document.body.classList.add('offline');
        mostrarNotificacion('Sin conexión. Trabajando en modo offline.', 'warning');
    }
}

// Escuchar cambios de conectividad
window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    document.body.classList.remove('offline');
    if (document.body.classList.contains('was-offline')) {
        mostrarNotificacion('Conexión restaurada', 'success');
        document.body.classList.remove('was-offline');
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Conexión perdida');
    document.body.classList.add('offline', 'was-offline');
    mostrarNotificacion('Sin conexión. Trabajando offline.', 'warning');
});