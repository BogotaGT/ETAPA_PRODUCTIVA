// Ruta: src/middlewares/index.js
// Propósito: Configuración de middlewares globales

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const { pool } = require('../config/database');

function setupMiddlewares(app) {
    // Middlewares básicos
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Configuración de sesión
    const sessionStore = new MySQLStore({
        clearExpired: true,
        checkExpirationInterval: 900000, // 15 minutos
        expiration: 86400000, // 24 horas
        createDatabaseTable: true,
        schema: {
            tableName: 'sessions',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        },
        // Configuración para manejar la serialización
        serialize: function(session) {
            try {
                return JSON.stringify(session);
            } catch (err) {
                console.error('Error serializando sesión:', err);
                return '{}';
            }
        },
        unserialize: function(sessionData) {
            try {
                return JSON.parse(sessionData);
            } catch (err) {
                console.error('Error deserializando sesión:', err);
                return {};
            }
        }
    }, pool);

    app.use(session({
        key: 'sena_session',
        secret: process.env.SESSION_SECRET || 'default_secret_key',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 horas
            sameSite: 'lax'
        }
    }));

    // Configuración de seguridad con Helmet
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://cdn.jsdelivr.net",
                    "https://cdn.datatables.net",
                    "https://code.jquery.com",
                    "https://cdnjs.cloudflare.com",
                    "https://cdn.jsdelivr.net"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.jsdelivr.net",
                    "https://cdn.datatables.net",
                    "https://cdnjs.cloudflare.com",
                    "https://cdn.jsdelivr.net"
                ],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: [
                    "'self'",
                    "https://cdn.datatables.net",
                    "https://cdnjs.cloudflare.com",
                    "https://cdn.jsdelivr.net"
                ],
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"]
            }
        }
    }));

    // Middleware de verificación de BD
    app.use(async (req, res, next) => {
        try {
            await pool.query('SELECT 1');
            next();
        } catch (error) {
            console.error('Error de conexión a la base de datos:', error);
            return res.status(503).render('parciales/error', {
                message: 'Servicio no disponible',
                error: {
                    status: 503,
                    description: 'Error de conexión con la base de datos'
                }
            });
        }
    });

    // Logging básico
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
        next();
    });

    // Manejo de errores global
    app.use((err, req, res, next) => {
        console.error('Error no manejado:', err);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    });
}

module.exports = setupMiddlewares;