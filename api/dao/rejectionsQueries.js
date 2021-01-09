/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('rejectionsQueries')

module.exports = {

    getRejectiosByPartNumber: async (number) => {
        try {
            const dbPool = await dbClient
            const result = await dbPool.request().input('number', sql.VarChar(20), number)
                .query('SELECT COD_RE149 as Codigo FROM T149_COD_RECHAZO WHERE (TIPO_TRAB149 = N\'33\' OR TIPO_TRAB149 = N\'34\') ' +
                    'AND (FEC_REALI149 > - 180) AND (NPARTE149 = @number) GROUP BY COD_RE149')
            return result.recordset
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para traer códigod por número de parte' + error.message)
        }
    },

    storeRejections: async (poliza, dateEmition, jobType, ngnf, rejectionId, date) => {
        try {
            logger.info('Guardando códigos de rechazo para la poliza' + poliza + ' y ngnf ' + ngnf)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('dateEmition', sql.DateTime(), dateEmition)
                .input('jobType', sql.VarChar(20), jobType)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('rejectiondId', sql.VarChar(20), rejectionId)
                .input('date', sql.DateTime(), date)
                .query('INSERT INTO T149_COD_RECHAZO (CCONT149, NPARTE149,FE_EMISION149, TIPO_TRAB149, ' +
                    'NGNF149, COD_RE149,FEC_REALI149) VALUES (\'001\',@poliza,@dateEmition,@jobType,@ngnf,@rejectiondId,@date)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para traer códigos de rechazo' + error.message)
        }
    }
}
