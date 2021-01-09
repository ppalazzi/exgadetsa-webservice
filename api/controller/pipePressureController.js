'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrievePipePressures } = require('../dao/pipePressureQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('pipePressuresController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    pipePressureController: async (request, response) => {
        try {
            const result = await retrievePipePressures()

            if (result.length === 0) {
                throw new Error('Error al traer las presiones de caño mayor')
            }
            logger.info('Presiones de caño mayor traidos con éxito')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
