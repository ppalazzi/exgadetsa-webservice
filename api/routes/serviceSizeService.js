'use strict'
const { serviceSizeController } = require('../controller/serviceSizeController')

const serviceSizeService = () => ({
    get: {
        '/app/service_size': (req, res) => {
            serviceSizeController(req, res)
        }
    }
})

module.exports = serviceSizeService
