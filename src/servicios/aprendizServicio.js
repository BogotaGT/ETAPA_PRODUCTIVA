// Ruta: src/servicios/aprendizServicio.js
// Propósito: Lógica de negocio y operaciones con la base de datos para aprendices

const { pool } = require('../config/database');
const { formatearFechaParaDB, formatearFechaParaVista } = require('../utilidades/formateoFechas');
const { eliminarCamposVacios, mapearAlternativa } = require('../utilidades/validacionCampos');

class AprendizServicio {
    // Campos de fecha que requieren formateo
    #camposFecha = [
        'fechaNacimiento',
        'fechaInicioFormacion',
        'fechaInicioLectiva',
        'fechaFinLectiva',
        'fechaInicioProductiva',
        'fechaFinProductiva'
    ];

    /**
     * Formatea un registro de aprendiz para presentación
     */
    #formatearRegistroAprendiz(registro) {
        const registroFormateado = { ...registro };
        this.#camposFecha.forEach(campo => {
            if (registro[campo]) {
                registroFormateado[campo] = formatearFechaParaVista(registro[campo]);
            }
        });
        return registroFormateado;
    }

    /**
     * Obtiene datos paginados para DataTables
     */
    async obtenerAprendicesDataTable(draw, start, length, search) {
        // Implementar la lógica que estaba en obtenerDatosAprendices
    }

    /**
     * Obtiene un aprendiz por su ID
     */
    async obtenerAprendizPorId(id) {
        const [rows] = await pool.query('SELECT * FROM aprendices WHERE id = ?', [id]);
        if (!rows.length) return null;
        return this.#formatearRegistroAprendiz(rows[0]);
    }

    /**
     * Actualiza los datos de un aprendiz
     */
    async actualizarAprendiz(id, datos) {
        let datosActualizados = { ...datos };

        // Mapear alternativa si existe
        if (datosActualizados.alternativaSeleccionada) {
            datosActualizados.alternativaSeleccionada =
                mapearAlternativa(datosActualizados.alternativaSeleccionada);
        }

        // Formatear fechas
        this.#camposFecha.forEach(campo => {
            if (datosActualizados[campo]) {
                datosActualizados[campo] = formatearFechaParaDB(datosActualizados[campo]);
            }
        });

        // Eliminar campos vacíos
        datosActualizados = eliminarCamposVacios(datosActualizados);

        if (Object.keys(datosActualizados).length === 0) {
            return {
                success: false,
                status: 400,
                message: 'No hay datos válidos para actualizar'
            };
        }

        // Realizar actualización
        const setClause = Object.keys(datosActualizados)
            .map(key => `${key} = ?`)
            .join(', ');
        const valores = [...Object.values(datosActualizados), id];

        const [resultado] = await pool.query(
            `UPDATE aprendices SET ${setClause} WHERE id = ?`,
            valores
        );

        if (resultado.affectedRows === 0) {
            return {
                success: false,
                status: 404,
                message: 'Aprendiz no encontrado'
            };
        }

        return {
            success: true,
            status: 200,
            message: 'Aprendiz actualizado exitosamente'
        };
    }

    /**
     * Elimina un aprendiz
     */
    async eliminarAprendiz(id) {
        const [resultado] = await pool.query('DELETE FROM aprendices WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return {
                success: false,
                status: 404,
                message: 'Aprendiz no encontrado'
            };
        }

        return {
            success: true,
            status: 200,
            message: 'Aprendiz eliminado exitosamente'
        };
    }
}

module.exports = AprendizServicio;