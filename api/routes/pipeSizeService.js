'use strict'
const { pipeSizeController } = require('../controller/pipeSizeController')

const pipeSizeService = () => ({
    get: {
        '/app/pipe_size': (req, res) => {
            pipeSizeController(req, res)
        }
    }
})

module.exports = pipeSizeService
