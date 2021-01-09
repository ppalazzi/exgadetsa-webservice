'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveActionsGroups } = require('../dao/actionsQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('actionsController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    actionsController: async (request, response) => {
        try {
            const result = await retrieveActionsGroups()

            if (result.length === 0) {
                throw new Error('Error al traer las actions')
            }
            logger.debug('grupos de actions traídas correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
