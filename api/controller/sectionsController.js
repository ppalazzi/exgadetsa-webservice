'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveSections } = require('../dao/sectionsQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('sectionsController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    sectionsController: async (_, response) => {
        try {
            const result = await retrieveSections()

            if (result.length === 0) {
                throw new Error('Error al traer los sectores')
            }
            logger.info('Sectores traidos correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
