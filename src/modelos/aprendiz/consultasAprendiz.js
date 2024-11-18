// Ruta: src/modelos/aprendiz/consultasAprendiz.js
// Propósito: Contiene todas las consultas SQL relacionadas con los aprendices

const { pool } = require('../../config/database');

/**
 * Inserta un nuevo aprendiz en la base de datos
 * @param {Object} datosAprendiz - Datos del aprendiz a insertar
 * @returns {Promise} Resultado de la inserción
 */
async function insertarAprendiz(datosAprendiz) {
    const columns = Object.keys(datosAprendiz).join(', ');
    const placeholders = Object.keys(datosAprendiz).map(() => '?').join(', ');
    const values = Object.values(datosAprendiz);

    const query = `INSERT INTO aprendices (${columns}) VALUES (${placeholders})`;

    try {
        const [result] = await pool.query(query, values);
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error('Error al insertar aprendiz:', error);
        throw error;
    }
}

/**
 * Busca un aprendiz por su correo electrónico
 * @param {string} email - Correo electrónico del aprendiz
 * @returns {Promise} Datos del aprendiz
 */
async function buscarPorEmail(email) {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM aprendices WHERE correoElectronico = ?',
            [email]
        );
        return rows[0];
    } catch (error) {
        console.error('Error al buscar aprendiz por email:', error);
        throw error;
    }
}

/**
 * Actualiza la contraseña de un aprendiz
 * @param {string} email - Correo electrónico del aprendiz
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise} Resultado de la actualización
 */
async function actualizarPassword(email, hashedPassword) {
    try {
        const [result] = await pool.query(
            'UPDATE aprendices SET password = ? WHERE correoElectronico = ?',
            [hashedPassword, email]
        );
        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw error;
    }
}

module.exports = {
    insertarAprendiz,
    buscarPorEmail,
    actualizarPassword
};