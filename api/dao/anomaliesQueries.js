'use strict'
const db = require('../../config/database/mongo/mongoCli')
const objectId = db.ObjectId

const log4js = require('log4js')
const logger = log4js.getLogger('anomaliesQueries')

const collection = db.collection('anomalias_grupos')

module.exports = {

    retrieveAnomaliesGroups: () => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los grupos de anomalias')
            collection.find({}, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    setAnomaliesGroups: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los grupos de anomalias')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteAnomaliesGroups: (id) => {
        const query = { _id: objectId(id) }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el grupo de anomalias con id: ' + id)
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
