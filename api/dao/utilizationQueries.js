/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql, dbClientExga } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('utilizationQueries')

module.exports = {

    // agregar el fecha emision
    updateUTI: async (dateDone, user, observations, poliza, reason, ngnf) => {
        try {
            logger.info('Actualizando Tabla Tareas ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('dateDone', sql.DateTime(), dateDone)
                .input('user', sql.VarChar(20), user)
                .input('observations', sql.VarChar(256), observations)
                .input('poliza', sql.VarChar(20), poliza)
                .input('reason', sql.VarChar(20), reason)
                .input('ngnf', sql.VarChar(20), ngnf)
                .query('UPDATE C900_TAREAS SET FREALIZADO900=@dateDone, COPERARIO900=@user,AUSENTE900=AUSENTE900+1,' +
                    'COMPLEMENTO3_900=@observations WHERE NPARTE900=@poliza AND CMOTIVO900=@reason AND FREALIZADO900 IS NULL AND CCONT900=\'001\' AND NGNF900 = @ngnf')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error al actualizar la tarea en la tabla c900 ' + error.message)
        }
    },

    newutilization: async (jobType, emitionDate, poliza, ngnf, reason, closedAction, dateDone, user, observations, closedType,
                           isDone, isSigned, clarification, dni, meterNumber, lecture, newMeter,
                           stateInsert, validateMeter, validatePaper, numberPhotos, numberPeople, scape,
                           incorrectAddress, incorrectMeter, conformidad) => {
        try {
            logger.info('Insertando en tabla utilizacion para la poliza ' + poliza + ' y dni ' + dni)

            const dbPool = await dbClient
            await dbPool.request().input('jobType', sql.VarChar(20), jobType)
                .input('emitionDate', sql.Date(), emitionDate)
                .input('poliza', sql.VarChar(20), poliza)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('reason', sql.VarChar(20), reason)
                .input('closedAction', sql.VarChar(20), closedAction)
                .input('dateDone', sql.DateTime(), dateDone)
                .input('user', sql.VarChar(20), user)
                .input('observations', sql.VarChar(256), observations)
                .input('closedType', sql.VarChar(20), closedType)
                .input('isDone', sql.VarChar(2), isDone)
                .input('isSigned', sql.VarChar(2), isSigned)
                .input('clarification', sql.VarChar(20), clarification)
                .input('dni', sql.VarChar(20), dni)
                .input('meterNumber', sql.VarChar(20), meterNumber)
                .input('lecture', sql.VarChar(20), lecture)
                .input('newMeter', sql.VarChar(20), newMeter)
                .input('stateInsert', sql.VarChar(20), stateInsert)
                .input('validateMeter', sql.Int(), validateMeter)
                .input('validatePaper', sql.Int(), validatePaper)
                .input('numberPhotos', sql.Int(), numberPhotos)
                .input('tPaper', sql.Int(), validatePaper)
                .input('numberPeople', sql.Int(), numberPeople)
                .input('scape', sql.Int(), scape)
                .input('incorrectAddress', sql.VarChar(20), incorrectAddress)
                .input('incorrectMeter', sql.VarChar(20), incorrectMeter)
                .input('conformidad', sql.VarChar(20), conformidad)
                .query('INSERT INTO C901_UTILIZACION (CCONT901,TIPO_TRAB901, FE_EMISION901, PARTE901, NGNF901,' +
                    'CMOTIVO901, CTAREA901, FREALIZADO901, COPERARIO901, OBSERV901, TCIERRE901, REALIZO901, FIRMO901, ' +
                    'ACLARACION901, DNI901, MEDRETIRADO901, ESTADORET901, MEDCOLOCA901, ESTADOCOLA901,VMED901,VPAPEL901,' +
                    'FOTO901,TPAPEL901,CHABIT901,INTESC901,DOMINC901,MEDDIS901, CONFORME901) VALUES (\'001\',@jobType,@emitionDate,' +
                    '@poliza,@ngnf,@reason,@closedAction,@dateDone,@user,@observations,@closedType,@isDone,@isSigned,' +
                    '@clarification,@dni,@meterNumber,@lecture,@newMeter,@stateInsert,@validateMeter,@validatePaper,' +
                    '@numberPhotos,@tPaper,@numberPeople,@scape,@incorrectAddress,@incorrectMeter,@conformidad)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error insertando en la tabla utilización' + error.message)
        }
    },

    changeReason: async (poliza, newReason, reason, emitionDate, ngnf, contract) => {
        try {
            logger.info('Cambiando la razon de ' + reason + ' a ' + newReason)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('emitionDate', sql.Date(), emitionDate)
                .input('newReason', sql.VarChar(20), newReason)
                .input('reason', sql.VarChar(20), reason)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('contract', sql.VarChar(20), contract)
                .query('UPDATE C900_TAREAS SET CMOTIVO900=@newReason, AUSENTE900=AUSENTE900+1, FASIGNADO900 = NULL, ' +
                    'NRECORRIDO900=NULL,FSISA900=NULL, COPERARIO900=NULL WHERE NPARTE900=@poliza AND CMOTIVO900=@reason ' +
                    'AND FE_EMISION900=@emitionDate AND FREALIZADO900 IS NULL AND CCONT900 = @contract AND NGNF900=@ngnf')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error cambiando la reason' + error.message)
        }
    },

    storeArtifacts: async (poliza, emitionDate, jobType, ngnf, artifact, contractId, index) => {
        try {
            logger.info('Guardando artefacto con id : ' + artifact.artifactId + ' para la poliza : ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('emitionDate', sql.Date(), emitionDate)
                .input('jobType', sql.VarChar(20), jobType)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('artifactId', sql.VarChar(20), artifact.artifactId)
                .input('index', sql.Int(), index)
                .input('calories', sql.Int(), artifact.calories)
                .input('sectorId', sql.VarChar(20), artifact.sectionsId)
                .input('amount', sql.Int, artifact.amount)
                .input('number', sql.VarChar(20), artifact.number)
                .input('contractId', sql.VarChar(20), contractId)
                .query('INSERT INTO T148_ARTEFACTO_UTI (CCONT148, NPARTE148,FE_EMISION148, TIPO_TRAB148, ' +
                    'NGNF148, NART148, CODART148,CALORIA148,UBICACION148,CANT_ART148,NPRECINTO148) ' +
                    'VALUES (@contractId,@poliza,@emitionDate,@jobType,@ngnf,@index,@artifactId,@calories,@sectorId,' +
                    '@amount,@number)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error guardando el artefacto' + error.message)
        }
    },

    storeMaterials: async (jobType, emitionDate, poliza, material, dateDone, ngnf, contractId) => {
        try {
            logger.info('Guardando materiales para el id : ' + material.id + ' y poliza : ' + poliza)

            const dbPool = await dbClient
            await dbPool.request().input('poliza', sql.VarChar(20), poliza)
                .input('jobType', sql.VarChar(20), jobType)
                .input('emitionDate', sql.Date(), emitionDate)
                .input('materialId', sql.VarChar(20), material.id)
                .input('dateDone', sql.DateTime(), dateDone)
                .input('ngnf', sql.VarChar(20), ngnf)
                .input('contractId', sql.VarChar(20), contractId)
                .input('cant', sql.Float(), material.decimal)
                .query('INSERT INTO T140_MATERIAL_UTI (CONT140, CTAREA140, FGENERADO140, NPARTE140, CMAT140, ' +
                    'CANT140, NGNF140,FREALIZADO140) ' +
                    'VALUES (@contractId,@jobType,@emitionDate,@poliza,@materialId,@cant,@ngnf,@dateDone)')
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error guardando el material' + error.message)
        }
    },

    uncountMaterials: async (materials, codOperario, contractId, dateDone) => {
        try {
            logger.info('Descontando materiales para el contrato ' + contractId)

            var remito = await verifyRemitValue(codOperario, dateDone)

            if (remito || remito.Value === 0) {
                let tempRemit = await getRemiteNumber();
                remito = (tempRemit.NUMERO) ? tempRemit.NUMERO : remito.Value
                await addRemiteNumber()
            }


            for (const material of materials) {
                await discountMaterial(material.id, codOperario, material.decimal, '1')
                await uncountStockContract(contractId, material.id, material.decimal)

                switch (contractId) {
                    case '001':
                        await storeTrans(remito, dateDone, material.id, codOperario, 2, material.decimal, '04')
                        break
                    case '002':
                        await storeTrans(remito, dateDone, material.id, codOperario, 2, material.decimal, '04')
                        break
                    case '003':
                        await storeTrans(remito, dateDone, material.id, codOperario, 2, material.decimal, '37')
                        break
                    case '004':
                        await storeTrans(remito, dateDone, material.id, codOperario, 2, material.decimal, '02')
                        break
                    default:
                        await storeTrans(remito, dateDone, material.id, codOperario, 2, material.decimal, '01')
                }
            }

        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error descontando material' + error.message)
        }
    },

    storeAditional: async (jobType, date, poliza, ngnf, actionId, dateDone, contractId) => {
        logger.info('Grabando adicional para la poliza ' + poliza + ' con adicional ' + actionId)

        const dbPool = await dbClient
        await dbPool.request().input('poliza', sql.VarChar(20), poliza)
            .input('date', sql.Date(), date)
            .input('jobType', sql.VarChar(20), jobType)
            .input('ngnf', sql.VarChar(20), ngnf)
            .input('actionId', sql.VarChar(20), actionId)
            .input('dateDone', sql.DateTime(), dateDone)
            .input('contractId', sql.VarChar(20), contractId)
            .query('INSERT INTO C901A_UTILIZACION_ADICIONALES (CCONT901A,TIPO_TRAB901A,FE_EMISION901A,PARTE901A,' +
                'NGNF901A,ACCAD901A,FR901A) VALUES (@contractId,@jobType,@date,@poliza,@ngnf,@actionId,@datedone)')
    }
}

async function discountMaterial (materialId, codOperario, amount, status) {
    try {
        logger.info('Descontando material para el id' + materialId + ' y operario ' + codOperario)

        const dbPool = await dbClientExga
        const cant = await dbPool.request().input('materialId', sql.VarChar(50), materialId)
            .input('codOperario', sql.VarChar(20), codOperario)
            .input('status', sql.Int(), status)
            .query('select C_ALMA_103, C_MATE_103 from T_ALMA_103 WHERE C_MATE_103=@codOperario ' +
                'AND C_ALMA_103=@codOperario AND ESTA_103=@status')

        if (cant) {
            await dbPool.request().input('materialId', sql.VarChar(50), materialId)
                .input('codOperario', sql.VarChar(20), codOperario)
                .input('amount', sql.Int(), amount)
                .input('status', sql.Int(), status)
                .query('Update T_ALMA_103 set N_CANT_103=(N_CANT_103 - @amount) WHERE ' +
                    'C_MATE_103=@materialId AND C_ALMA_103=@codOperario AND ESTA_103=@status')
        } else {
            await dbPool.request().input('materialId', sql.VarChar(50), materialId)
                .input('codOperario', sql.VarChar(20), codOperario)
                .input('amount', sql.Int(), amount)
                .input('status', sql.Int(), status)
                .query('insert INTO T_ALMA_103  (N_CANT_103,C_MATE_103,C_ALMA_103,ESTA_103) values (@amount,@materialId,@codOperario,@status ')
        }
    } catch (error) {
        logger.error(error.stack)
        throw new Error('Error descontando material' + error.message)
    }
}

async function uncountStockContract (contractId, materialId, amount) {
    try {
        logger.info('descontando material por contrato')

        const dbPool = await dbClientExga
        await dbPool.request().input('materialId', sql.VarChar(50), materialId)
            .input('contractId', sql.VarChar(20), contractId)
            .input('amount', sql.Int(), amount)
            .query('Update T_SCONT_107 set CANT_107=CANT_107-@amount WHERE C_MATE_107=@materialId AND CONT_107=@contractId')
    } catch (error) {
        logger.error(error.stack)
        throw new Error('Error descontando material por contrato' + error.message)
    }
}

async function verifyRemitValue (codOperator, date) {
    try {
        const dbPool = await dbClientExga
        const result = await dbPool.request().input('codOperator', sql.VarChar(20), codOperator)
            .input('date', sql.DateTime(), date)
            .query('SELECT MAX(N_REMI_104) AS Value FROM T_REMI_104 WHERE (T_MOV_104 = 2) AND ' +
                '(USER_104 = \'0\') AND (ALMAE_104=@codOperator) AND (F_ALTA_104=@date)')

        return result.recordset[0]
    } catch (error) {
        logger.error(error.stack)
        throw new Error('Error verificando remito' + error.message)
    }
}

async function getRemiteNumber () {
    try {
        logger.info('Trayendo número de remito')

        const dbPool = await dbClientExga
        const result = await dbPool.request().query('select NUMERO From NUMERACION where C_NUM=1')
        return result.recordset[0]
    } catch (e) {
        logger.error(e.stack)
        throw new Error('Error trayendo el número de remito')
    }
}

async function addRemiteNumber () {
    try {
        logger.info('Sumando número de remito')

        const dbPool = await dbClientExga
        await dbPool.request().query('Update NUMERACION set NUMERO = NUMERO+1 WHERE C_NUM=1')
    } catch (e) {
        logger.error(e.stack)
        throw new Error('Error sumando número de remito')
    }
}

async function existMaterial (remito, materialId) {
    try {
        logger.info('Existe material? ' + remito)

        const dbPool = await dbClientExga
        const result = await dbPool.request().input('remito', sql.Float(), remito)
            .input('materialId', sql.VarChar(50), materialId)
            .query('SELECT CANT_104 FROM T_REMI_104 WHERE N_REMI_104=@remito AND C_MATE_104=@materialId')

        return result.recordset[0]
    } catch (error) {
        logger.error(error.stack)
        throw new Error('Error sumando número de remito')
    }
}

async function updateTransSum (remito, date, materialId, codOperario, reason, cant) {
    try {
        logger.info('actualizando transaccion suma con remito ' + remito + ' y para el operario ' + codOperario)

        const dbPool = await dbClientExga
        await dbPool.request().input('remito', sql.Float(), remito)
            .input('date', sql.Date(), date)
            .input('materialId', sql.VarChar(20), materialId)
            .input('codOperario', sql.VarChar(20), codOperario)
            .input('reason', sql.VarChar(20), reason)
            .input('cant', sql.Int(), cant)
            .query('UPDATE T_REMI_104 SET CANT_104=(CANT_104 + @cant) WHERE N_REMI_104=@remito AND ' +
                'F_ALTA_104=@date AND C_MATE_104=@materialId AND ALMAE_104=@codOperario AND T_MOV_104=@reason')
    } catch (error) {
        logger.error(error.stack)
        throw new Error('Error actualizando transaccion suma')
    }
}

async function storeTrans (remito, date, materialId, codOperario, reason, cant, cont) {
    try {
        logger.info('Guardando trans')

        const dbPool = await dbClientExga
        await dbPool.request().input('remito', sql.Float(), remito)
            .input('date', sql.DateTime(), date)
            .input('materialId', sql.VarChar(20), materialId)
            .input('codOperario', sql.VarChar(20), codOperario)
            .input('reason', sql.VarChar(20), reason)
            .input('cant', sql.Int(), cant)
            .input('cont', sql.VarChar(20), cont)
            .query('INSERT INTO T_REMI_104 (N_REMI_104, F_ALTA_104, C_MATE_104, ALMAE_104, ALMAR_104, ' +
                'T_MOV_104, F_INFO_104, N_PETI_104, OBSE_104, MOTI_104, CANT_104, OC_104, USER_104, CONT_104, ' +
                'RECIBE_104) VALUES (@remito,@date,@materialId,@codOperario,@codOperario,@reason,' +
                '@date,\'0\',\'SISTEMA\',\'0\',@cant,\'0\',\'0\',@cont,\'\')')
    } catch (error) {
        logger.error(error.stack)
        throw new Error('Error guardando trans')
    }
}
