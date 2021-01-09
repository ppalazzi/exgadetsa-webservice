/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('paperQueries')

module.exports = {

    getValidationPaperByAction: async (actionId, contractId, typeJob, actionResult) => {
        try {
            logger.info('buscando validaciones para la accion ' + actionId)

            const dbPool = await dbClient
            const result = await dbPool.request().input('actionId', sql.VarChar(20), actionId)
                .input('contractId', sql.VarChar(20), contractId)
                .input('typeJob', sql.VarChar(20), typeJob)
                .input('actionResult', sql.VarChar(20), actionResult)
                .query('SELECT ADICIONAL147 as Adicional,VPAPEL147 as Papel, NTAREA147 as Tarea ' +
                    'FROM T147_VALIDACION WHERE ACCION147=@actionId AND ' +
                    'CCONT147=@contractId AND TIPO_TRAB147=@typeJob AND ANOMA147=0  AND RESULTADO147=@actionResult')

            return result.recordset[0]
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para validaciones por accion ' +
                actionId + error.message)
        }
    }
}
