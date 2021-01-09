'use strict'
const { sidewalkController } = require('../controller/sidewalkController')

const serviceSidewalk = () => ({
    get: {
        '/app/sidewalk': (req, res) => {
            sidewalkController(req, res)
        }
    }
})

module.exports = serviceSidewalk
