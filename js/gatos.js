 // Configuración de secciones de gatos
const SECCIONES_GATOS = {
    'nuestros-gatos': {
        json: '/datos/gatos-colonia.json',
        mostrarInicial: 4,
        textoVerMas: 'Ver todos los gatos',
        textoVerMenos: 'Ver menos'
    },
    'gatos-acogida': {
        json: '/datos/gatos-acogida.json',
        mostrarInicial: 4,
        textoVerMas: 'Ver todos',
        textoVerMenos: 'Ver menos'
    },
    'gatos-fallecidos': {
        json: '/datos/gatos-fallecidos.json',
        mostrarInicial: 4,
        textoVerMas: 'Ver todos',
        textoVerMenos: 'Ver menos'
    }
};

// Almacenar datos de gatos para el modal
let datosGatos = {};

// Crear HTML de una tarjeta de gato
function crearTarjetaGato(gato, index, mostrarInicial, seccionId) {
    const ocultaClass = index >= mostrarInicial ? 'hidden-cat' : '';
    return `
        <div class="${ocultaClass}">
            <img src="${gato.imagen}" alt="${gato.alt || gato.nombre}" />
            <div>
                <h3>${gato.nombre}</h3>
                <p>${gato.descripcion}</p>
                <button class="btn-saber-mas" data-seccion="${seccionId}" data-index="${index}">
                    <span>Saber más</span>
                </button>
            </div>
        </div>
    `;
}

// Crear y mostrar modal de gato
function mostrarModalGato(gato) {
    // Crear overlay si no existe
    let overlay = document.getElementById('modal-gato-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-gato-overlay';
        overlay.className = 'modal-gato-overlay';
        document.body.appendChild(overlay);
    }

    // Crear contenido del modal
    overlay.innerHTML = `
        <div class="modal-gato-content">
            <button class="modal-close-btn" aria-label="Cerrar">✕</button>
            <img src="${gato.imagen}" alt="${gato.alt || gato.nombre}" />
            <div class="modal-gato-body">
                <h3>${gato.nombre}</h3>
                <p>${gato.descripcion}</p>
            </div>
        </div>
    `;

    // Mostrar modal
    setTimeout(() => overlay.classList.add('active'), 10);

    // Cerrar con botón
    overlay.querySelector('.modal-close-btn').addEventListener('click', cerrarModal);

    // Cerrar al hacer clic fuera del contenido
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            cerrarModal();
        }
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', handleEscKey);

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function cerrarModal() {
    const overlay = document.getElementById('modal-gato-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }

    // Restaurar scroll del body
    document.body.style.overflow = '';

    // Remover listener de ESC
    document.removeEventListener('keydown', handleEscKey);
}

// Manejar tecla ESC
function handleEscKey(e) {
    if (e.key === 'Escape') {
        cerrarModal();
    }
}

// Cargar y renderizar gatos de una sección
async function cargarGatos(seccionId) {
    const config = SECCIONES_GATOS[seccionId];
    if (!config) return;

    const seccion = document.getElementById(seccionId);
    if (!seccion) return;

    try {
        const response = await fetch(config.json);
        const gatos = await response.json();

        // Si no hay gatos, ocultar la sección
        if (gatos.length === 0) {
            seccion.style.display = 'none';
            return;
        }

        // Guardar datos para el modal
        datosGatos[seccionId] = gatos;

        // Encontrar el contenedor del grid
        const grid = seccion.querySelector('.gatos-grid');
        if (!grid) return;

        // Renderizar tarjetas
        grid.innerHTML = gatos.map((gato, i) =>
            crearTarjetaGato(gato, i, config.mostrarInicial, seccionId)
        ).join('');

        // Añadir event listeners a botones "Saber más"
        grid.querySelectorAll('.btn-saber-mas').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seccion = e.currentTarget.dataset.seccion;
                const index = parseInt(e.currentTarget.dataset.index);
                const gato = datosGatos[seccion][index];
                mostrarModalGato(gato);
            });
        });

        // Configurar botón "ver todos"
        const btnVerTodos = seccion.querySelector('.btn-ver-todos');
        if (btnVerTodos) {
            // Ocultar botón si hay pocos gatos
            if (gatos.length <= config.mostrarInicial) {
                btnVerTodos.style.display = 'none';
            } else {
                let expanded = false;
                btnVerTodos.addEventListener('click', () => {
                    expanded = !expanded;
                    const hiddenCats = grid.querySelectorAll('.hidden-cat');
                    hiddenCats.forEach(cat => cat.classList.toggle('show-cat', expanded));
                    btnVerTodos.querySelector('span').textContent = expanded
                        ? config.textoVerMenos
                        : config.textoVerMas;
                });
            }
        }

    } catch (error) {
        console.error(`Error cargando gatos de ${seccionId}:`, error);
    }
}

// Inicializar todas las secciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Object.keys(SECCIONES_GATOS).forEach(seccionId => {
        cargarGatos(seccionId);
    });
});
