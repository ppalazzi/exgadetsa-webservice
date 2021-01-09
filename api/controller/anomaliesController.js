/* eslint-disable no-unused-vars */
'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject
} = require('../common/commonFunctions')
const { retrieveAnomaliesGroups } = require('../dao/anomaliesQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('anomaliesController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    getAnomaliesGroup: async (_, response) => {
        try {
            const result = await retrieveAnomaliesGroups()

            let resturnMsj = text.EMPTY
            if (result.length === 0) {
                resturnMsj = 'No se encontraron ANOMALIAS para el usuario'
            }

            logger.info('Grupos de anomalias traídas correctamente')
            genericResponse(response, resturnMsj, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
