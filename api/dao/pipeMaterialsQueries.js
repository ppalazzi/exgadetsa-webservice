'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('pipeMaterialsQueries')

const collection = db.collection('pipe_materials')

module.exports = {

    retrievePipeMaterials: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los materiales de caño mayor: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setPipeMaterials: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los materiales de caño mayor: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deletePipeMaterials: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el caño de fuga mayor: ' + id)
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
