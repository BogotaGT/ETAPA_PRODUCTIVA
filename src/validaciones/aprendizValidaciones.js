// Ruta: src/validaciones/aprendizValidaciones.js
// Propósito: Define todas las validaciones relacionadas con los datos de aprendices

const { body, param, query } = require('express-validator');

// Validaciones de campos básicos
const validacionesCamposBasicos = [
    body('nombres')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

    body('primerApellido')
        .trim()
        .notEmpty().withMessage('El primer apellido es obligatorio')
        .isLength({ min: 2 }).withMessage('El primer apellido debe tener al menos 2 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),

    body('segundoApellido')
        .trim()
        .optional()
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),

    body('tipoDocumento')
        .isIn(['CC', 'TI', 'CE', 'PEP', 'PPT'])
        .withMessage('Tipo de documento no válido'),

    body('numeroDocumento')
        .trim()
        .notEmpty().withMessage('El número de documento es obligatorio')
        .isNumeric().withMessage('El número de documento debe contener solo números')
        .isLength({ min: 8, max: 22 }).withMessage('El número de documento debe tener entre 8 y 22 dígitos'),

    body('fechaNacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isDate().withMessage('Fecha de nacimiento no válida')
        .custom(value => {
            const fechaNac = new Date(value);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fechaNac.getFullYear();
            return edad >= 10;
        }).withMessage('Debe ser mayor de 10 años'),

    body('celular')
        .trim()
        .notEmpty().withMessage('El número de celular es obligatorio')
        .isLength({ min: 10, max: 10 }).withMessage('El número de celular debe tener 10 dígitos')
        .isNumeric().withMessage('El número de celular debe contener solo números')
];

// Validaciones de ubicación
const validacionesUbicacion = [
    body('direccion')
        .trim()
        .notEmpty().withMessage('La dirección es obligatoria')
        .isLength({ min: 5 }).withMessage('La dirección debe tener al menos 5 caracteres'),

    body('departamento')
        .trim()
        .notEmpty().withMessage('El departamento es obligatorio'),

    body('municipio')
        .trim()
        .notEmpty().withMessage('El municipio es obligatorio'),

    body('barrio')
        .trim()
        .optional()
        .isLength({ min: 3 }).withMessage('El barrio debe tener al menos 3 caracteres')
];

// Validaciones de contacto y formación
const validacionesContactoFormacion = [
    body('correoElectronico')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Correo electrónico no válido')
        .normalizeEmail(),

    body('numeroFicha')
        .trim()
        .notEmpty().withMessage('El número de ficha es obligatorio')
        .isNumeric().withMessage('El número de ficha debe contener solo números')
        .isLength({ min: 7, max: 7 }).withMessage('El número de ficha debe tener 7 dígitos'),

    body('programaFormacion')
        .trim()
        .notEmpty().withMessage('El programa de formación es obligatorio')
        .isIn(['tecnoActividadFisica', 'tecnoEntrenamientoDeportivo'])
        .withMessage('Programa de formación no válido')
];

// Validaciones de etapa productiva
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

    body('empresaPatrocinadora')
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage('El nombre de la empresa debe tener al menos 3 caracteres'),

    body('correoEmpresa')
        .optional()
        .trim()
        .isEmail().withMessage('Correo de empresa no válido'),

    body('telefonoEmpresa')
        .optional()
        .trim()
        .matches(/^\d{7,15}$/).withMessage('Teléfono de empresa no válido'),

    body('direccionEmpresa')
        .optional()
        .trim()
        .isLength({ min: 5 }).withMessage('La dirección de la empresa debe tener al menos 5 caracteres'),

    body('jefeInmediato')
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage('El nombre del jefe inmediato debe tener al menos 3 caracteres')
];

// Validaciones de fechas
const validacionesFechas = [
    body('fechaInicioFormacion')
        .optional()
        .isDate().withMessage('Fecha de inicio de formación no válida'),

    body('fechaInicioLectiva')
        .optional()
        .isDate().withMessage('Fecha de inicio de etapa lectiva no válida'),

    body('fechaFinLectiva')
        .optional()
        .isDate().withMessage('Fecha de fin de etapa lectiva no válida')
        .custom((value, { req }) => {
            if (value && req.body.fechaInicioLectiva) {
                return new Date(value) > new Date(req.body.fechaInicioLectiva);
            }
            return true;
        }).withMessage('La fecha de fin lectiva debe ser posterior a la fecha de inicio'),

    body('fechaInicioProductiva')
        .optional()
        .isDate().withMessage('Fecha de inicio de etapa productiva no válida'),

    body('fechaFinProductiva')
        .optional()
        .isDate().withMessage('Fecha de fin de etapa productiva no válida')
        .custom((value, { req }) => {
            if (value && req.body.fechaInicioProductiva) {
                return new Date(value) > new Date(req.body.fechaInicioProductiva);
            }
            return true;
        }).withMessage('La fecha de fin productiva debe ser posterior a la fecha de inicio')
];

// Validaciones para parámetros de ruta
const validarId = [
    param('id')
        .isInt()
        .withMessage('ID no válido')
];

// Validaciones para filtros de búsqueda
const validarFiltros = [
    query('nombre')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El término de búsqueda debe tener al menos 2 caracteres'),

    query('documento')
        .optional()
        .trim()
        .isNumeric()
        .withMessage('Número de documento no válido'),

    query('programaFormacion')
        .optional()
        .isIn(['tecnoActividadFisica', 'tecnoEntrenamientoDeportivo'])
        .withMessage('Programa de formación no válido'),

    query('alternativaSeleccionada')
        .optional()
        .isIn([
            'contratoAprendizaje',
            'pasantia',
            'apoyoEntidades',
            'vinculoLaboral',
            'proyectosProductivos',
            'monitoria',
            'unidadesProductivas'
        ])
        .withMessage('Alternativa no válida')
];

// Validaciones para actualización
const validarActualizacion = [
    ...validacionesCamposBasicos,
    ...validacionesUbicacion,
    ...validacionesContactoFormacion,
    ...validacionesEtapaProductiva,
    ...validacionesFechas
];

// Exportar todas las validaciones
module.exports = {
    validacionesCamposBasicos,
    validacionesUbicacion,
    validacionesContactoFormacion,
    validacionesEtapaProductiva,
    validacionesFechas,
    validarId,
    validarFiltros,
    validarActualizacion
};