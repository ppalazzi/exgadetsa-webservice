'use strict'
const { sectionsController } = require('../controller/sectionsController')

const sectionsService = () => ({
    get: {
        '/app/sections': (req, res) => {
            sectionsController(req, res)
        }
    }
})

module.exports = sectionsService
