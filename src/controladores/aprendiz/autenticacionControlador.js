// Ruta: src/controladores/aprendiz/autenticacionControlador.js
// Propósito: Maneja la autenticación y gestión de contraseñas de aprendices

const bcrypt = require('bcrypt');
const consultasAprendiz = require('../../modelos/aprendiz/consultasAprendiz');
const { formatearRespuesta } = require('../../utilidades/formateoRespuestas');

/**
 * Muestra el formulario de creación de contraseña
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
async function mostrarFormularioPassword(req, res) {
    try {
        const email = req.session.userEmail;

        if (!email) {
            return res.redirect('/');  // Redirigir al inicio si no hay email en sesión
        }

        const aprendiz = await consultasAprendiz.buscarPorEmail(email);

        if (!aprendiz) {
            return res.redirect('/');  // Redirigir al inicio si no se encuentra el aprendiz
        }

        if (aprendiz.password) {
            return res.redirect('/aprendiz/dashboard');  // Redirigir si ya tiene contraseña
        }

        res.render('parciales/crear-password', {
            email: email,
            aprendiz: aprendiz
        });

    } catch (error) {
        console.error('Error al mostrar formulario de contraseña:', error);
        res.render('parciales/error', {
            message: 'Error al cargar el formulario',
            error: {
                status: 500,
                description: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
            }
        });
    }
}

/**
 * Procesa la creación de contraseña
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
async function crearPassword(req, res) {
    try {
        const { correoElectronico, password } = req.body;

        if (!correoElectronico || !password) {
            return formatearRespuesta(res, {
                success: false,
                status: 400,
                message: 'Correo electrónico y contraseña son requeridos'
            });
        }

        const aprendiz = await consultasAprendiz.buscarPorEmail(correoElectronico);

        if (!aprendiz) {
            return formatearRespuesta(res, {
                success: false,
                status: 404,
                message: 'Aprendiz no encontrado'
            });
        }

        if (aprendiz.password) {
            return formatearRespuesta(res, {
                success: false,
                status: 400,
                message: 'El aprendiz ya tiene una contraseña establecida'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await consultasAprendiz.actualizarPassword(correoElectronico, hashedPassword);

        formatearRespuesta(res, {
            success: true,
            status: 200,
            message: 'Contraseña creada con éxito',
            data: {
                redirect: '/aprendiz/dashboard'
            }
        });

    } catch (error) {
        console.error('Error al crear contraseña:', error);
        formatearRespuesta(res, {
            success: false,
            status: 500,
            message: 'Error al crear la contraseña',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    mostrarFormularioPassword,
    crearPassword
};