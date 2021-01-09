'use strict'
const config = require('config')
const { genericResponse, parseJSONObject } = require('../common/commonFunctions')
const { getRejectiosByPartNumber } = require('../dao/rejectionsQueries')
const { retrieveActionsGroups } = require('../dao/rejectionsCodeQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('rejectionsController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    getRejectionsCodeByPartNumber: async (number, response) => {
        logger.info('Trayendo códigos con número de parte ' + number)

        try {
            let values = await getRejectiosByPartNumber(number)

            let resturnMsj = text.EMPTY
            if (!values) {
                values = ' '
            }

            genericResponse(response, resturnMsj, status.OK, parseJSONObject(values))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    },

    getRejectionsCode: async (request, response) => {
        logger.info('Trayendo todos los códigos de rechazos')

        try {
            const result = await retrieveActionsGroups()
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
