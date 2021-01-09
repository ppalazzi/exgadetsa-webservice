'use strict'
const { scapeController } = require('../controller/scapeController')

const scapeService = () => ({
    get: {
        '/app/scape': (req, res) => {
            scapeController(req, res)
        }
    }
})

module.exports = scapeService
