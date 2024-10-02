// crearPassword.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('crearPasswordForm');
    const successSound = new Howl({
        src: ['/sonidos/success.wav']
    });
    const errorSound = new Howl({
        src: ['/sonidos/error.wav']
    });

    // Prellenar el campo de correo electrónico si está disponible en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        document.getElementById('correoElectronico').value = decodeURIComponent(email);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (validateForm()) {
            submitForm();
        }
    });

    function validateForm() {
        let isValid = true;

        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                showError(field, 'Este campo es obligatorio');
            } else {
                clearError(field);
            }
        });

        const emailField = form.querySelector('#correoElectronico');
        if (emailField.value && !isValidEmail(emailField.value)) {
            isValid = false;
            showError(emailField, 'Ingrese un correo electrónico válido');
        }

        const passwordField = form.querySelector('#password');
        const confirmPasswordField = form.querySelector('#confirmPassword');
        if (passwordField.value !== confirmPasswordField.value) {
            isValid = false;
            showError(confirmPasswordField, 'Las contraseñas no coinciden');
        }

        if (!isValid) {
            errorSound.play();
        }

        return isValid;
    }

    function showError(field, message) {
        clearError(field);
        field.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback animate__animated animate__shakeX';
        errorDiv.textContent = message;
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
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function submitForm() {
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());

        fetch('/crear-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            if (data.success) {
                showSuccessMessage('¡Contraseña creada con éxito! Redirigiendo al inicio de sesión...');
                successSound.play();
                form.reset();
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                showErrorMessage(data.message || 'Hubo un error al crear la contraseña. Por favor, inténtelo de nuevo.');
                errorSound.play();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage('Hubo un error al procesar la solicitud. Por favor, inténtelo de nuevo.');
            errorSound.play();
        });
    }

    function showSuccessMessage(message) {
        showMessage(message, 'success');
    }

    function showErrorMessage(message) {
        showMessage(message, 'danger');
    }

    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} mt-3 animate__animated animate__fadeIn`;
        alertDiv.textContent = message;
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.innerHTML = '';
        messageContainer.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.classList.remove('animate__fadeIn');
            alertDiv.classList.add('animate__fadeOut');
            setTimeout(() => alertDiv.remove(), 500);
        }, 4500);
    }
});





