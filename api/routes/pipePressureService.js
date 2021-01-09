'use strict'
const { pipePressureController } = require('../controller/pipePressureController')

const pipePressureService = () => ({
    get: {
        '/app/pipe_pressure': (req, res) => {
            pipePressureController(req, res)
        }
    }
})

module.exports = pipePressureService
