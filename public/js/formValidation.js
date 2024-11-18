// Ruta: public/js/formValidation.js
// Propósito: Maneja la validación y envío del formulario de registro de aprendices.
// Incluye validaciones en tiempo real, manejo de errores, integración con la API
// y retroalimentación visual y auditiva para el usuario.

document.addEventListener('DOMContentLoaded', async function() {
    // Referencias a elementos del DOM
    const form = document.getElementById('aprendizForm');
    const departamentoSelect = document.getElementById('departamento');
    const municipioSelect = document.getElementById('municipio');

    // Función principal de validación
    async function validateForm() {
        let isValid = true;

        // Validar campos obligatorios
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                showError(field, 'Este campo es obligatorio');
            } else {
                clearError(field);
            }
        });

        // Validaciones específicas por tipo de campo
        const emailField = form.querySelector('#correoElectronico');
        if (emailField && emailField.value && !validaciones.esEmailValido(emailField.value)) {
            isValid = false;
            showError(emailField, 'Correo electrónico inválido');
        }

        const documentoField = form.querySelector('#numeroDocumento');
        if (documentoField && documentoField.value && !validaciones.esDocumentoValido(documentoField.value)) {
            isValid = false;
            showError(documentoField, 'Número de documento inválido (8-12 dígitos)');
        }

        const celularField = form.querySelector('#celular');
        if (celularField && celularField.value && !validaciones.esTelefonoValido(celularField.value)) {
            isValid = false;
            showError(celularField, 'Número de celular inválido (10 dígitos)');
        }

        // Validar fechas
        const fechasFields = ['fechaNacimiento', 'fechaInicioFormacion', 'fechaInicioLectiva', 'fechaFinLectiva'];
        fechasFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field && field.value && !validaciones.esFechaValida(field.value)) {
                isValid = false;
                showError(field, 'Fecha inválida');
            }
        });

        if (!isValid) {
            showErrorMessage('Por favor, corrija los errores en el formulario');
            await reproducirSonido('error');
        }

        return isValid;
    }

    // Función para mostrar errores en campos específicos
    function showError(field, message) {
        clearError(field);
        field.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // Función para limpiar errores de campos
    function clearError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Función para enviar el formulario
    async function submitForm() {
        try {
            const formData = new FormData(form);
            const response = await fetch('/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Registro exitoso');
                await reproducirSonido('exito');

                // Redirección después de un registro exitoso
                setTimeout(() => {
                    window.location.href = data.redirect || '/registro-exitoso';
                }, 1500);
            } else {
                throw new Error(data.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error en submitForm:', error);
            showErrorMessage(error.message || 'Error al procesar el formulario');
            await reproducirSonido('error');
        }
    }

    // Función para cargar datos de ubicación
    async function loadLocationData() {
        try {
            const response = await fetch('/data/colombia.json');
            if (!response.ok) {
                throw new Error('Error cargando datos de ubicación');
            }

            const data = await response.json();

            // Configurar select de departamentos
            departamentoSelect.innerHTML = '<option value="">Seleccione...</option>';
            data.forEach(item => {
                if (item && item.departamento) {
                    const option = document.createElement('option');
                    option.value = item.departamento;
                    option.textContent = item.departamento;
                    departamentoSelect.appendChild(option);
                }
            });

            // Event listener para cambios en departamento
            departamentoSelect.addEventListener('change', function() {
                const selectedDep = this.value;
                municipioSelect.innerHTML = '<option value="">Seleccione un municipio...</option>';

                if (!selectedDep) return;

                const departamento = data.find(d => d.departamento === selectedDep);
                if (departamento && Array.isArray(departamento.ciudades)) {
                    departamento.ciudades.forEach(ciudad => {
                        const option = document.createElement('option');
                        option.value = ciudad;
                        option.textContent = ciudad;
                        municipioSelect.appendChild(option);
                    });
                }
            });
        } catch (error) {
            console.error('Error cargando datos de ubicación:', error);
            showErrorMessage('Error al cargar datos de ubicación');
        }
    }

    // Validaciones en tiempo real para campos específicos
    const fieldsToValidate = {
        correoElectronico: (value) => validaciones.esEmailValido(value),
        numeroDocumento: (value) => validaciones.esDocumentoValido(value),
        celular: (value) => validaciones.esTelefonoValido(value)
    };

    // Agregar validaciones en tiempo real
    Object.entries(fieldsToValidate).forEach(([fieldId, validationFn]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                if (this.value && !validationFn(this.value)) {
                    showError(this, `${this.labels[0]?.textContent || 'Campo'} inválido`);
                } else {
                    clearError(this);
                }
            });
        }
    });

    // Event listener principal para el formulario
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (await validateForm()) {
            await submitForm();
        }
    });

    // Inicialización
    try {
        await loadLocationData();
    } catch (error) {
        console.error('Error en la inicialización:', error);
        showErrorMessage('Error al cargar datos iniciales');
    }
});