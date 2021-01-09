'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('sidewalkQueries')

const collection = db.collection('sidewalk')

module.exports = {

    retrieveSidewalk: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los tipos de vereda')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setSidewalk: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los tipos de vereda: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteSidewalk: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina tipo de verda : ' + id)
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
