'use strict'
const { Promise } = require('mssql')

const db = require('../../config/database/mongo/mongoCli')

const log4js = require('log4js')
const logger = log4js.getLogger('sessionQueries')

const collection = db.collection('usuarios')

module.exports = {

    retrieveUserLogin: (id, pass) => {
        return new Promise((resolve, reject) => {
            logger.info('Se recupera usuario con el id: ' + id)
            collection.findOne({ userId: id.toString(), password: pass.toString() },
                (err, response) => {
                    if (err) reject(err)
                    else resolve(response)
                })
        })
    },

    saveUser: (client) => {
        return new Promise((resolve, reject) => {
            logger.info('Se inserta usuario con el id: ' + client.userId)
            collection.insertOne(client, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    deleteUser: (id) => {
        const query = { userId: Number(id) }
        return new Promise((resolve, reject) => {
            logger.info('Se borra usuario con el id: ' + id)
            collection.remove(query, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    },

    findUserById: (id) => {
        const query = { userId: Number(id) }
        return new Promise((resolve, reject) => {
            logger.info('Se recupera usuario con el id: ' + id)
            collection.find(query, (err, response) => {
                if (err) reject(err)
                else resolve(response)
            })
        })
    }
}

db.on('error', function (err) {
    logger.error('Error al conectarse a la base de datos Mongo: ', err)
})
