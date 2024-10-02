// server.js
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2/promise');
const helmet = require('helmet');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar la conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Se perdió la conexión a la base de datos.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('La base de datos tiene demasiadas conexiones.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('La conexión a la base de datos fue rechazada.');
    }
    return;
  }
  console.log('Conectado a la base de datos MySQL');
  connection.release();
});

// Manejo de errores en pool
pool.on('error', (err) => {
  console.error('Error inesperado en la pool de MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Se perdió la conexión a la base de datos. Reconectando...');
    // Implementar lógica para reconectar
  }
});

// Configuración de la sesión
const sessionStore = new MySQLStore({}, pool);

app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Cambiar a true si usas HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

  // Middleware de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": ["'self'", "https:", "data:", "blob:"],
        "script-src": ["'self'", "'unsafe-inline'", "https:", "data:"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https:"],
        "img-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", "https:"],
      },
    },
  }));

// Validaciones
const aprendizValidations = [
  body('nombres').notEmpty().withMessage('El nombre es obligatorio'),
  body('primerApellido').notEmpty().withMessage('El primer apellido es obligatorio'),
  body('tipoDocumento').isIn(['CC', 'TI', 'CE', 'PEP', 'PPT']).withMessage('Tipo de documento no válido'),
  body('numeroDocumento').notEmpty().withMessage('El número de documento es obligatorio'),
  body('fechaNacimiento').isDate().withMessage('Fecha de nacimiento no válida'),
  body('celular').notEmpty().withMessage('El número de celular es obligatorio'),
  body('direccion').notEmpty().withMessage('La dirección es obligatoria'),
  body('departamento').notEmpty().withMessage('El departamento es obligatorio'),
  body('municipio').notEmpty().withMessage('El municipio es obligatorio'),
  body('correoElectronico').isEmail().withMessage('Correo electrónico no válido'),
  body('numeroFicha').notEmpty().withMessage('El número de ficha es obligatorio'),
  body('programaFormacion').notEmpty().withMessage('El programa de formación es obligatorio'),
  body('alternativaSeleccionada').isIn(['contratoAprendizaje', 'pasantia', 'apoyoEntidades', 'vinculoLaboral', 'proyectosProductivos', 'monitoria', 'unidadesProductivas']).withMessage('Alternativa seleccionada no válida'),
];

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/submit-form',
    aprendizValidations,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      next();
    },
    async (req, res) => {
      const formData = req.body;

      try {
        const columns = Object.keys(formData).join(', ');
        const placeholders = Object.keys(formData).map(() => '?').join(', ');
        const values = Object.values(formData);

        const sqlQuery = `INSERT INTO aprendices (${columns}) VALUES (${placeholders})`;
        console.log('SQL Query:', sqlQuery);
        console.log('Values:', values);

        const [result] = await pool.query(sqlQuery, values);

        console.log('Datos insertados correctamente');
        console.log('Enviando respuesta:', { success: true, message: 'Formulario procesado con éxito', id: result.insertId });
        return res.status(200).json({
          success: true,
          message: 'Formulario procesado con éxito',
          id: result.insertId
        });
      } catch (err) {
        console.error('Error al insertar datos:', err);
        // Manejo más detallado del error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Ya existe un registro con estos datos', error: err.message });
        } else if (err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(500).json({ success: false, message: 'La tabla de aprendices no existe', error: err.message });
        } else {
          return res.status(500).json({ success: false, message: 'Error al procesar el formulario', error: err.message });
        }
      }
    }
);

      // Ruta para el panel principal del administrador
      app.get('/admin', (req, res) => {
        res.render('admin/dashboard');
      });

      // Ruta para verificar documentación
      app.get('/admin/verificarDocumentacion', (req, res) => {
        res.render('admin/verificarDocumentacion');
      });

      // Ruta para gestionar usuarios
      app.get('/admin/gestionarUsuarios', (req, res) => {
        res.render('admin/gestionarUsuarios');
      });

      // Ruta para cargar datos
      app.get('/admin/cargarDatos', (req, res) => {
        res.render('admin/cargarDatos');
      });

      // Ruta para manejar la solicitud de listar aprendices
      app.get('/admin/listar-aprendices', async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = 50; // número de registros por página
        const offset = (page - 1) * limit;

        try {
          const [countResult] = await pool.query('SELECT COUNT(*) as total FROM aprendices');
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);

            // Obtener programas de formación únicos
          const [programasResult] = await pool.query('SELECT DISTINCT programaFormacion FROM aprendices');
          const programasFormacion = programasResult.map(row => row.programaFormacion);

          // Obtener los aprendices para la página actual
          const [aprendices] = await pool.query('SELECT * FROM aprendices LIMIT ? OFFSET ?', [limit, offset]);
          
          res.render('admin/listar-aprendices', { 
            aprendices, 
            currentPage: page, 
            totalPages,
            totalRecords: total,
            limit,
            programasFormacion
          });
        } catch (err) {
          console.error('Error al obtener aprendices:', err);
          res.status(500).send('Error al obtener aprendices');
        }
      });

  // Ruta para ver detalles de un aprendiz
  app.get('/admin/aprendiz/:id', async (req, res) => {
    try {
        const [aprendiz] = await pool.query('SELECT * FROM aprendices WHERE id = ?', [req.params.id]);
        if (aprendiz.length === 0) {
            return res.status(404).send('Aprendiz no encontrado');
        }
        res.render('admin/ver-aprendiz', { aprendiz: aprendiz[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los detalles del aprendiz');
    }
});

    // Ruta para mostrar el formulario de edición de un aprendiz
    app.get('/admin/aprendiz/editar/:id', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM aprendices WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
          return res.status(404).send('Aprendiz no encontrado');
        }
        res.render('admin/editar-aprendiz', { aprendiz: rows[0] });
      } catch (err) {
        console.error('Error al obtener datos del aprendiz:', err);
        res.status(500).send('Error al obtener los datos del aprendiz para editar');
      }
    });
    app.post('/admin/aprendiz/editar/:id', async (req, res) => {
      console.log("Solicitud de edición recibida para el ID:", req.params.id);
      console.log("Datos recibidos:", req.body);
      try {
        const id = req.params.id;
        const updatedData = req.body;
        if (Object.keys(updatedData).length === 0) {
          return res.status(400).json({ success: false, error: 'No se proporcionaron datos para actualizar' });
        }
    
         // Mapeo de valores de alternativaSeleccionada
        const alternativaMapping = {
          'contrato': 'contratoAprendizaje',
          'pasantia': 'pasantia',
          'apoyo': 'apoyoEntidades',
          'vinculo': 'vinculoLaboral',
          'proyectos': 'proyectosProductivos',
          'monitoria': 'monitoria',
          'unidades': 'unidadesProductivas'
        };
        
        // Corregir el valor de alternativaSeleccionada si es necesario
        if (updatedData.alternativaSeleccionada) {
          updatedData.alternativaSeleccionada = alternativaMapping[updatedData.alternativaSeleccionada] || updatedData.alternativaSeleccionada;
        }

        // Convertir fechas al formato correcto para MySQL
        ['fechaNacimiento', 'fechaInicioFormacion', 'fechaInicioEtapa'].forEach(field => {
          if (updatedData[field]) {
            updatedData[field] = new Date(updatedData[field]).toISOString().split('T')[0];
          }
        });

        // Eliminar campos vacíos o undefined
        Object.keys(updatedData).forEach(key => 
          (updatedData[key] === '' || updatedData[key] === undefined) && delete updatedData[key]
        );

        // Verificar si hay datos para actualizar
        if (Object.keys(updatedData).length === 0) {
          return res.status(400).json({ success: false, error: 'No se proporcionaron datos para actualizar' });
        }

        const setClause = Object.keys(updatedData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updatedData), id];

        const sqlQuery = `UPDATE aprendices SET ${setClause} WHERE id = ?`;
        console.log('SQL Query:', sqlQuery);
        console.log('Values:', values);

        const [result] = await pool.query(sqlQuery, values);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, error: 'Aprendiz no encontrado' });
        }

        res.json({ success: true, message: 'Aprendiz actualizado con éxito' });
      } catch (err) {
        console.error('Error al actualizar aprendiz:', err);
        res.status(500).json({ success: false, error: 'Error al actualizar los datos del aprendiz: ' + err.message });
      }
    });

    // Ruta para eliminar un aprendiz
    app.delete('/admin/aprendiz/eliminar/:id', async (req, res) => {
      try {
          const [result]  = await pool.query('DELETE FROM aprendices WHERE id = ?', [req.params.id]);
          if (result.affectedRows === 0) {
              return res.status(404).json({ success: false, message: 'Aprendiz no encontrado' });
          }
          res.json({ success: true, message: 'Aprendiz eliminado con éxito' });
      } catch (err) {
          console.error('Error al eliminar aprendiz:', err);
          res.status(500).json({ success: false, message: 'Error al eliminar el aprendiz' });
      }
  });

    //Ruta para la búsqueda de aprendices
