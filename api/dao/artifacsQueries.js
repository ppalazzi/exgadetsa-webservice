'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('artifacsQueries')

const collection = db.collection('artifacs')

module.exports = {

    retrieveArtifacs: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los artefactos: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setArtifacs: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los Artefactos: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteArtifacs: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el artefacto con id: ' + id)
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
