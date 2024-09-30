//*public/js/admin-script.js
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

    addClickListener('verDocumentacion', 'verificarDocumentacion');
    addClickListener('gestionarUsuarios', 'gestionarUsuarios');
    addClickListener('cargarDatos', 'cargarDatos');

    // Otras funciones globales que puedan ser necesarias en múltiples páginas
});