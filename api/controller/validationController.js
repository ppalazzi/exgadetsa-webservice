'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveValidation } = require('../dao/validationQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('validationController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    validationController: async (request, response) => {
        try {
            const result = await retrieveValidation()

            if (result.length === 0) {
                throw new Error('Error al traer las validaciones')
            }
            logger.info('validaciones con éxito')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
