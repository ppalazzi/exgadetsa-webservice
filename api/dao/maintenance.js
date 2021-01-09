/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('maintenanceQueries')

module.exports = {

    getNewActivity: async (reason, newReason) => {
        try {
            logger.info('Trayendo nueva actividad')

            const dbPool = await dbClient
            const result = await dbPool.request().input('reason', sql.VarChar(20), reason)
                .input('newReason', sql.VarChar(20), newReason)
                .query('SELECT CACTIV137 FROM T137_ACTIVIDAD_MOTIVO WHERE CCONT137 = \'005\' AND CMOTIVO137=@reason AND CNMOTIVO137=@newReason')

            return result.recordset[0]
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Trayendo nueva actividad' + error.message)
        }
    },

    addAusentChangeReason: async (poliza, newReason, reason, date, observation, ngnf, activity, contract) => {
        try {
            logger.info('Sumar ausente - cambiar motivo poliza ' + poliza)

            const dbPool = await dbClient
            const result = await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('newReason', sql.VarChar(20), newReason)
                .input('reason', sql.VarChar(20), reason)
                .input('date', sql.Date(), date)
                .input('obs', sql.VarChar(256), observation)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('activity', sql.VarChar(20), activity)
                .input('contract', sql.VarChar(20), contract)
                .query('UPDATE C900_TAREAS SET CMOTIVO900=@newReason,COMPLEMENTO2_900=@obs,FSISA900=NULL,ACTIV900=@activity, ' +
                    'AUSENTE900=AUSENTE900+1, FASIGNADO900=NULL, NRECORRIDO900=NULL, COPERARIO900=NULL WHERE NPARTE900=@poliza ' +
                    'AND CMOTIVO900=@reason AND FE_EMISION900=@date AND FREALIZADO900 IS NULL AND CCONT900=@contract AND NGNF900 = @ngnf')

            return result.rowsAffected[0]

        } catch (error) {
            logger.error(error.stack)
            throw new Error('Sumar ausente - cambiar motivo' + error.message)
        }
    },

    comunicateMaintenance: async (poliza, emitionDate, jobType, reason, dateDone, ngnf, codOperario, observations, canoMaterial,
                                  canoMaterialDiametro, servicioMaterial, servicioDiametro, canoEstado, revestimiento, espesor, vereda, m2, actividad, canoPressure, observationsVer) => {
        try {
            logger.info('Comunicar Mantenimiento para poliza ' + poliza + ' y operario ' + codOperario)

            const dbPool = await dbClient
            const result = await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('emitionDate', sql.Date(), emitionDate)
                .input('jobType', sql.VarChar(20), jobType)
                .input('reason', sql.VarChar(20), reason)
                .input('dateDone', sql.DateTime(), dateDone)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('codOperario', sql.VarChar(20), codOperario)
                .input('observations', sql.VarChar(20), observations)
                .input('canoMaterial', sql.VarChar(20), canoMaterial)
                .input('canoMaterialDiametro', sql.VarChar(20), canoMaterialDiametro)
                .input('servicioMaterial', sql.VarChar(20), servicioMaterial)
                .input('servicioDiametro', sql.VarChar(20), servicioDiametro)
                .input('canoEstado', sql.VarChar(20), canoEstado)
                .input('revestimiento', sql.VarChar(20), revestimiento)
                .input('espesor', sql.VarChar(20), espesor)
                .input('vereda', sql.VarChar(20), vereda)
                .input('m2', sql.VarChar(20), m2)
                .input('actividad', sql.VarChar(20), actividad)
                .input('canoPressure', sql.VarChar(20), canoPressure)
                .input('observationsVereda', sql.VarChar(20), observationsVer)
                .query('INSERT INTO C905_MANTENIMIENTO (CCONT905, FE_EMISION905, CTAREA905, NGNF905, NTAREA905, ' +
                    'CMOTIVO905, ACTIDAD905, FREALIZADO905, MAT_CM905, DIM_CM905, ESPCM905, EST_REV905, MAT_SER905, ' +
                    'DIM_SER905, PSC905, VEREDA905, M2_ROT905, OBS905,PRESION905,OBSCIVI905) VALUES (\'005\',@emitionDate,@jobType,\'0\',' +
                    '@poliza,@reason,@actividad,@dateDone,@canoMaterial,@canoMaterialDiametro,@espesor,@revestimiento,' +
                    '@servicioMaterial,@servicioDiametro,@codOperario,@vereda,@m2,@observations,@canoPressure,@observationsVereda)')

            if (result.rowsAffected[0]) {
                logger.info('Ahora actuaizando c900 tareas para la poliza : ' + poliza)

                await dbPool.request().input('dateDone', sql.Date(), dateDone)
                    .input('codOperario', sql.VarChar(20), codOperario)
                    .input('poliza', sql.VarChar(20), poliza)
                    .input('jobType', sql.VarChar(20), jobType)
                    .input('ngnf', sql.VarChar(20), ngnf)
                    .input('emitionDate', sql.Date(), emitionDate)
                    .query('UPDATE C900_TAREAS SET FREALIZADO900=@dateDone, COPERARIO900=@codOperario,AUSENTE900=AUSENTE900+1 ' +
                        'WHERE NPARTE900=@poliza AND TIPO_TRAB900=@jobType AND FREALIZADO900 IS NULL AND CCONT900=\'005\' ' +
                        'AND NGNF900=@ngnf AND FE_EMISION900=@emitionDate')
            }
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para obtener tareas por usuario' + error.message)
        }
    },

    storeScapes: async (jobType, date, poliza, scapeVO) => {
        try {
            logger.info('Guardando Fugas para poliza : ' + poliza)

            let classScape = scapeVO.type === '040' ? '040' : '010'

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('jobType', sql.VarChar(20), jobType)
                .input('date', sql.Date(), date)
                .input('fugaClase', sql.VarChar(20), classScape)
                .input('fugaType', sql.VarChar(20), scapeVO.type)
                .input('fugaLocalization', sql.VarChar(20), scapeVO.localization)
                .input('fugaComplement', sql.VarChar(20), scapeVO.complimentaryId)
                .query('INSERT INTO T131_FUGA_EXGA (CONT131, CTAREA131, FGENERADO131, NPARTE131, ' +
                    'CFUGA131, CTIPO131, CLOCALIZA131, CCOMP131) VALUES (\'005\',@jobType,@date,@poliza,@fugaClase,@fugaType,@fugaLocalization,@fugaComplement)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para guardar Fugas' + error.message)
        }
    },

    storeHoles: async (jobType, date, poliza, hole) => {
        try {
            logger.info('Guardando Pozos para la poliza : ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('jobType', sql.VarChar(20), jobType)
                .input('date', sql.Date(), date)
                .input('id', sql.VarChar(20), hole.sideWalkId)
                .input('width', sql.Float(), hole.width)
                .input('height', sql.Float(), hole.height)
                .query('INSERT INTO T132_VEREDA_ROTA (CCONT132, TIPO_TRAB132, FE_EMISION132, NPARTE132, ' +
                    'TIPO132, NPOZO132, ANCHO132,LARGO132) VALUES (\'005\',@jobType,@date,@poliza,@id,\'1\',@height,@width)')

        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para guardar Veredas' + error.message)
        }
    },

    updateC900: async (date, jobType, dateEmision, poliza) => {
        try {
            logger.info('Actualizando C900 para la poliza ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('jobType', sql.VarChar(20), jobType)
                .input('date', sql.DateTime(), date)
                .input('dateEmision', sql.Date(), dateEmision)
                .query('UPDATE C900_TAREAS SET FCIVIL900=@date WHERE (CCONT900=\'005\') AND ' +
                    '(TIPO_TRAB900=@jobType) AND (FE_EMISION900=@dateEmision) AND (NPARTE900=@poliza)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para actualizar C900' + error.message)
        }
    },

    updateC905: async (date, m2, jobType, dateEmision, poliza) => {
        try {
            logger.info('Actualizando C905 para la poliza ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('jobType', sql.VarChar(20), jobType)
                .input('date', sql.DateTime(), date)
                .input('dateEmision', sql.Date(), dateEmision)
                .input('m2', sql.Float(), m2)
                .query('UPDATE C905_MANTENIMIENTO SET FCIVIL905=@date, M2_REP905=@m2 WHERE (CCONT905=\'005\') ' +
                    'AND (CTAREA905=@jobType) AND (FE_EMISION905=@dateEmision) AND (NTAREA905=@poliza)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para actualizar C905' + error.message)
        }
    }
}
