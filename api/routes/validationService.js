'use strict'
const { validationController } = require('../controller/validationController')

const serviceValidation = () => ({
    get: {
        '/app/validations': (req, res) => {
            validationController(req, res)
        }
    }
})

module.exports = serviceValidation
