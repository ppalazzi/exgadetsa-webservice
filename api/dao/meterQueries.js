/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
'use strict'
const { dbClient, sql, dbClientExga } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('meterQueries')

module.exports = {

    getMeterByActionAndContract: async (actionId, contractId) => {
        try {
            logger.info('Trayendo Medidor para accion :' + actionId + ' y tipo de contrato : ' + contractId)

            const dbPool = await dbClient
            const result = await dbPool.request().input('actionId', sql.VarChar(20), actionId)
                .input('contractId', sql.VarChar(20), contractId)
                .query("SELECT RMED004 as Medidor FROM M004_MOTIVOS WHERE CMOTIVO004= @actionId and CCONT004= @contractId")

            return result.recordset[0]
        } catch (error) {
            logger.error(error.stack)
            throw new Error('Error en la consulta para obtener medidores por accion y contrato' + error.message)
        }
    },

    getMeterBySerial: async (serial) => {
        try {
            logger.info("Buscando medidor por número de serie")

            const dbPool = await dbClientExga
            const result = await dbPool.request().input('serial', sql.Int, serial)
                .query("SELECT CMATE_102 as Material, CALMA_102 as Operario, ESTADO_102 as Estado FROM T_MEDI_102 WHERE NSERIE_102= @serial")

            return result.recordset[0]
        }
         catch (error) {
             logger.error(error.stack)
             throw new Error("Error buscando medidor por número de serie :" + serial)
         }
    },

    updateMaterBySerial: async (date, serial) => {
        try {
            logger.info("Actualizando medidor por número de serie")

            const dbPool = await dbClientExga
            await dbPool.request().input('date', sql.DateTime(), date)
                .input('serial', sql.VarChar("20"), serial)
                .query("UPDATE T_MEDI_102 SET ESTADO_102= 2, F_UTIL_102=@date WHERE NSERIE_102=@serial AND ESTADO_102=1")
        }
        catch (error) {
            logger.error(error.stack)
            throw new Error("Error actualizando medidor por número de serie :" + serial)
        }
    },

    getMeterRemoved: async (serial) => {
        try {
            logger.info('Trayendo medidor removido')

            const dbPool = await dbClientExga
            const result = await dbPool.request().input('serial', sql.VarChar(20), serial)
                .query('select FINFO_113 as Number FROM T_MED_DEVO_113 WHERE NSERI_113 = @serial')

            return result.recordset[0]
        }
        catch (error) {
            logger.error(error.stack)
            throw new Error("Error al traer el viejo medidor removido")
        }
    },

    storeMeter: async (serial, user, deposito, capacity,  poliza, contractId, dateDone, family, status, tiporet, codOperario) => {
        try {
            logger.info('Grabando medidor con numero de serie : ' + serial + ' para el operario ' + codOperario)

            let capacityRetrieved = await materialCodeMeter(capacity)

            const dbPool = await dbClientExga
            await dbPool.request().input('serial', sql.VarChar(20), serial)
                .input('user', sql.VarChar(20), user)
                .input('deposito', sql.VarChar(20), deposito)
                .input('capacity', sql.VarChar(20), capacityRetrieved)
                .input('dateDone', sql.DateTime(), dateDone)
                .input('poliza', sql.VarChar(20), poliza)
                .input('contractId', sql.VarChar(20), contractId)
                .input('family', sql.Int(), family)
                .input('status', sql.Int(), status)
                .input('tiporet', sql.VarChar(20), tiporet)
                .input('codOperario', sql.VarChar(20), codOperario)
                .query('insert T_MED_DEVO_113 (NSERI_113,FCARGO_113, USER_C_113,DEPOSI_113,CMATE_113, ' +
                    'POLIZA_113,CONTRATO_113,FRETIRO_113,FAMILIA_113, ESTADO_113,FINFO_113,OT_113,OPERA_113) ' +
                    'VALUES (@serial,GETDATE(),@user,@deposito,@capacity,@poliza,@contractId,@dateDone,@family,@status,GETDATE(),@tiporet,@codOperario)')
        }
        catch (error) {
            logger.error(error.stack)
            throw new Error('Error al guardar el medido')
        }
    },

    getGFromMeter: async (serial) => {
        logger.info('Trayendo G del medidor con serial ' + serial)

        const dbPool = await dbClientExga
        await dbPool.request().input('serial', sql.VarChar(100), serial)
            .query('SELECT CODG FROM Z003_CAPACIDAD_MEDIDOR WHERE CODSAP=@serial')

        return result.recordset[0]
    },

    removeMeter: async (meter) => {
        logger.info('Trayendo medidor de almacenes con id ' + meter)

        const dbPool = await dbClientExga
        await dbPool.request().input('meter', sql.VarChar(100), meter)
            .query('select FINFO_113 FROM T_MED_DEVO_113 WHERE NSERI_113 = @meter')

        return result.recordset[0]
    }
}

async function materialCodeMeter(capacity) {
    try {
        logger.info('Trayendo código de medidor')

        const dbPool = await dbClientExga
        const result = await dbPool.request().input('capacity', sql.Float(), capacity)
            .query('select DESC_804 as descuento,CCAP_804 FROM P_CAPACIDAD_804 WHERE CCAP_804=@capacity')

        if (result && result.recordset[0]) {
            return result.recordset[0].descuento
        }

        return '400015'
    }
    catch (error) {
        logger.error(error.stack)
        throw new Error('Error al traer materiales por código')
    }
}
