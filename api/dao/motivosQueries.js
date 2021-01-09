/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('motivosQueries')

module.exports = {

    getMotivosByActionAndContract: async (actionId, contractId) => {
        try {
            logger.info('buscando motivos by action' + actionId + ' y contract : ' + contractId)

            const dbPool = await dbClient
            const result = await dbPool.request().input('actionId', sql.VarChar(20), actionId)
                .input('contractId', sql.VarChar(20), contractId)
                .query('SELECT CCONT004, CMOTIVO004, RMED004, VISITA004 as Visita FROM M004_MOTIVOS' +
                    ' WHERE CMOTIVO004=@actionId and CCONT004=@contractId')

            return result.recordset[0]
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para traer motivos por accion ' +
                actionId + ' y contrato ' + contractId + error.message)
        }
    },

    getNewReason: async (contractId, action, jobType) => {
        try {
            logger.info('Trayendo nuevos motivos por action ' + action + ' y contrato ' + contractId +
                ' y tipo de trabajo ' + jobType)

            const dbPool = await dbClient
            const result = await dbPool.request().input('action', sql.VarChar(20), action)
                .input('contractId', sql.VarChar(20), contractId)
                .input('jobType', sql.VarChar(20), jobType)
                .query('SELECT NMOTIVO118 as Motivo FROM T118_CAMBIO_MOTIVO WHERE ' +
                    'CCONT118=@contractId AND CTAREA118=@action and CMOTIVO118=@jobType')

            return result.recordset[0]
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para obtener nuevas razones' + error.message)
        }
    }
}
