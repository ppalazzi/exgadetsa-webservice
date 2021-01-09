'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveScape } = require('../dao/scapeQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('scapeController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    scapeController: async (request, response) => {
        try {
            const result = await retrieveScape()

            if (result.length === 0) {
                throw new Error('Error al traer las fugas')
            }
            logger.info('Fugas traidas correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
