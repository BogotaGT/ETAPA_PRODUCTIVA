// Ruta: src/utilidades/validacionCampos.js
// Propósito: Utilidades para validación y limpieza de campos de formularios

/**
 * Elimina campos vacíos de un objeto
 * @param {Object} objeto - Objeto a limpiar
 * @returns {Object} Objeto sin campos vacíos
 */
function eliminarCamposVacios(objeto) {
    const objetoLimpio = {};
    Object.keys(objeto).forEach(key => {
        if (objeto[key] !== null && objeto[key] !== undefined && objeto[key] !== '') {
            objetoLimpio[key] = objeto[key];
        }
    });
    return objetoLimpio;
}

/**
 * Sanitiza campos de texto
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
function sanitizarTexto(texto) {
    if (!texto) return '';
    return texto
        .trim()
        .replace(/[<>]/g, '') // Elimina < y >
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Válida un correo electrónico
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} True si el correo es válido
 */
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}

/**
 * Mapea valores de alternativa de etapa productiva
 * @param {string} alternativa - Alternativa a mapear
 * @returns {string} Alternativa mapeada
 */
const mapeoAlternativas = {
    'contrato': 'contratoAprendizaje',
    'pasantia': 'pasantia',
    'apoyo': 'apoyoEntidades',
    'vinculo': 'vinculoLaboral',
    'proyectos': 'proyectosProductivos',
    'monitoria': 'monitoria',
    'unidades': 'unidadesProductivas'
};

function mapearAlternativa(alternativa) {
    return mapeoAlternativas[alternativa] || alternativa;
}

module.exports = {
    eliminarCamposVacios,
    sanitizarTexto,
    validarEmail,
    mapearAlternativa,
    mapeoAlternativas
};