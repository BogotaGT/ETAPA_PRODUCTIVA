// Ruta: src/servidor.js
// Propósito: Archivo principal del servidor con configuración básica y rutas principales

const express = require('express');
const { Request, Response, NextFunction } = require('express');
const path = require('path');
const { body } = require('express-validator');
const { pool, verifyDatabaseConnection } = require('./config/database');
const setupMiddlewares = require('./middlewares');
const rutasAprendiz = require('./rutas/aprendiz/rutasRegistro');
const rutasAprendices = require('./rutas/administrador/rutasAprendices');
const aprendizValidaciones = require('./validaciones/aprendizValidaciones');
require('dotenv').config();

// Variables iniciales
const app = express();
const port = process.env.PORT || 3000;
let server;
let dbConnected = false;
let isShuttingDown = false;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.wav')) {
      res.set('Content-Type', 'audio/wav');
    }
  }
}));

app.use('/data', express.static(path.join(__dirname, '../data')));

// Configuración de vistas
app.set('views', path.join(__dirname, '../vistas'));
app.set('view engine', 'ejs');

// Verificar variables de entorno requeridas
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME || !process.env.DB_PORT) {
  console.error('Error: Variables de entorno de base de datos no configuradas');
  process.exit(1);
}

// Configurar middlewares
if (typeof setupMiddlewares === 'function') {
  setupMiddlewares(app);
}

// Verificar conexión al iniciar
verifyDatabaseConnection()
    .then(connected => {
      if (!connected) {
        console.error('No se pudo establecer la conexión inicial con la base de datos');
        process.exit(1);
      }
      dbConnected = true;
      console.log('Conexión inicial a la base de datos establecida exitosamente');
    })
    .catch(error => {
      console.error('Error al verificar la conexión inicial:', error);
      process.exit(1);
    });

// Middleware de verificación de base de datos
const dbConnectionCheck = (req, res, next) => {
  if (!dbConnected) {
    res.status(503).render('parciales/error', {
      message: 'Servicio no disponible',
      error: {
        status: 503,
        description: 'Error de conexión con la base de datos'
      }
    });
    return;
  }
  next();
};

// Aplicar middleware de verificación de BD a todas las rutas
app.use(dbConnectionCheck);

// Rutas principales
app.get('/', (req, res) => {
  res.render('aprendiz/index');
});

// Aplicar rutas
app.use('/', rutasAprendiz);
app.use('/admin', rutasAprendices);

// Manejo de errores global
app.use((error, req, res, next) => {
  const statusCode = error?.status || 500;
  const errorMessage = error?.message || 'Error interno del servidor';

  console.error('Error no manejado:', error);

  return res.status(statusCode).render('parciales/error', {
    message: errorMessage,
    error: {
      status: statusCode,
      description: process.env.NODE_ENV === 'development' ?
          (error?.message || 'Error desconocido') :
          'Error interno'
    }
  });
});

// Inicialización del servidor
if (!module.parent) {
  server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });

  // Manejar errores del servidor
  server.on('error', (error) => {
    const errorDetails = {
      syscall: error.syscall,
      code: error.code,
      message: error.message
    };

    if (errorDetails.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port}`;

    switch (errorDetails.code) {
      case 'EACCES':
        console.error(`${bind} requiere privilegios elevados`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} ya está en uso`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
}

// Manejo de señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Función de cierre graceful
async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} recibido. Iniciando apagado graceful...`);

  try {
    await pool.end();
    console.log('Conexiones de base de datos cerradas');

    server.close(() => {
      console.log('Servidor HTTP cerrado');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forzando cierre después de 10s');
      process.exit(1);
    }, 10000);

  } catch (error) {
    console.error('Error durante el shutdown:', error);
    process.exit(1);
  }
}

module.exports = {
  app,
  server,
  pool,
  cleanup: gracefulShutdown
};