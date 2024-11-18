// Ruta: src/utilidades/formateoRespuestas.js
// Propósito: Estandarizar el formato de respuestas HTTP en la aplicación

/**
 * Formatea una respuesta HTTP
 * @param {Object} res - Objeto de respuesta Express
 * @param {Object} options - Opciones de formato
 * @param {boolean} options.success - Indica si la operación fue exitosa
 * @param {number} options.status - Código de estado HTTP
 * @param {string} options.message - Mensaje descriptivo
 * @param {Object} [options.data] - Datos adicionales
 * @param {Object} [options.error] - Información del error
 */
function formatearRespuesta(res, { success, status = 200, message, data, error }) {
    const respuesta = {
        success,
        message,
        timestamp: new Date().toISOString()
    };

    if (data) {
        respuesta.data = data;
    }

    if (error && process.env.NODE_ENV === 'development') {
        respuesta.error = error;
    }

    return res.status(status).json(respuesta);
}

/**
 * Formatea un mensaje de error
 * @param {Error} error - Objeto de error
 * @param {string} mensajeDefecto - Mensaje por defecto
 * @returns {Object} Error formateado
 */
function formatearError(error, mensajeDefecto = 'Error interno del servidor') {
    return {
        mensaje: process.env.NODE_ENV === 'development' ? error.message : mensajeDefecto,
        codigo: error.code || 'ERROR_INTERNO',
        detalles: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
}

module.exports = {
    formatearRespuesta,
    formatearError
};