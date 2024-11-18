// Ruta: public/js/crearPassword.js
// Propósito: Maneja la validación y envío del formulario de creación de contraseña

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('crearPasswordForm');
    let successSound, errorSound;

    // Inicializar sonidos
    function initSounds() {
        try {
            successSound = new Audio('/sonidos/success.wav');
            errorSound = new Audio('/sonidos/error.wav');
            successSound.load();
            errorSound.load();
        } catch (error) {
            console.warn('No se pudieron cargar los archivos de sonido:', error);
        }
    }

    function validatePassword(password) {
        // Mínimo 8 caracteres, al menos una letra y un número
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        const correoElectronico = form.querySelector('#correoElectronico').value;

        // Validar contraseña
        if (!validatePassword(password)) {
            showErrorMessage('La contraseña debe tener al menos 8 caracteres, una letra y un número');
            await playSound(errorSound);
            return;
        }

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            showErrorMessage('Las contraseñas no coinciden');
            await playSound(errorSound);
            return;
        }

        try {
            const response = await fetch('/crear-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correoElectronico,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear la contraseña');
            }

            if (!data.success) {
                showErrorMessage(data.message || 'Error al crear la contraseña');
                await playSound(errorSound);
                return;
            }

            // Mostrar mensaje de éxito y reproducir sonido
            showSuccessMessage('¡Contraseña creada exitosamente! Redirigiendo...');
            await playSound(successSound);

            // Redirigir después de mostrar el mensaje
            setTimeout(() => {
                window.location.href = data.data?.redirect || '/aprendiz/dashboard';
            }, 1500);

        } catch (error) {
            console.error('Error:', error);
            showErrorMessage('Error al procesar la solicitud');
            await playSound(errorSound);
        }
    }

    // Event listeners
    form.addEventListener('submit', handleSubmit);

    // Inicialización
    initSounds();
});