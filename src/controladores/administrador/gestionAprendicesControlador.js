// Ruta: src/controladores/administrador/gestionAprendicesControlador.js
// Propósito: Controlador para la gestión de aprendices, delegando funcionalidades
// específicas a los servicios y utilidades correspondientes

const { pool } = require('../../config/database');
const { validationResult } = require('express-validator');
const { formatearFechaParaDB, formatearFechaParaVista } = require('../../utilidades/formateoFechas');
const { eliminarCamposVacios, mapearAlternativa } = require('../../utilidades/validacionCampos');
const { formatearRespuesta } = require('../../utilidades/formateoRespuestas');
const AprendizServicio = require('../../servicios/aprendizServicio');

// Instancia el servicio
const aprendizServicio = new AprendizServicio();

/**
 * Obtiene los datos de aprendices para DataTables
 */
async function obtenerDatosAprendices(req, res) {
    try {
        const { draw, start, length, search } = req.body;
        const resultado = await aprendizServicio.obtenerAprendicesDataTable(draw, start, length, search);
        return res.json(resultado);
    } catch (error) {
        console.error('Error al obtener datos de aprendices:', error);
        return formatearRespuesta(res, {
            success: false,
            status: 500,
            message: 'Error al obtener los datos de los aprendices',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Obtiene los detalles de un aprendiz específico
 */
async function verAprendiz(req, res) {
    try {
        const aprendiz = await aprendizServicio.obtenerAprendizPorId(req.params.id);

        if (!aprendiz) {
            return res.status(404).render('parciales/error', {
                message: 'Aprendiz no encontrado',
                error: {
                    status: 404,
                    description: 'No se encontró el aprendiz solicitado'
                }
            });
        }

        res.render('administrador/ver-aprendiz', { aprendiz });
    } catch (error) {
        console.error('Error al obtener detalles del aprendiz:', error);
        res.render('parciales/error', {
            message: 'Error al obtener detalles del aprendiz',
            error: {
                status: 500,
                description: error.message
            }
        });
    }
}

/**
 * Muestra el formulario de edición de un aprendiz
 */
async function editarAprendiz(req, res) {
    try {
        const aprendiz = await aprendizServicio.obtenerAprendizPorId(req.params.id);

        if (!aprendiz) {
            return res.render('parciales/error', {
                message: 'Aprendiz no encontrado',
                error: {
                    status: 404,
                    description: 'No se encontró el aprendiz'
                }
            });
        }

        res.render('administrador/editar-aprendiz', { aprendiz });
    } catch (error) {
        console.error('Error al obtener datos para edición:', error);
        res.render('parciales/error', {
            message: 'Error al obtener datos',
            error: {
                status: 500,
                description: error.message
            }
        });
    }
}

/**
 * Actualiza los datos de un aprendiz
 */
async function actualizarAprendiz(req, res) {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return formatearRespuesta(res, {
                success: false,
                status: 400,
                message: 'Errores de validación',
                errors: errores.array()
            });
        }

        const resultado = await aprendizServicio.actualizarAprendiz(req.params.id, req.body);
        return formatearRespuesta(res, resultado);
    } catch (error) {
        console.error('Error al actualizar aprendiz:', error);
        return formatearRespuesta(res, {
            success: false,
            status: 500,
            message: 'Error al actualizar los datos del aprendiz',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Elimina un aprendiz
 */
async function eliminarAprendiz(req, res) {
    try {
        const resultado = await aprendizServicio.eliminarAprendiz(req.params.id);
        return formatearRespuesta(res, resultado);
    } catch (error) {
        console.error('Error al eliminar aprendiz:', error);
        return formatearRespuesta(res, {
            success: false,
            status: 500,
            message: 'Error al eliminar el aprendiz',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    obtenerDatosAprendices,
    verAprendiz,
    editarAprendiz,
    actualizarAprendiz,
    eliminarAprendiz
};