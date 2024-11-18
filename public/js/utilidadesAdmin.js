// Ruta: public/js/utilidadesAdmin.js
// Propósito: Funciones unificadas para interfaz de administrador y manejo de formularios.

import {
    showSuccessMessage,
    showErrorMessage,
    playSound,
    sonidos,
    validaciones
} from './utils.js';

const utilidadesAdmin = {
    // Configuración de DataTables
    inicializarTablaAprendices(idTabla, opciones = {}) {
        const configuracionBase = {
            serverSide: true,
            processing: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'excel',
                    className: 'btn btn-sm btn-success',
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    filename: 'Lista_Aprendices',
                    exportOptions: {
                        columns: ':not(:last-child)'
                    }
                },
                {
                    extend: 'pdf',
                    className: 'btn btn-sm btn-danger',
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    filename: 'Lista_Aprendices',
                    exportOptions: {
                        columns: ':not(:last-child)'
                    },
                    customize: function(doc) {
                        doc.defaultStyle.fontSize = 8;
                        doc.styles.tableHeader.fontSize = 9;
                        doc.styles.title.fontSize = 14;
                    }
                }
            ],
            scrollX: true,
            scrollY: '60vh',
            scrollCollapse: true,
            responsive: true,
            fixedHeader: true
        };

        const tabla = $(idTabla).DataTable({...configuracionBase, ...opciones});
        this.configurarTablaResponsiva();
        return tabla;
    },

    // Validación y manejo de formularios
    async validateForm(form) {
        let isValid = true;

        // Validar campos requeridos
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showError(field, 'Este campo es obligatorio');
            } else {
                this.clearError(field);
            }
        });

        // Validaciones específicas
        const emailField = form.querySelector('#correoElectronico');
        if (emailField && emailField.value && !validaciones.esEmailValido(emailField.value)) {
            isValid = false;
            this.showError(emailField, 'Correo electrónico inválido');
        }

        const documentoField = form.querySelector('#numeroDocumento');
        if (documentoField && documentoField.value && !validaciones.esDocumentoValido(documentoField.value)) {
            isValid = false;
            this.showError(documentoField, 'Número de documento inválido (8-12 dígitos)');
        }

        const celularField = form.querySelector('#celular');
        if (celularField && celularField.value && !validaciones.esTelefonoValido(celularField.value)) {
            isValid = false;
            this.showError(celularField, 'Número de celular inválido (10 dígitos)');
        }

        // Validar fechas
        const fechasFields = ['fechaNacimiento', 'fechaInicioFormacion', 'fechaInicioLectiva', 'fechaFinLectiva'];
        fechasFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field && field.value && !validaciones.esFechaValida(field.value)) {
                isValid = false;
                this.showError(field, 'Fecha inválida');
            }
        });

        if (!isValid) {
            await playSound(sonidos.error);
            showErrorMessage('Por favor, corrija los errores en el formulario');
        }

        return isValid;
    },

    showError(field, message) {
        this.clearError(field);
        field.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    },

    clearError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    // Manejo de ubicaciones
    async loadLocationData() {
        try {
            const response = await fetch('/data/colombia.json');
            if (!response.ok) {
                throw new Error('Error cargando datos de ubicación');
            }
            return await response.json();
        } catch (error) {
            console.error('Error cargando datos de ubicación:', error);
            showErrorMessage('Error al cargar datos de ubicación');
            throw error;
        }
    },

    // Operaciones CRUD
    async eliminarAprendiz(id, tabla) {
        if (!confirm('¿Está seguro de que desea eliminar este aprendiz?')) {
            return;
        }

        try {
            const response = await fetch(`/admin/aprendiz/eliminar/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                await playSound(sonidos.exito);
                showSuccessMessage('Aprendiz eliminado correctamente');
                tabla.ajax.reload();
            } else {
                throw new Error(data.message || 'Error al eliminar el aprendiz');
            }
        } catch (error) {
            await playSound(sonidos.error);
            showErrorMessage(error.message);
        }
    },

    async manejarEdicionAprendiz(formulario, id) {
        try {
            if (!await this.validateForm(formulario)) return;

            const formData = new FormData(formulario);
            const datos = Object.fromEntries(formData);

            const response = await fetch(`/admin/aprendiz/actualizar/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const data = await response.json();

            if (data.success) {
                await playSound(sonidos.exito);
                showSuccessMessage('Aprendiz actualizado exitosamente');
                setTimeout(() => {
                    window.location.href = '/admin/listar-aprendices';
                }, 1500);
            } else {
                throw new Error(data.message || 'Error al actualizar');
            }
        } catch (error) {
            await playSound(sonidos.error);
            showErrorMessage(error.message);
        }
    },

    // Funcionalidades de tabla
    configurarTablaResponsiva() {
        const columnas = document.querySelectorAll('.table-resizable th');
        columnas.forEach(columna => {
            const redimensionador = document.createElement('div');
            redimensionador.className = 'resizer';
            columna.appendChild(redimensionador);

            this.configurarRedimensionColumna(columna, redimensionador);
        });
    },

    configurarRedimensionColumna(columna, redimensionador) {
        let posicionInicial, anchoInicial;

        redimensionador.addEventListener('mousedown', e => {
            posicionInicial = e.pageX;
            anchoInicial = columna.offsetWidth;

            document.addEventListener('mousemove', redimensionar);
            document.addEventListener('mouseup', detenerRedimension);
        });

        function redimensionar(e) {
            const diferencia = e.pageX - posicionInicial;
            columna.style.width = `${anchoInicial + diferencia}px`;
        }

        function detenerRedimension() {
            document.removeEventListener('mousemove', redimensionar);
            document.removeEventListener('mouseup', detenerRedimension);
        }
    },

    // Manejo de formularios
    async manejarEnvioFormulario(evento, tabla) {
        evento.preventDefault();
        const formulario = evento.target;

        if (!await this.validateForm(formulario)) {
            return;
        }

        try {
            const formData = new FormData(formulario);
            const response = await fetch(formulario.action, {
                method: formulario.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const data = await response.json();

            if (data.success) {
                await playSound(sonidos.exito);
                showSuccessMessage(data.message || 'Operación realizada con éxito');
                if (tabla) tabla.ajax.reload();

                if (data.redirect) {
                    setTimeout(() => window.location.href = data.redirect, 1500);
                }
            } else {
                throw new Error(data.message || 'Error en la operación');
            }
        } catch (error) {
            await playSound(sonidos.error);
            showErrorMessage(error.message);
        }
    },

    inicializar() {
        this.configurarTablaResponsiva();
        this.configurarEventosFormulario();

        // Inicializar selectores de ubicación si existe el formulario
        const formRegistro = document.getElementById('aprendizForm');
        if (formRegistro) {
            this.inicializarSelectoresUbicacion();
            // Configurar validaciones en tiempo real
            const fieldsToValidate = {
                correoElectronico: validaciones.esEmailValido,
                numeroDocumento: validaciones.esDocumentoValido,
                celular: validaciones.esTelefonoValido
            };

            Object.entries(fieldsToValidate).forEach(([fieldId, validationFn]) => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('blur', function() {
                        if (this.value && !validationFn(this.value)) {
                            utilidadesAdmin.showError(this, `${this.labels[0]?.textContent || 'Campo'} inválido`);
                        } else {
                            utilidadesAdmin.clearError(this);
                        }
                    });
                }
            });
        }
    },

    configurarEventosFormulario() {
        // Configuración general de formularios admin
        const formularios = document.querySelectorAll('form[data-tipo="admin"]');
        formularios.forEach(formulario => {
            formulario.addEventListener('submit', this.manejarEnvioFormulario.bind(this));
        });

        // Configuración específica para el formulario de edición
        const formEdicion = document.getElementById('editarAprendizForm');
        if (formEdicion) {
            formEdicion.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = window.location.pathname.split('/').pop();
                await this.manejarEdicionAprendiz(formEdicion, id);
            });
        }
    },

    async cargarContenido(seccion) {
        const contenedor = document.getElementById('contenidoPrincipal');
        if (!contenedor) return;

        try {
            const response = await fetch(`/admin/${seccion}`);
            if (!response.ok) throw new Error('Error al cargar el contenido');

            const html = await response.text();
            contenedor.innerHTML = html;
        } catch (error) {
            console.error('Error:', error);
            contenedor.innerHTML = '<p>Error al cargar el contenido.</p>';
            showErrorMessage('Error al cargar el contenido');
        }
    }
};

export default utilidadesAdmin;
