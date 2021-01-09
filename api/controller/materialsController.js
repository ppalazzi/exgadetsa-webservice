'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveMaterials } = require('../dao/materialsQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('materialsController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    materialsController: async (request, response) => {
        try {
            const result = await retrieveMaterials()

            if (result.length === 0) {
                throw new Error('Error al traer los materiales')
            }
            logger.info('grupos de materiales traídos correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
