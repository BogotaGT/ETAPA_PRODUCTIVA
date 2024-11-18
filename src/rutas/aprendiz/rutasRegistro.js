// Ruta: src/rutas/aprendiz/rutasRegistro.js
// Propósito: Define las rutas relacionadas con el registro y autenticación de aprendices

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const registroAprendizControlador = require('../../controladores/aprendiz/registroAprendizControlador');
const autenticacionControlador = require('../../controladores/aprendiz/autenticacionControlador');

// Middleware de verificación de sesión
const verificarSesion = (req, res, next) => {
    if (!req.session.userEmail) {
        console.log('Sesión no encontrada, redirigiendo al inicio');
        return res.redirect('/');
    }
    next();
};

// Validaciones para el formulario de registro
const validacionesRegistro = [
    body('nombres')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

    body('primerApellido')
        .trim()
        .notEmpty().withMessage('El primer apellido es obligatorio')
        .isLength({ min: 2 }).withMessage('El primer apellido debe tener al menos 2 caracteres'),

    body('segundoApellido')
        .trim()
        .optional(),

    body('tipoDocumento')
        .isIn(['CC', 'TI', 'CE', 'PEP', 'PPT'])
        .withMessage('Tipo de documento no válido'),

    body('numeroDocumento')
        .trim()
        .notEmpty().withMessage('El número de documento es obligatorio')
        .isNumeric().withMessage('El número de documento debe contener solo números'),

    body('fechaNacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isDate().withMessage('Fecha de nacimiento no válida'),

    body('celular')
        .trim()
        .notEmpty().withMessage('El número de celular es obligatorio')
        .isLength({ min: 10, max: 10 }).withMessage('El número de celular debe tener 10 dígitos')
        .isNumeric().withMessage('El número de celular debe contener solo números'),

    body('direccion')
        .trim()
        .notEmpty().withMessage('La dirección es obligatoria'),

    body('departamento')
        .trim()
        .notEmpty().withMessage('El departamento es obligatorio'),

    body('municipio')
        .trim()
        .notEmpty().withMessage('El municipio es obligatorio'),

    body('correoElectronico')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Correo electrónico no válido')
        .normalizeEmail(),

    body('numeroFicha')
        .trim()
        .notEmpty().withMessage('El número de ficha es obligatorio')
        .isNumeric().withMessage('El número de ficha debe contener solo números'),

    body('programaFormacion')
        .trim()
        .notEmpty().withMessage('El programa de formación es obligatorio')
        .isIn(['tecnoActividadFisica', 'tecnoEntrenamientoDeportivo'])
        .withMessage('Programa de formación no válido')
];

// Rutas
router.get('/', (req, res) => {
    res.render('aprendiz/index');
});

router.get('/registro-exitoso', verificarSesion, (req, res) => {
    res.render('aprendiz/registro-exitoso');
});

router.post('/submit-form', validacionesRegistro, registroAprendizControlador.registrarAprendiz);

router.get('/crear-password', verificarSesion, autenticacionControlador.mostrarFormularioPassword);

router.post('/crear-password', verificarSesion, autenticacionControlador.crearPassword);

module.exports = router;