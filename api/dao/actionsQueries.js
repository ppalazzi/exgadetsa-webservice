'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('actionsQueries')

const collection = db.collection('accion_realizada')

module.exports = {

    retrieveActionsGroups: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los grupos de acciones: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setActionsGroups: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los grupos de acciones: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteActionsGroups: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina el grupo de acciones con id: ' + id)
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
