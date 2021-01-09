'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('scapeQueries')

const collection = db.collection('gas_scape')

module.exports = {

    retrieveScape: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos las fugas: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setScape: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se guardan todos las fugas: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteScape: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina la fuga con id: ' + id)
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
