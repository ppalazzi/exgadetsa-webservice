'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveServiceSizes } = require('../dao/serviceSizeQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('serviceSizesController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    serviceSizeController: async (_, response) => {
        try {
            const result = await retrieveServiceSizes()

            if (result.length === 0) {
                throw new Error('Error al traer los diametros de servicio')
            }
            logger.info('Diametros de servicio traidos con éxito')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
