/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('crcIlicitosQueries')

module.exports = {

    getMaxAnomaliaType: async (anomaliasIds) => {
        logger.info('Trayendo todos los códigos de anomalias')

        const dbPool = await dbClient
        const result = await dbPool.request().input('ids', sql.VarChar(60), anomaliasIds)
            .query('SELECT MAX(CODALT802) FROM P802_PARAMETROS WHERE CTABLA802=9 AND CPARA802 in (@ids)')
        return result.recordset[0]
    },

    getActionByAnomaly: async (anomaliaId, codTarea, visitas) => {
        logger.info('Trayendo Accion por la anomalia ' + anomaliaId + ' y visitas ' + visitas)

        const dbPool = await dbClient
        const result = await dbPool.request().input('codTarea', sql.VarChar(20), codTarea)
            .input('anomaliaId', sql.VarChar(20), anomaliaId)
            .input('visita', sql.Int(), visitas)
            .query('SELECT ACCION127 as Accion FROM T127_VISITAS_ACCION_CRC WHERE (CTAREA127 = @codTarea) ' +
                'AND (CANO127 = @anomaliaId) AND (VMIN127 <= @visita) AND (VMAX127 >= @visita)')
        return result.recordset[0]
    },

    comunicarCRC: async (nParte, date, jobType, reason, dateDone, medidor, lectura, numeroMedidor, status, nsg, poliza,
                         anomalia, codOperario, obs, itemCer, adic, ngnf, aclaracion, dni, vmed, vpapa, foto, hora, capacidad) => {
        logger.info('Comunicar CRC para poliza ' + poliza + ' y operario ' + codOperario)

        const dbPool = await dbClient
        await dbPool.request().input('nParte', sql.VarChar(60), nParte)
            .input('date', sql.DateTime(), date)
            .input('jobType', sql.VarChar(20), jobType)
            .input('reason',sql.VarChar(20), reason)
            .input('dateDone', sql.DateTime(), dateDone)
            .input('medidor', sql.VarChar(20), medidor)
            .input('lectura', sql.VarChar(20), lectura)
            .input('numeroMedidor', sql.VarChar(20), numeroMedidor)
            .input('status', sql.VarChar(20), status)
            .input('nsg', sql.VarChar(20), nsg)
            .input('poliza', sql.VarChar(60), poliza)
            .input('anomalia', sql.VarChar(60), anomalia)
            .input('codOperario', sql.VarChar(40), codOperario)
            .input('obs', sql.VarChar(256), obs)
            .input('itemCer', sql.VarChar(20), itemCer)
            .input('adic', sql.VarChar(60), adic)
            .input('ngnf', sql.VarChar(40), ngnf)
            .input('aclaracion', sql.VarChar(100), aclaracion)
            .input('dni', sql.VarChar(20), dni)
            .input('vmed', sql.Int(), vmed)
            .input('vpapa', sql.Int(), vpapa)
            .input('foto', sql.Int(), foto)
            .input('hora', sql.VarChar(60), hora)
            .input('capacidad', sql.VarChar(60), capacidad)
            .query('INSERT INTO C903_CRC (CCONT903,FE_EMISION903,CTAREA903,CMOTIVO903,NTAREA903,POLIZA903,' +
                'FREALIZADO903,NSGC903,NMEDIDOR903,LECTURA903,MEDIDOR903,ESTADO903,TANOMALIA903,COPERA903,OBS903,CERT903, ' +
                'NGNF903,SISA_ESTADO903,ACLARACION903,DNI903,VMED903,VPAP903,FOTO903,HORA903,CAPACIDAD903) VALUES ' +
                '(\'003\',@date,@jobType,@reason,@nParte,@poliza,@dateDone,@nsg,@medidor,@lectura,@numeroMedidor,@status,@anomalia,@codOperario,@obs,@itemCer,@ngnf,\'1\',@aclaracion,' +
                '@dni,@vmed,@vpapa,@foto,@hora, @capacidad)')
    },

    comunicarC900: async (dateDone, codOperario, poliza, jobType, ngnf) => {
        logger.info(`comunicando C900 para la poliza ${poliza} y operario ${codOperario}`)

        const dbPool = await dbClient
        await dbPool.request().input('dateDone', sql.DateTime(), dateDone)
            .input('codOperario', sql.VarChar(40), codOperario)
            .input('poliza', sql.VarChar(60), poliza)
            .input('jobType', sql.VarChar(20), jobType)
            .input('ngnf', sql.VarChar(40), ngnf)
            .query('UPDATE C900_TAREAS SET FREALIZADO900=@dateDone, COPERARIO900=@codOperario,AUSENTE900=AUSENTE900+1 ' +
                'WHERE NPARTE900=@poliza AND TIPO_TRAB900=@jobType AND FREALIZADO900 IS NULL AND CCONT900=\'003\' AND NGNF900=@ngnf')

    },

    store123: async (date, jobType, poliza, dateDone, ngnf, actionId) => {
        logger.info(`Guardando en la tabla 1233 certificado para la poliza ${poliza}`)

        const certificate = await getCertificateByJobTypeAndTask(jobType, actionId)

        if (certificate) {
            logger.info('Ahora voy a guardar con certificado' + certificate.Certificado)

            const dbPool = await dbClient
            await dbPool.request().input('date', sql.DateTime(), date)
                .input('jobType', sql.VarChar(20), jobType)
                .input('poliza', sql.VarChar(20), poliza)
                .input('dateDone', sql.DateTime(), dateDone)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('actionId', sql.VarChar(20), actionId)
                .input('certificate', sql.VarChar(20), certificate.Certificado)
                .query('INSERT INTO T123_ITEM_CERTIFICADO_CRC (FE_EMISION123,TTIPO_TRAB123,' +
                    'NPARTE123,FEJEC123,ITEMCER123, NGNF123) VALUES (@date,@jobType,@poliza,@dateDone,@certificate,@ngnf)')
        }
    },

    storeT10: async (poliza, actionId, dateDone) => {
        logger.info(`Guardando en T110 para la poliza ${poliza}`)

        const anomalyId = await getAnomalyByActionAndContract(actionId)

        if (anomalyId && !anomalyId.Anomalia.toString().includes('-')) {
            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('dateDone', sql.DateTime(), dateDone)
                .input('actionId', sql.VarChar(20), actionId)
                .input('anomalyId', sql.VarChar(20), anomalyId.Anomalia)
                .query('insert into T110_ANOMALIAS (NPARTE110, CANO110,FECHA110) VALUES (@poliza,@anomalyId,@dateDone)')
        }
    },

    store135: async (poliza, date, actionId) => {
        logger.info(`Guardando en tabla T135 para la poliza ${poliza}`)

        const actionForAnomalyId = await getActionByActionAndContract(actionId)

        if (actionForAnomalyId && !actionForAnomalyId.Accion.toString().includes('-')) {
            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('dateDone', sql.DateTime(), date)
                .input('actionId', sql.VarChar(20), actionId)
                .input('actionForAnomalyId', sql.VarChar(20), actionForAnomalyId.Accion)
                .query('INSERT INTO T135_ACCION_CRC (NPARTE135,FECHA135,ACC135) VALUES (@poliza,@dateDone,@actionForAnomalyId)')
        }
    },

    getActionComunication: async (actionId, visitas, poliza) => {
        logger.info(`Trayendo comunicacion para el codigo de tarea ${actionId} y poliza ${poliza} y visitar ${visitas}`)

        const dbPool = await dbClient
        const result = await dbPool.request().input('actionId', sql.VarChar(20), actionId)
            .input('visitas', sql.VarChar(20), visitas)
            .query('SELECT ACCION127 as ACTION FROM T127_VISITAS_ACCION_CRC ' +
                'WHERE (CTAREA127 = @actionId)  AND (VMIN127 <= @visitas) AND (VMAX127 >= @visitas)')
        return result.recordset[0]
    },

    traerAdicionalEQ: async (codMaterial, codCierre) => {
        logger.info(`Trayendo codigo adicional EQ para ${codMaterial} y ${codCierre}`)

        const dbPool = await dbClient
        const result = await dbPool.request().input('codMaterial', sql.VarChar(20), codMaterial)
            .input('codCierre', sql.VarChar(20), codCierre)
            .query('SELECT CODAD154 as Codigo FROM T154_AD_CALIBRE_MED_CRC WHERE CODMED154=@codMaterial AND CODTAREA154=@codCierre')
        return result.recordset[0]
    }
}