app.get('/admin/buscar-aprendices', async (req, res) => {
  try {
    const conditions = [];
    const params = [];

    if (req.query.nombre) {
      conditions.push('(nombres LIKE ? OR primerApellido LIKE ? OR segundoApellido LIKE ?)');
      const nombreParam = `%${req.query.nombre}%`;
      params.push(nombreParam, nombreParam, nombreParam);
    }

    if (req.query.documento) {
      conditions.push('numeroDocumento = ?');
      params.push(req.query.documento);
    }

    if (req.query.programaFormacion) {
      conditions.push('programaFormacion = ?');
      params.push(req.query.programaFormacion);
    }

    if (req.query.alternativaSeleccionada) {
      conditions.push('alternativaSeleccionada = ?');
      params.push(req.query.alternativaSeleccionada);
    }

    let query = 'SELECT * FROM aprendices';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

        console.log('Query:', query);
        console.log('Params:', params);

        const [rows] = await pool.query(query, params);
        console.log('Resultados:', rows.length);
        res.json(rows);
    } catch (err) {
        console.error('Error en la búsqueda:', err);
        res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

// Ruta para mostrar el formulario de creación de contraseña
app.get('/crear-password', (req, res) => {
  const email = req.query.email || '';
  res.render('partials/crear-password', { 
    title: 'Crear Contraseña - Sistema de Gestión de Etapa Productiva',
    email: email
  });
});

// Ruta para manejar la creación de contraseña
app.post('/crear-password', async (req, res) => {
  const { correoElectronico, password } = req.body;
  console.log('Recibida solicitud para crear contraseña:', req.body);

  try {
    // Verificar si el aprendiz existe
    const [aprendiz] = await pool.query('SELECT * FROM aprendices WHERE correoElectronico = ?', [correoElectronico]);

    if (aprendiz.length === 0) {
      return res.status(400).json({ success: false, message: 'No se encontró un aprendiz con ese correo electrónico' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del aprendiz
    await pool.query('UPDATE aprendices SET password = ? WHERE correoElectronico = ?', [hashedPassword, correoElectronico]);

    res.json({ success: true, message: 'Contraseña creada con éxito' });
  } catch (error) {
    console.error('Error al crear la contraseña:', error);
    res.status(500).json({ success: false, message: 'Error al crear la contraseña' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
console.log(`Servidor corriendo en http://localhost:${port}`);
});