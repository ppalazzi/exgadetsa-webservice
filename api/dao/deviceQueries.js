'use strict'
const db = require('../../config/database/mongo/mongoCli')
const objectId = db.ObjectId

const log4js = require('log4js')
const logger = log4js.getLogger('deviceQueries')

const collection = db.collection('devicesInfo')

module.exports = {

    saveDeviceInfo: (info) => {
        return new Promise((resolve, reject) => {
            logger.info('Se inserta informacion del dispotivo: ' + info.token)
            collection.insertOne(info, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    findDeviceByToken: (token) => {
        const query = { token }
        return new Promise((resolve, reject) => {
            logger.info('Se recupera la info del dispositivo con token: ' + token)
            collection.find(query, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteDeviceInfo: (id) => {
        const query = { _id: objectId(id) }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el dispositivo registrado: ' + id)
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
