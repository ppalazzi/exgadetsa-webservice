/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('seguimientoQueries')

module.exports = {

    getSeguimientoData: async (action) => {
        logger.info('Codigos de seguimiento para accion ' + action.id)

        var resultValue = { Resultado : '', Visita : '', Accion : '', Remedio: '', CGNF: '', CIERRE: ''}

        const dbPool = await dbClient
        const result = await dbPool.request().input('id', sql.VarChar(20), action.id)
            .query('SELECT RESULTADO005 as res, CVISITA005 as vis,ACCION005 as act,RMED005 as rem ' +
                'FROM M005_COD_TAREA WHERE CCONT005=\'002\' AND CTAREA005=@id')

        if (result.rowsAffected[0]) {
            resultValue.Resultado = result.recordset[0].res
            resultValue.Visita = result.recordset[0].vis
            resultValue.Accion = result.recordset[0].act
            resultValue.Remedio = result.recordset[0].rem
        }

        const result2 = await dbPool.request().input('id', sql.VarChar(20), action.id)
            .query('SELECT CGNF121 as gnf,TCIERRE121 as cierre FROM T121_TAREA_X_GNF WHERE CCONT121=\'002\' AND CTAREA121=@id')

        if (result2.rowsAffected[0]) {
            resultValue.CGNF = result2.recordset[0].gnf
            resultValue.CIERRE = result2.recordset[0].cierre
        }

        return resultValue
    },

    updateNegadosWithEquipment: async (dateDone, codContestation, poliza, dateGenerado, moriginal, nmotivo, obs, codOperator) => {
        logger.info('Actualizando codigos de negados para equipo de poliza ' + poliza + ' y operario ' + codOperator)

        const dbPool = await dbClient
        const result = await dbPool.request().input('datedone', sql.DateTime(), dateDone)
            .input('obs', sql.VarChar(255), obs)
            .input('poliza', sql.VarChar(50), poliza)
            .input('dateGenerado', sql.DateTime(), dateGenerado)
            .input('codOperator', sql.VarChar(20), codOperator)
            .input('original', sql.VarChar(40), moriginal)
            .query('update C900_TAREAS set FREALIZADO900 = @datedone , COPERARIO900=@codOperator, AUSENTE900 = AUSENTE900+1, COMPLEMENTO3_900 = ' +
                '@obs WHERE FASIGNADO900 IS NOT NULL AND FREALIZADO900 IS NULL AND FANULADO900 IS NOT NULL ' +
                'AND NPARTE900 = @poliza AND FE_EMISION900 = @dateGenerado AND CCONT900=\'002\' AND TIPO_TRAB900= @original')

        if (result.rowsAffected[0]) {
            logger.info('Insertando en tabla c902_Cord para poliza' + poliza)

            await dbPool.request().input('original', sql.VarChar(40), moriginal)
                .input('dateGenerado', sql.DateTime(), dateGenerado)
                .input('poliza', sql.VarChar(50), poliza)
                .input('nmotivo', sql.VarChar(50), nmotivo)
                .input('datedone', sql.DateTime(), dateDone)
                .query('INSERT INTO C902_OCOR (CCONT902,TIPO_TRAB902,FE_EMISION902,PARTE902,CTAREA902,' +
                    'CMOTIVO902,FREALIZADO902,LECCIERRE902,OBSERV902,COPERARIO902,SUCCOMU902,CGNF902,TCIERRE902, ' +
                    'NGNF902) VALUES (\'002\',@original,@dateGenerado,@poliza,\'33\',@nmotivo,@datedone,\'0000000000\',\'ANULADO AUTOMATICAMENTE\',\'0\',\'0\',\'03003\',\' \',\'0\')')

        }
    },

    comunicarOdor: async (codGng, tipoCierre, dateDone, status, codOperator, obs, codExga, suc, poliza, reason, jobType, date, ngnf, photos) => {
        logger.info('Comunicando Odor para poliza ' + poliza + ' y operario ' + codOperator)

        const dbPool = await dbClient
        const result = await dbPool.request().input('datedone', sql.DateTime(), dateDone)
            .input('codOperator', sql.VarChar(20), codOperator)
            .input('obs', sql.VarChar(255), obs)
            .input('poliza', sql.VarChar(50), poliza)
            .input('reason', sql.VarChar(50), reason)
            .input('ngnf', sql.VarChar(50), ngnf)
            .query('UPDATE C900_TAREAS SET FREALIZADO900=@datedone, COPERARIO900=@codOperator,AUSENTE900=AUSENTE900+1, ' +
                'COMPLEMENTO3_900=@obs WHERE NPARTE900=@poliza AND CMOTIVO900 = @reason AND FREALIZADO900 IS NULL AND CCONT900=\'002\' AND NGNF900 = @ngnf')

        if (result.rowsAffected[0]) {
            logger.info('actualizo c902_ocor para la poliza ' + poliza)

            const result2 = await dbPool.request().input('jobType', sql.VarChar(20), jobType)
                .input('date', sql.DateTime(), date)
                .input('poliza', sql.VarChar(50), poliza)
                .input('codExga', sql.VarChar(50), codExga)
                .input('reason', sql.VarChar(50), reason)
                .input('datedone', sql.DateTime(), dateDone)
                .input('estado', sql.VarChar(20), status)
                .input('obs', sql.VarChar(255), obs)
                .input('codOperator', sql.VarChar(20), codOperator)
                .input('suc', sql.VarChar(20), suc)
                .input('codGng', sql.VarChar(20), codGng)
                .input('tipoCierre', sql.VarChar(20), tipoCierre)
                .input('photos', sql.Int(), photos)
                .query('INSERT INTO C902_OCOR (CCONT902,TIPO_TRAB902,FE_EMISION902,PARTE902,CTAREA902,' +
                    'CMOTIVO902,FREALIZADO902,LECCIERRE902,OBSERV902,COPERARIO902,SUCCOMU902,CGNF902,TCIERRE902, ' +
                    'NGNF902, FOTO902) VALUES (\'002\',@jobType,@date,@poliza,@codExga,@reason,@datedone,@estado,@obs,@codOperator,@suc,@codGng,@tipoCierre,\'0\',@photos)')

            if (result2.rowsAffected[0]) {
                logger.info('Eliminando Poliza de la tabla z015')
                await dbPool.request().input('poliza', sql.VarChar(50), poliza)
                    .query('DELETE FROM Z015_TEMP_OCOR WHERE (NPARTE15 = @poliza)')
            }
        }
    }
}
