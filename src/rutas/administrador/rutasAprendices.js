// Ruta: src/rutas/administrador/rutasAprendices.js
// Propósito: Define todas las rutas relacionadas con la gestión de aprendices en el área administrativa

const express = require('express');
const router = express.Router();
const gestionAprendicesControlador = require('../../controladores/administrador/gestionAprendicesControlador');
const aprendizValidaciones = require('../../validaciones/aprendizValidaciones');
const { validarSesionAdmin } = require('../../middlewares/autenticacion');

// Middleware de validación de sesión para todas las rutas
router.use(validarSesionAdmin);

// Rutas de vista
router.get('/dashboard', (req, res) => {
    res.render('administrador/dashboard', {
        titulo: 'Panel de Administración',
        userRole: 'admin'
    });
});

router.get('/listar-aprendices', (req, res) => {
    res.render('administrador/listar-aprendices', {
        titulo: 'Listado de Aprendices',
        userRole: 'admin'
    });
});

// Rutas de API para DataTables y operaciones CRUD
router.post('/aprendices/obtener-datos', gestionAprendicesControlador.obtenerDatosAprendices);

router.get('/aprendiz/:id',
    aprendizValidaciones.validarId,
    gestionAprendicesControlador.verAprendiz
);

router.get('/aprendiz/editar/:id',
    aprendizValidaciones.validarId,
    gestionAprendicesControlador.editarAprendiz
);

router.post('/aprendiz/actualizar/:id',
    aprendizValidaciones.validarId,
    aprendizValidaciones.validarActualizacion,
    gestionAprendicesControlador.actualizarAprendiz
);

router.delete('/aprendiz/eliminar/:id',
    aprendizValidaciones.validarId,
    gestionAprendicesControlador.eliminarAprendiz
);

// Rutas de filtros y búsqueda
router.get('/aprendices/buscar',
    aprendizValidaciones.validarFiltros,
    gestionAprendicesControlador.buscarAprendices
);

// Exportación del router
module.exports = router;