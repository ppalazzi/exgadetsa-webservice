'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('rejectionsQueries')

const collection = db.collection('rejections')

module.exports = {

    retrieveActionsGroups: () => {
        return new Promise((resolve, reject) => {
            logger.info('trayendo todos los grupos de rechazos: ')
            collection.find({},
                (err, response) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(response)
                    }
                })

        })
    }
}
