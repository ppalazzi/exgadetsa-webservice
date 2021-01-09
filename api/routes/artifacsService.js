'use strict'
const { artifacsController } = require('../controller/artifacsController')

const artifacsService = () => ({
    get: {
        '/app/artifacs': (req, res) => {
            artifacsController(req, res)
        }
    }
})

module.exports = artifacsService
