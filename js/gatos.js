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

// Crear HTML de una tarjeta de gato
function crearTarjetaGato(gato, index, mostrarInicial) {
    const ocultaClass = index >= mostrarInicial ? 'hidden-cat' : '';
    return `
        <div class="${ocultaClass}">
            <img src="${gato.imagen}" alt="${gato.alt || gato.nombre}" />
            <div>
                <h3>${gato.nombre}</h3>
                <p>${gato.descripcion}</p>
                <button><span>Saber más</span></button>
            </div>
        </div>
    `;
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

        // Encontrar el contenedor del grid
        const grid = seccion.querySelector('.gatos-grid');
        if (!grid) return;

        // Renderizar tarjetas
        grid.innerHTML = gatos.map((gato, i) =>
            crearTarjetaGato(gato, i, config.mostrarInicial)
        ).join('');

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
