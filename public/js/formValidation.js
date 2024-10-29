// public/js/formValidation.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('aprendizForm');

    // Definir los sonidos (asegúrese de que estos archivos existan)
    const successSound = new Audio('/sonidos/success.wav');
    const errorSound = new Audio('/sonidos/error.wav');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Formulario enviado');
        if (validateForm()) {
            submitForm();
        }
    });

    function validateForm() {
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

        // Validar correo electrónico
        const emailField = form.querySelector('#correoElectronico');
        if (emailField.value && !isValidEmail(emailField.value)) {
            isValid = false;
            showError(emailField, 'Ingrese un correo electrónico válido');
        }

        // Validar número de documento (solo números)
        const documentoField = form.querySelector('#numeroDocumento');
        if (documentoField.value && !/^\d+$/.test(documentoField.value)) {
            isValid = false;
            showError(documentoField, 'Ingrese solo números');
        }

        return isValid;
    }

    function showError(field, message) {
        clearError(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.classList.add('is-invalid');
        field.parentNode.appendChild(errorDiv);
    }

    function clearError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function submitForm() {
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());

        fetch('/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                return response.text(); // Cambiamos response.json() a response.text()
            })
            .then(text => {
                console.log('Response text:', text);
                try {
                    const data = JSON.parse(text);
                    console.log('Parsed data:', data);
                    if (data.success) {
                        showSuccessMessage('¡Registro exitoso! Redirigiendo para crear contraseña...');
                        if (data.redirect) {
                            console.log('Intentando redireccionar a:', data.redirect);
                            setTimeout(() => {
                                window.location.href = data.redirect;
                            }, 2000);
                        } else {
                            console.error('No se proporcionó URL de redirección');
                        }
                    } else {
                        showErrorMessage(data.message || 'Hubo un error al procesar el formulario. Por favor, inténtelo de nuevo.');
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    showErrorMessage('Hubo un error al procesar la respuesta del servidor. Por favor, inténtelo de nuevo.');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                showErrorMessage('Hubo un error al procesar la solicitud. Por favor, inténtelo de nuevo.');
            });
    }
    

    function showSuccessMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.textContent = message;
        form.parentNode.insertBefore(alertDiv, form);
        setTimeout(() => alertDiv.remove(), 5000); // Remover después de 5 segundos
    }

    function showErrorMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = message;
        form.parentNode.insertBefore(alertDiv, form);
        setTimeout(() => alertDiv.remove(), 5000); // Remover después de 5 segundos
    }

    // Cargar datos de departamentos y municipios
    let municipiosPorDepartamento = {};

    fetch('/data/colombia.json')
        .then(response => response.json())
        .then(data => {
            console.log('Datos cargados:', data);
            municipiosPorDepartamento = data.reduce((acc, dep) => {
                acc[dep.departamento] = dep.ciudades;
                return acc;
            }, {});

            const departamentoSelect = document.getElementById('departamento');
            const municipioSelect = document.getElementById('municipio');

            // Limpiar las opciones existentes
            departamentoSelect.innerHTML = '<option value="">Seleccione...</option>';

            // Llenar el select de departamentos
            Object.keys(municipiosPorDepartamento).forEach(departamento => {
                const option = document.createElement('option');
                option.value = departamento;
                option.textContent = departamento;
                departamentoSelect.appendChild(option);
            });

            departamentoSelect.addEventListener('change', function() {
                const departamento = this.value;
                municipioSelect.innerHTML = '<option value="">Seleccione...</option>';

                if (departamento && municipiosPorDepartamento[departamento]) {
                    municipiosPorDepartamento[departamento].forEach(function(municipio) {
                        const option = document.createElement('option');
                        option.value = municipio;
                        option.textContent = municipio;
                        municipioSelect.appendChild(option);
                    });
                }
            });
        })
        .catch(error => console.error('Error al cargar los datos:', error));
});