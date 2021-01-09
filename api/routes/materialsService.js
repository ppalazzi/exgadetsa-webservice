'use strict'
const { materialsController } = require('../controller/materialsController')

const materialsService = () => ({
    get: {
        '/app/materials': (req, res) => {
            materialsController(req, res)
        }
    }
})

module.exports = materialsService
