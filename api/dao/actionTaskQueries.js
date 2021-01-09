/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('actionTaskQueries')

module.exports = {

    getTaskByActionAndContract: async (actionId, contractId) => {
        try {
            logger.info('buscando validaciones para la accion ' + actionId)

            const dbPool = await dbClient
            const result = await dbPool.request().input('actionId', sql.VarChar(20), actionId)
                .input('contractId', sql.VarChar(20), contractId)
                .query('SELECT CTAREA005, CCONT005, DESC005, ACCION005 as ActionValue, NATU005,CVISITA005 as Cantidad,RMED005 ' +
                    'FROM M005_COD_TAREA WHERE CTAREA005=@actionId AND CCONT005=@contractId')

            return result.recordset[0]
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para tareas por accion ' +
                actionId + ' y contrato ' + contractId + error.message)
        }
    }
}