async function getAnomalyByActionAndContract(action) {
    logger.info(`trayendo anomalia para la accion ${action}`)

    const dbPool = await dbClient
    const result = await dbPool.request().input('actionId', sql.VarChar(20), action)
        .query('SELECT ANOMALIA117 as Anomalia FROM T117_ANOMALIA_ACCION WHERE CCONT117=\'003\' AND CTAREA117=@actionId')
    return result.recordset[0]
}

async function getActionByActionAndContract(action) {
    logger.info(`trayendo accion de anomalias anomalia para la accioón ${action}`)

    const dbPool = await dbClient
    const result = await dbPool.request().input('actionId', sql.VarChar(20), action)
        .query('SELECT ACCION117 as Accion FROM T117_ANOMALIA_ACCION WHERE CCONT117=\'003\' AND CTAREA117=@actionId')
    return result.recordset[0]
}

async function getCertificateByJobTypeAndTask (jobType, task) {
    logger.info(`trayendo certificado para el tipo de trabajo ${jobType} y la tarea ${task}`)

    const dbPool = await dbClient
    const result = await dbPool.request().input('jobType', sql.VarChar(20), jobType)
        .input('task', sql.VarChar(20), task)
        .query('SELECT CODCERT122 as Certificado FROM T122_CERTIFICACION_CRC_NEW WHERE TIPO_TRAB122=@jobType AND CTAREA122=@task')
    return result.recordset[0]
}
