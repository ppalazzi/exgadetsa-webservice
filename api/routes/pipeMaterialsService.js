'use strict'
const { pipeMaterialsController } = require('../controller/pipeMaterialsController')

const pipeMaterialsService = () => ({
    get: {
        '/app/pipe_materials': (req, res) => {
            pipeMaterialsController(req, res)
        }
    }
})

module.exports = pipeMaterialsService
