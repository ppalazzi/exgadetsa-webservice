'use strict'
const { registerTokenDevice } = require('../controller/deviceController')

const tokenService = () => ({
    post: {
        '/app/register/device': (req, res) => {
            registerTokenDevice(req, res)
        }
    }

})

module.exports = tokenService