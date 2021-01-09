'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('pipePressureQueries')

const collection = db.collection('pipe_pressure')

module.exports = {

    retrievePipePressures: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos las presiones  de caño mayor: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setPipePressures: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos las presiones de caño mayor: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deletePipePressures: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina la presión de caño mayor con id : ' + id)
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
