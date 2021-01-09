'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveArtifacs } = require('../dao/artifacsQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('artifacsController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    artifacsController: async (request, response) => {
        try {
            const result = await retrieveArtifacs()

            if (result.length === 0) {
                throw new Error('Error al traer los artefactos')
            }
            logger.info('Artefactos traidos correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
