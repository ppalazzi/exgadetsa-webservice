'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrievePipeSizes } = require('../dao/pipeSizeQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('pipeSizesController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    pipeSizeController: async (request, response) => {
        try {
            const result = await retrievePipeSizes()

            if (result.length === 0) {
                throw new Error('Error al traer los diametros de caño mayor')
            }
            logger.info('Diametros de caño mayor traidos con éxito')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
