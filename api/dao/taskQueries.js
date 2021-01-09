/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('taskQueries')

module.exports = {

    retrieveTasksByUser: async (userId) => {
        try {
            logger.info('retrieveTasksByUser - Se ejecuta la consulta de tareas a la tabla C900_TAREAS.')
            const dbPool = await dbClient
            const result = await dbPool.request().input('input_parameter', sql.VarChar(20), userId)
                .query('SELECT TOP 200 CCONT900 as Tipo_Contrato_id, TIPO_TRAB900 as Tipo_Trabajo_id, CMOTIVO900 as Motivo_id, NGNF900 as Ngn_id, FE_EMISION900 as Fecha_Emision_id, ' +
					'T.TIPO_TRAB900 as Tipo_Trabajo, T.COPERARIO900 as Operario, M.DESC004 as Motivo, ' +
		    		'T.FVTO900 as Fecha_Vencimiento,T.POLIZA900 as Poliza,FUGA_AVISO900 as Fuga, AVISOR900 as Aviso, C.LATITUD012 as Latitud, C.LONGITUD012 as Longitud, T.NPARTE900 as Numero_Parte, ' +
					'T.FREMITO900 as Remito,APE_NOM900 as Nombre_Completo, TELEFONO900 as Telefono, ' +
		    		'T.NOMCALLE900 as Calle, T.NPUERTA900 as Numero_Puerta,T.AUSENTE900 as Ausente,T.ESC900 as Escalera, T.PISO900 as Piso, T.PUERTA900 as Puerta, ' +
					'T.ENTRE900 as Entre_Calle, PAR2.DESC802 as Localidad, T.COMPLEMENTO900 as Complemento, T.COMPLEMENTO2_900 as Complemento2, T.COMPLEMENTO3_900 as Complemento3, ' +
                    'ZM.NOM_APE016 as MatriculadoNombre, ZM.TELEFONO016 as MatriculadoTelefono, ZM.CELULAR016 as MatriculadoCelular, ' +
					'T.NMEDIDOR900 as Numero_Medidor, T.NRECORRIDO900 as Numero_Recorrido,T.CAPACIDAD900 as Capacidad, T.MARCA900 as Marca, T.LECTURA900 as Lectura, ' +
					'T.SITUACION900 as Situacion,PAR.DESC802 as Partido, ACTIV900 as Actividad, M.VISITA004 as Visita, T.FANULADO900 as Anulado FROM C900_TAREAS T INNER JOIN M004_MOTIVOS M ON T.CMOTIVO900 = M.CMOTIVO004 AND T.CCONT900 = M.CCONT004 ' +
                    'INNER JOIN Z016_MATRICULADO ZM ON T.MATRI900 = ZM.NMATRI016 ' +
					'LEFT OUTER JOIN Z012_CORDENADAS C ON T.POLIZA900 = C.POLIZA012 LEFT OUTER JOIN P802_PARAMETROS PAR ON PAR.CPARA802 = T.CPART900 and PAR.CTABLA802 = \'5\' ' +
                    'LEFT OUTER JOIN P802_PARAMETROS PAR2 ON PAR2.CPARA802 = T.CLOCA900 and PAR2.CTABLA802 = \'6\' WHERE T.COPERARIO900 = @input_parameter and T.FREALIZADO900 is NULL ORDER BY FVTO900 asc')
            return result.recordset
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para obtener tareas por usuario' + error.message)
        }
    },

    updateTask: async (task) => {
        logger.info('Actualizando Tarea con número de contrato : ' + task)
    },

    asssingCoordinates: async (coordinates) => {
        logger.info('Asignando coordenadas para la tarea con poliza ' + coordinates.poliza)

        const dbPool = await dbClient
        try {
            await dbPool.request().input('latitude', sql.Decimal(19,8), coordinates.latitude)
                .input('longitude', sql.Decimal(19,8), coordinates.longitude)
                .input('poliza', sql.VarChar(100), coordinates.poliza)
                .query('UPDATE Z012_CORDENADAS SET POLIZA012 = @poliza, LATITUD012 = @latitude, LONGITUD012=@longitude WHERE POLIZA012=@poliza')
        } catch (error) {
            logger.info('insertando una nueva coordenada ')

            await dbPool.request().input('latitude', sql.Decimal(19,8), coordinates.latitude)
                .input('longitude', sql.Decimal(19,8), coordinates.longitude)
                .input('poliza', sql.VarChar(100), coordinates.poliza)
                .query('INSERT INTO Z012_CORDENADAS (POLIZA012, LATITUD012, LONGITUD012) VALUES (@poliza, @latitude, @longitude)')
        }

    }
}
