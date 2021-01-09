'use strict'
const config = require('config')
const {
    genericResponse,
    parseJSONObject, createEntityFromBody
} = require('../common/commonFunctions')
const {
    retrieveUserLogin,
    saveUser,
    findUserById,
    deleteUser
} = require('../dao/sessionQueries')

const log4js = require('log4js')
const logger = log4js.getLogger('sessionController')

const status = config.get('status')
const text = config.get('constantes')

module.exports = {

    userLogin: async (request, response) => {
        try {
            const element = createEntityFromBody(request)
            const result = await retrieveUserLogin(element.userId, element.password)

            if (result.length === 0) throw new Error('LoginUser - El user o password es incorrecto')
            logger.info('userLogin - El usuario ' + element.userId + ' inicio sesion correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    },

    createUser: async (request, response) => {
        try {
            const element = createEntityFromBody(request)

            // Valido que el usuario no exista
            const findRes = await findUserById(element.userId)
            if (findRes.length > 0) throw new Error('CreateUser - El userId ya existe en el sistema')

            // Creo el usuario
            const result = await saveUser(element)
            logger.info('CreateUser - El usuario ' + element.userId + ' se creo correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    },

    deleteUser: async (id, response) => {
        try {
            const result = await deleteUser(id)
            if (result.length === 0) throw new Error('DeleteUser - El usuario a eliminar no existe')
            logger.info('DeleteUser - El usuario ' + id + ' se elimino correctamente')
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    },

    findUserById: async (id, response) => {
        try {
            const result = await findUserById(id)
            if (result.length > 0) {
                logger.info('FindUserById - El usuario se encontro con exito')
            } else {
                logger.warn('FindUserById - El usuario no se encuentra en sistema')
            }
            genericResponse(response, text.EMPTY, status.OK, parseJSONObject(result))
        } catch (error) {
            logger.error(error.stack)
            genericResponse(response, error.message, status.INTERNAL_SERVER_ERROR, text.EMPTY)
        }
    }
}
