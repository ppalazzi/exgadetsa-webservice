/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('generalsQueries')

module.exports = {

    storeT104: async (dateDone, dateEmition, codOperator, numberParte, actionNotResolved,
                      contractId, number, personel, reason, ngnf, jobType, photosAmount) => {
        try {
            logger.info('Guardando tabla T104')

            const dbPool = await dbClient
            await dbPool.request().input('dateDone', sql.DateTime(), dateDone)
                .input('dateEmition', sql.Date(), dateEmition)
                .input('codOperator', sql.VarChar(20), codOperator)
                .input('numberParte', sql.VarChar(20), numberParte)
                .input('actionNotResolved', sql.VarChar(20), actionNotResolved)
                .input('contractId', sql.VarChar(20), contractId)
                .input('number', sql.Int(), number)
                .input('personel', sql.Int(), personel)
                .input('reason', sql.VarChar(20), reason)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('jobType', sql.VarChar(20), jobType)
                .input('photosAmount', sql.Int(), photosAmount)
                .query('INSERT T104_PUNTO_OPERARIO_OT (FECHA104,FE_GENERADO104,CODEQ104,NTAREA104,CTAREA104,' +
                    'CCONT104,CANT104,PERSONA104,CMOTIVO104,NGNF104,TIPO_TRAB104, FOTO104) ' +
                    'VALUES (@dateDone,@dateEmition,@codOperator,@numberParte,@actionNotResolved,@contractId,' +
                    '@number,@personel,@reason,@ngnf,@jobType,@photosAmount)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la Guardar en tabla T104' + error.message)
        }
    },

    storeZ017: async (contractId, newTask, emitionDate, poliza, codOperator, dateDone, actionId, meterNumber,
                      lecture, newSerial, validateMeter, validatePaper, observation, isSigned, signed, clarification,
                      dni, process, photo1, photo2) => {
        try {
            logger.info('Guardando tabla Z017')

            let cant = retrieveCountParte(newTask, poliza)
            if (cant && cant[0].CUENTA > 0) {
                const dbPool = await dbClient
                await dbPool.request().input('contractId', sql.VarChar(20), contractId)
                    .input('newTask', sql.VarChar(20), newTask)
                    .input('emitionDate', sql.Date(), emitionDate)
                    .input('poliza', sql.VarChar(20), poliza)
                    .input('codOperator', sql.VarChar(20), codOperator)
                    .input('dateDone', sql.DateTime(), dateDone)
                    .input('actionId', sql.VarChar(20), actionId)
                    .input('meterNumber', sql.VarChar(20), meterNumber)
                    .input('lecture', sql.VarChar(20), lecture)
                    .input('newSerial', sql.VarChar(20), newSerial)
                    .input('validateMeter', sql.Int(), validateMeter)
                    .input('validatePaper', sql.Int(), validatePaper)
                    .input('observation', sql.VarChar(256), observation)
                    .input('isSigned', sql.VarChar(2), isSigned)
                    .input('signed', sql.VarChar(20), signed)
                    .input('clarification', sql.VarChar(20), clarification)
                    .input('dni', sql.VarChar(20), dni)
                    .input('process', sql.VarChar(20), process)
                    .input('photo1', sql.VarChar(20), photo1)
                    .input('photo2', sql.VarChar(20), photo2)
                    .query('INSERT INTO Z017_TEMP_TAREA_PEND_GENREAR (CCONT017,TIPO_TRAB017,FE_EMISION017,NPARTE017,' +
                        'COPERARIO017,FR017,CODREA017,NMEDIDOR017,LECTURA017,NEWMEDIDOR017,VMEDIDOR017,VPAPEL017,OBS017,' +
                        'FIRMO017,FIRMA017,ACLARACION017,DNI017,PROCESO017,FOTO1_017,FOTO2_017) VALUES (@contractId,@newTask,' +
                        '@emitionDate,@poliza,@codOperator,' +
                        '@dateDone,@actionId,@meterNumber,@lecture,@newSerial,@validateMeter,@validatePaper,@observation,' +
                        '@isSigned,@signed,@Dclarification,@dni,@process,@photo1,@photo2')
            }
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la Guardar en tabla T104' + error.message)
        }
    },

    updateT106: async (actionCode, poliza, numeroRecorrido, emitionDate, jobType,
                       contractId, ngnf) => {
        try {
            logger.info('Actualizando T106 para action ' + actionCode + ' y numero parte : ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('actionCode', sql.VarChar(20), actionCode)
                .input('poliza', sql.VarChar(20), poliza)
                .input('numeroRecorrido', sql.VarChar(20), numeroRecorrido)
                .input('emitionDate', sql.Date(), emitionDate)
                .input('jobType', sql.VarChar(20), jobType)
                .input('contractId', sql.VarChar(20), contractId)
                .input('ngnf', sql.VarChar(20), ngnf)
                .query('UPDATE T106_RECORRIDO_DET SET CTAREA106= @actionCode WHERE NTAREA106=@poliza AND ' +
                    'NRECO106=@numeroRecorrido AND CCONT106=@contractId AND FGENERADO106=@emitionDate AND MORIGINAL106=@jobType AND NGNF106=@ngnf')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Actualizando T106 para action' + actionCode + 'y numero parte : ' + poliza + error.message)
        }
    },

    unassignedTask: async (poliza, reason, date, contractId, recorrido, ngnf) => {
        logger.info('Desasignando Tarea con poliza' + poliza + ' y para el contrato ' + contractId)

        const dbPool = await dbClient
        const resultado = await dbPool.request().input('poliza', sql.VarChar(20), poliza)
            .input('reason', sql.VarChar(20), reason)
            .input('falta', sql.Date(), date)
            .input('contractId', sql.VarChar(20), contractId)
            .input('recorrido', sql.VarChar(20), recorrido)
            .input('ngnf', sql.VarChar(20), ngnf)
            .query('UPDATE C900_TAREAS SET  FASIGNADO900 = NULL,FSISA900=NULL, NRECORRIDO900 = NULL, ' +
                'COPERARIO900=NULL WHERE NPARTE900=@poliza AND TIPO_TRAB900= @reason AND FE_EMISION900=@falta AND CCONT900=@contractId AND ' +
                'NRECORRIDO900=@recorrido AND FREALIZADO900 IS NULL AND NGNF900 = @ngnf')

        return resultado.rowsAffected[0]
    },

    getNewReason: async (contract, jobType, reason) => {
        logger.info('Obteniendo nuevo motivo para contrato {} y tipo trabajo {} ', contract, jobType)

        const dbPool = await dbClient
        const resultado = await dbPool.request().input('contract', sql.VarChar(20), contract)
            .input('jobType', sql.VarChar(20), jobType)
            .input('reason', sql.VarChar(20), reason)
            .query('SELECT NMOTIVO118 FROM T118_CAMBIO_MOTIVO WHERE CCONT118=@contract AND CTAREA118=@jobType and CMOTIVO118=@reason')

        return resultado.recordset[0]
    },

    storeAnomalies: async (poliza, anomalyId, date) => {
        logger.info('Guardando anomalia para poliza ' + poliza)

        const dbPool = await dbClient
        await dbPool.request().input('poliza', sql.VarChar(20), poliza)
            .input('anomaliaId', sql.VarChar(20), anomalyId)
            .input('date', sql.DateTime(), date)
            .query('insert into T110_ANOMALIAS(NPARTE110, CANO110,FECHA110) VALUES (@poliza,@anomaliaId,@date)')
    },

    getFlags: async (contractId, actionId) => {
        logger.info(`Trayendo banderas para el contrato ${contractId} y accion ${actionId}`)

        const dbPool = await dbClient
        await dbPool.request().input('contractId', sql.VarChar(20), contractId)
            .input('actionId', sql.VarChar(20), actionId)
            .query('SELECT CMED005,RMED005 FROM M005_COD_TAREA WHERE CCONT005=@contractId AND CTAREA005 =@contractId')
    }
}

async function retrieveCountParte (newTask, poliza) {
    logger.info('Calculando cantidad de partes')

    const dbPool = await dbClient
    const resultado = await dbPool.request().input('newTask', sql.VarChar(20), newTask)
        .input('poliza', sql.VarChar(20), poliza)
        .query('SELECT COUNT(NPARTE017) AS CUENTA FROM Z017_TEMP_TAREA_PEND_GENREAR ' +
            'WHERE (TIPO_TRAB017 = @newTask) AND (NPARTE017 = @poliza)')

    return resultado.recordset[0]
}
