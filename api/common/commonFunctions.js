'use strict'

module.exports = {

    // Crea una respuesta customizada
    genericResponse: (response, info, status, data) => {
        response.status(status)
        response.json({
            mensaje: info,
            status: status,
            data: data
        })
    },

    // Compara si una propiedad es nulla o indefinida
    isNullOrUndefined: (obj) => {
        return (!obj || typeof obj === 'undefined')
    },

    // Da formato JSON a un objecto
    parseJSONObject: (entity) => {
        return JSON.parse(JSON.stringify(entity))
    },

    // Crea un objecto desde el body de un request
    createEntityFromBody: (request) => {
        const entity = {}
        Object.entries(request.body)
            .forEach(([key, value]) => {
                entity[key] = ((value === '') ? null : value)
            })
        return entity
    }

}
