// Ruta: src/rutas/aprendiz/rutasEtapaProductiva.js
// Propósito: Define las rutas relacionadas con la gestión de la etapa productiva del aprendiz

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Validaciones para el formulario de etapa productiva
const validacionesEtapaProductiva = [
    body('alternativaSeleccionada')
        .isIn([
            'contratoAprendizaje',
            'pasantia',
            'apoyoEntidades',
            'vinculoLaboral',
            'proyectosProductivos',
            'monitoria',
            'unidadesProductivas'
        ])
        .withMessage('Alternativa seleccionada no válida'),

    body('areaFormacion')
        .isIn(['si', 'no'])
        .withMessage('Valor no válido para área de formación'),

    body('fechaInicioProductiva')
        .optional()
        .isDate()
        .withMessage('Fecha de inicio no válida'),

    body('fechaFinProductiva')
        .optional()
        .isDate()
        .withMessage('Fecha de fin no válida'),

    body('empresaPatrocinadora')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Nombre de empresa muy corto'),

    body('correoEmpresa')
        .optional()
        .isEmail()
        .withMessage('Correo de empresa no válido'),

    body('telefonoEmpresa')
        .optional()
        .matches(/^\d{7,10}$/)
        .withMessage('Teléfono de empresa no válido'),

    body('celularEmpresa')
        .optional()
        .matches(/^\d{10}$/)
        .withMessage('Celular de empresa no válido')
];

// Agregar nueva ruta para la página de éxito
router.get('/registro-exitoso', (req, res) => {
    res.render('aprendiz/registro-exitoso');
});

// Mantener las rutas existentes y agregar la nueva
router.post('/actualizar-etapa', validacionesEtapaProductiva, etapaProductivaControlador.actualizarEtapa);
router.get('/estado', etapaProductivaControlador.obtenerEstado);
router.post('/subir-documento', etapaProductivaControlador.subirDocumento);

module.exports = router;