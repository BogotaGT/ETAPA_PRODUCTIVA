// Ruta: src/utilidades/formateoFechas.js
// Propósito: Utilidades para el manejo y formateo de fechas en la aplicación

/**
 * Formatea una fecha para la base de datos (YYYY-MM-DD)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFechaParaDB(fecha) {
    if (!fecha) return null;
    const fechaObj = new Date(fecha);
    return fechaObj.toISOString().split('T')[0];
}

/**
 * Formatea una fecha para mostrar al usuario (DD/MM/YYYY)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFechaParaVista(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Válida si una fecha es válida
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} True si la fecha es válida
 */
function esFechaValida(fecha) {
    const fechaObj = new Date(fecha);
    return fechaObj instanceof Date && !isNaN(fechaObj);
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {Date|string} fechaNacimiento - Fecha de nacimiento
 * @returns {number} Edad calculada
 */
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad;
}

module.exports = {
    formatearFechaParaDB,
    formatearFechaParaVista,
    esFechaValida,
    calcularEdad
};