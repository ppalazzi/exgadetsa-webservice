'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrievePipeMaterials } = require('../dao/pipeMaterialsQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('pipeMaterialsController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    pipeMaterialsController: async (request, response) => {
        try {
            const result = await retrievePipeMaterials()

            if (result.length === 0) {
                throw new Error('Error al traer los materiales de caño mayor')
            }
            logger.info('Materiales de caño mayor traidos con éxito')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
