'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('sectionsQueries')

const collection = db.collection('sections')

module.exports = {

    retrieveSections: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los sections: ')
            collection.find({},
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    setSections: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recuperan todos los Secciones: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteSections: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se elimina la seccion con id: ' + id)
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
