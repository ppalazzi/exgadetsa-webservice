'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('tabsRelationQueries')

const collection = db.collection('tabs_relation')

module.exports = {

    retrieveTabsRelation: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos las solapas por tipo de trabajo')
            collection.find({}, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    setTabsRelation: (group) => {
        return new Promise((resolve, reject) => {
            logger.info('Se actualizan todas las solapas por tipo de trabajo: ')
            collection.save(group, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteTabsRelation: (id) => {
        const query = { _id: id }
        return new Promise((resolve, reject) => {
            logger.info('Se eliminan todas las tipos de solapas por trabajo : ' + id)
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
