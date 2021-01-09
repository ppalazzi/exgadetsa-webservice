/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('acometidasQueries')

module.exports = {

    notifyAcometida: async (poliza, date, jobType, reason, dateDone, ngnf, codOperario, observations, pipe, resultado,
                            firmo, conforme, aclaracion, dni) => {
        logger.info('Guardando la acometida para la poliza ' + poliza + ' y operario ' + codOperario)

        let pipeSizeExternalId = (pipe && pipe.pipeSizeExternalId) ? pipe.pipeSizeExternalId : ''
        let pipeExternalId = (pipe && pipe.pipeExternalId) ? pipe.pipeExternalId : ''
        let serviceSizeParameter = (pipe && pipe.serviceSizeParameter) ? pipe.serviceSizeParameter : ''
        let serviceParameter = (pipe && pipe.serviceParameter) ? pipe.serviceParameter : ''

        const dbPool = await dbClient
        const result = await dbPool.request().input('poliza', sql.VarChar(20), poliza)
            .input('date', sql.DateTime(), date)
            .input('jobType', sql.VarChar(20), jobType)
            .input('reason', sql.VarChar(20), reason)
            .input('datedone', sql.DateTime(), dateDone)
            .input('ngnf', sql.VarChar(20), ngnf)
            .input('codOperario', sql.VarChar(20), codOperario)
            .input('observations', sql.VarChar(20), observations)
            .input('dim_cm', sql.VarChar(20), pipeSizeExternalId)
            .input('mat_cm', sql.VarChar(20), pipeExternalId)
            .input('dim_ser', sql.VarChar(20), serviceSizeParameter)
            .input('mat_ser', sql.VarChar(20), serviceParameter)
            .input('resultado', sql.VarChar(20), resultado)
            .input('firmo', sql.VarChar(20), firmo)
            .input('conforme', sql.VarChar(20), conforme)
            .input('aclaracion', sql.VarChar(20), aclaracion)
            .input('dni', sql.VarChar(20), dni)
            .query('INSERT INTO C904_ACOMETIDA (CCONT904,TIPO_TRAB904,FE_EMISION904,NGNF904,NPARTE904,CMOTIVO904,' +
                'FREALIZADO904,CODOP904,DIMCM904,MATCM904,DIMACO904,MATACO904,OBS904,REALIZO904,FIRMO904,CONFORME904,ACLARACION904,DNI904)' +
                ' VALUES (\'004\',@jobType,@date,@ngnf,@poliza,@reason,@datedone,@codOperario,@dim_cm,@mat_cm,' +
                '@dim_ser,@mat_ser,@observations,@resultado,@firmo, @conforme, @aclaracion, @dni)')

        if (result.rowsAffected[0]) {
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('datedone', sql.DateTime(), dateDone)
                .input('codOperario', sql.VarChar(20), codOperario)
                .input('jobType', sql.VarChar(20), jobType)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('date', sql.DateTime(), date)
                .query('UPDATE C900_TAREAS SET FREALIZADO900=@datedone, COPERARIO900=@codOperario,AUSENTE900=AUSENTE900+1 ' +
                    'WHERE NPARTE900=@poliza AND TIPO_TRAB900=@jobType AND FREALIZADO900 IS NULL AND CCONT900=\'004\' AND NGNF900 = @ngnf AND FE_EMISION900=@date')
        }
    },

    addAusentChangeReason: async (poliza, newReason, reason, date, obs, ngnf, contract) => {
        logger.info('Agregando ausente y cambiando el motivo a uno nuevo para poliza {} y ngnf {} ', poliza, ngnf)

        const dbPool = await dbClient
        await dbPool.request().input('poliza', sql.VarChar(20), poliza)
            .input('newReason', sql.VarChar(20) ,newReason)
            .input('reason', sql.VarChar(20), reason)
            .input('date', sql.DateTime(), date)
            .input('obs', sql.VarChar(20), obs)
            .input('ngnf', sql.VarChar(20), ngnf)
            .input('contract', sql.VarChar(20), contract)
            .query('UPDATE C900_TAREAS SET CMOTIVO900=@newReason,COMPLEMENTO2_900=@obs,FSISA900=NULL, AUSENTE900=AUSENTE900+1, ' +
                'FASIGNADO900 = NULL, NRECORRIDO900 = NULL, COPERARIO900=NULL WHERE NPARTE900=@poliza AND TIPO_TRAB900=@reason ' +
                'AND FE_EMISION900=@date AND FREALIZADO900 IS NULL AND CCONT900=@contract AND NGNF900 = @ngnf')
    },

}
