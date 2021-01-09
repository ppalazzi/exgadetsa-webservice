'use strict'
const db = require('../../mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('testDataQueries')

module.exports = {

    insertData: async () => {
        try {
            await insertManyCollections('usuarios', require('./jsonFiles/usuarios.json'))
            await insertManyCollections('anomalias_group', require('./jsonFiles/anomaliasGroup.json'))
        } catch (error) {
            logger.error(error.stack)
        }
    },

    deleteAllData: async () => {
        try {
            await deleteCollections('usuarios')
            await deleteCollections('anomalias_group')
        } catch (error) {
            logger.error(error.stack)
        }
    }
}

/**
 * Insert into many collections
 * @param {*} collection
 * @param {*} data
 * @return {*}
 */
function insertManyCollections (collection, data) {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertMany(data, {}, (err, response) => {
            if (err) reject(err)
            else resolve(response)
        })
    })
}

/**
 * Delete collections
 * @param {*} collection
 * @param {*} data
 * @return {*}
 */
function deleteCollections (collection) {
    return new Promise((resolve, reject) => {
        db.collection(collection).remove({}, (err, response) => {
            if (err) reject(err)
            else resolve(response)
        })
    })
}
