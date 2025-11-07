// ===== AUTOCOMPLETADO =====

// Obtener nombres de clientas
function obtenerNombresClientas() {
    return Object.keys(pedidos);
}

// Mostrar sugerencias
function mostrarSugerencias(input) {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';

    if (!input || input.length < 1) {
        suggestionsList.style.display = 'none';
        return;
    }

    const nombresClientas = obtenerNombresClientas();
    suggestions = nombresClientas.filter(nombre =>
        nombre.toLowerCase().includes(input.toLowerCase())
    );

    if (suggestions.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        // Resaltar la parte que coincide
        const regex = new RegExp(`(${input})`, 'gi');
        const highlightedText = suggestion.replace(regex, '<span class="suggestion-highlight">$1</span>');

        item.innerHTML = highlightedText;
        item.onclick = () => seleccionarSugerencia(suggestion);
        suggestionsList.appendChild(item);
    });

    suggestionsList.style.display = 'block';
    selectedSuggestionIndex = -1;
}

// Seleccionar una sugerencia
function seleccionarSugerencia(nombre) {
    document.getElementById('nombreClienta').value = nombre;
    document.getElementById('suggestionsList').style.display = 'none';
    selectedSuggestionIndex = -1;
}

// Navegar con teclado
function navegarSugerencias(direction) {
    if (suggestions.length === 0) return;

    if (direction === 'down') {
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
    } else if (direction === 'up') {
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
    }

    // Actualizar selección visual
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    // Si se selecciona una sugerencia, actualizar el input
    if (selectedSuggestionIndex >= 0) {
        document.getElementById('nombreClienta').value = suggestions[selectedSuggestionIndex];
    }
}

// Configurar eventos del autocompletado
function configurarAutocompletado() {
    const input = document.getElementById('nombreClienta');
    if (!input) return;

    input.addEventListener('input', (e) => {
        mostrarSugerencias(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navegarSugerencias('down');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navegarSugerencias('up');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                seleccionarSugerencia(suggestions[selectedSuggestionIndex]);
            } else {
                agregarCliente();
            }
        } else if (e.key === 'Escape') {
            document.getElementById('suggestionsList').style.display = 'none';
            selectedSuggestionIndex = -1;
        }
    });

    // Ocultar sugerencias cuando se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            document.getElementById('suggestionsList').style.display = 'none';
            selectedSuggestionIndex = -1;
        }
    });
}