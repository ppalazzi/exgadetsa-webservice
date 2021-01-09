'use strict'
const { actionsController } = require('../controller/actionsController')

const actionsService = () => ({
    get: {
        '/app/actions': (req, res) => {
            actionsController(req, res)
        }
    }
})

module.exports = actionsService
