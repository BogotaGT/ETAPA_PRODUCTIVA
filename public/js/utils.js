// Ruta: public/js/utils.js
// Propósito: Funciones de utilidad generales para toda la aplicación.
// Maneja mensajes, sonidos y validaciones básicas que se usan en múltiples partes.

const sonidos = {
    exito: new Audio('/sonidos/success.wav'),
    error: new Audio('/sonidos/error.wav')
};

// Sistema de mensajes
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const existingAlerts = messageContainer.querySelectorAll('.alert');
    existingAlerts.forEach(alert => {
        alert.classList.add('animate__fadeOut');
        setTimeout(() => alert.remove(), 500);
    });

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show animate__animated animate__fadeIn`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    messageContainer.appendChild(alertDiv);
    playSound(type === 'success' ? sonidos.exito : sonidos.error);

    if (type === 'success') {
        setTimeout(() => {
            alertDiv.classList.remove('animate__fadeIn');
            alertDiv.classList.add('animate__fadeOut');
            setTimeout(() => alertDiv.remove(), 500);
        }, 4500);
    }
}

// Funciones de mensaje específicas
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    if (typeof message === 'object') {
        message = message.message || 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
    }
    showMessage(message, 'danger');
}

// Sistema de sonidos
async function playSound(sound) {
    if (!sound || !sound.play) {
        console.warn('Sonido no disponible');
        return;
    }

    try {
        sound.currentTime = 0;
        await sound.play();
    } catch (error) {
        console.warn('Error reproduciendo sonido:', error);
    }
}

// Validaciones básicas
const validaciones = {
    esEmailValido: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    esDocumentoValido: (documento) => /^\d{8,12}$/.test(documento),
    esTelefonoValido: (telefono) => /^\d{7,10}$/.test(telefono),
    esFechaValida: (fecha) => !isNaN(Date.parse(fecha))
};

// Error handling global
window.addEventListener('error', function(e) {
    console.error('Error global:', e);
    showErrorMessage('Ha ocurrido un error en la aplicación');
});

// Exportación de funcionalidades
export {
    showMessage,
    showSuccessMessage,
    showErrorMessage,
    playSound,
    sonidos,
    validaciones
};