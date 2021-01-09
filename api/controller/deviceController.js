'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject,
    createEntityFromBody
} = require('../common/commonFunctions')
const {
    findDeviceByToken,
    saveDeviceInfo
} = require('../dao/deviceQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('deviceController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    registerTokenDevice: async (request, response) => {
        let deviceToken
        try {
            const element = createEntityFromBody(request)
            const result = await findDeviceByToken(element.token)

            if (result.length === 0) {
                deviceToken = await saveDeviceInfo(element)
                logger.info('Se registro un nuevo dispositivo con exito.')
            } else {
                deviceToken = result
                logger.warn('El dispositivo ya se encuentra registrado.')
            }
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(deviceToken))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }

    }

}

