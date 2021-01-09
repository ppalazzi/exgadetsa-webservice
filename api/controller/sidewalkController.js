'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveSidewalk } = require('../dao/sidewalkQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('sidewalkController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    sidewalkController: async (request, response) => {
        try {
            const result = await retrieveSidewalk()

            if (result.length === 0) {
                throw new Error('Error al traer los tipos de vereda')
            }
            logger.info('tipos de vereda traidos con éxito')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
