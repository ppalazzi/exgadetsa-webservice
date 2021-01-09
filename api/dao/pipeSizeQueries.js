'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('pipeSizeQueries')

const collection = db.collection('pipe_size')

module.exports = {

    retrievePipeSizes: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los diámetros  de caño mayor: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setPipeSizes: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los diámetros de caño mayor: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deletePipeSizes: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el diámetro de caño : ' + id)
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
