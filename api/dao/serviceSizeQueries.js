'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('serviceSizeQueries')

const collection = db.collection('service_size')

module.exports = {

    retrieveServiceSizes: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los diámetros  de servicio: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setServiceSizes: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los diámetros de servicio: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteServiceSizes: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el diámetro de servicio : ' + id)
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
