/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/*
'use strict'
const { dbClient, sql } = require('../../config/database/sql/sqlConnectionSetup')

const log4js = require('log4js')
const logger = log4js.getLogger('validationQueries')

module.exports = {
    retrieveValidation: async () => {
        logger.info('Trayendo validaciones para el contrato 001')

        const dbPool = await dbClient
        const result = await dbPool.request().query('select CCONT147 as contrato_id, TIPO_TRAB147 as tipo_tarea_id, ACCION147 as accion_id, RESULTADO147 as realizado,\n' +
            'ADICIONAL147 as adicional, NTAREA147 as nueva_tarea, VMED147 as valida_medidor, VEST147 as valida_estado, VCOD147 as valida_codigo,\n' +
            'VFUGA147 as valida_fuga, VART147 as valida_artefacto, VRECHA147 as valida_rechazo, VHABIT147 as valida_domicilio\n' +
            'from T147_VALIDACION WHERE CCONT147 = \'001\'')
        return result.recordset
    }
}
*/

'use strict'
const db = require('../../config/database/mongo/mongoCli')
const objectId = db.ObjectId

const log4js = require('log4js')
const logger = log4js.getLogger('validationQueries')

const collection = db.collection('validations')

module.exports = {

    retrieveValidation: () => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos las validaciones')
            collection.find({}, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    setValidation: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todas las validaciones')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteValidation: (id) => {
        const query = { _id: objectId(id) }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el grupo de validaciones: ' + id)
            collection.remove(query, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    }
}

db.on('error', function (err) {
    logger.error('Error al conectarse a la base de datos Mongo: ', err)
})
