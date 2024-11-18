// Ruta: public/js/admin-script.js
// Propósito: Maneja la funcionalidad del panel de administración

document.addEventListener('DOMContentLoaded', function() {
    // Funciones para cargar contenido dinámicamente
    const cargarContenido = (seccion) => {
        const contenidoPrincipal = document.getElementById('contenidoPrincipal');
        if (contenidoPrincipal) {
            fetch(`/admin/${seccion}`)
                .then(response => response.text())
                .then(html => {
                    contenidoPrincipal.innerHTML = html;
                })
                .catch(error => {
                    console.error('Error:', error);
                    contenidoPrincipal.innerHTML = '<p>Error al cargar el contenido.</p>';
                });
        }
    };

    // Agregar event listeners solo si los elementos existen
    const addClickListener = (id, seccion) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('click', function(e) {
                e.preventDefault();
                cargarContenido(seccion);
            });
        }
    };

    // Event listeners para los botones de navegación
    addClickListener('verDocumentacion', 'verificarDocumentacion');
    addClickListener('gestionarUsuarios', 'gestionarUsuarios');
    addClickListener('cargarDatos', 'cargarDatos');

    // Manejar evento de eliminación global
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('eliminar-aprendiz')) {
            const id = e.target.dataset.id;
            if (confirm('¿Está seguro de que desea eliminar este aprendiz?')) {
                eliminarAprendiz(id);
            }
        }
    });
});

// Función para eliminar aprendiz
function eliminarAprendiz(id) {
    fetch(`/admin/aprendiz/eliminar/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Aprendiz eliminado exitosamente');
                // Recargar la página actual
                window.location.reload();
            } else {
                alert('Error al eliminar el aprendiz: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        });
}

// Exportar funciones necesarias al scope global
window.eliminarAprendiz = eliminarAprendiz;
window.cargarContenido = cargarContenido;