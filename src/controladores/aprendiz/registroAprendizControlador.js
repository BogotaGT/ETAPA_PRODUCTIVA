// Ruta: src/controladores/aprendiz/registroAprendizControlador.js
// Propósito: Maneja la lógica del registro inicial de aprendices

const { validationResult } = require('express-validator');
const consultasAprendiz = require('../../modelos/aprendiz/consultasAprendiz');
const { formatearRespuesta } = require('../../utilidades/formateoRespuestas');

async function registrarAprendiz(req, res) {
    try {
        console.log('Iniciando proceso de registro de aprendiz');

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Errores de validación encontrados:', errors.array());
            return formatearRespuesta(res, {
                success: false,
                status: 400,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        const datosAprendiz = req.body;

        // Verificar si el correo ya existe
        const aprendizExistente = await consultasAprendiz.buscarPorEmail(datosAprendiz.correoElectronico);
        if (aprendizExistente) {
            console.log('Correo ya registrado:', datosAprendiz.correoElectronico);
            return formatearRespuesta(res, {
                success: false,
                status: 400,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Insertar aprendiz en la base de datos
        const resultado = await consultasAprendiz.insertarAprendiz(datosAprendiz);
        console.log('Aprendiz registrado con ID:', resultado.id);

        // Inicializar sesión
        req.session.userEmail = datosAprendiz.correoElectronico;
        req.session.registroCompleto = true;

        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) {
                    console.error('Error al guardar la sesión:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log('Sesión guardada exitosamente');

        return formatearRespuesta(res, {
            success: true,
            status: 200,
            message: 'Aprendiz registrado exitosamente',
            data: {
                id: resultado.id,
                redirect: '/registro-exitoso'
            }
        });

    } catch (error) {
        console.error('Error en registrarAprendiz:', error);
        return formatearRespuesta(res, {
            success: false,
            status: 500,
            message: 'Error al registrar aprendiz',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    registrarAprendiz
};