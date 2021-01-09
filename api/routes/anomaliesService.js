'use strict'
const { getAnomaliesGroup } = require('../controller/anomaliesController')

const anomaliesService = () => ({
    get: {
        '/app/anomalias': (req, res) => {
            getAnomaliesGroup(req, res)
        }
    }
})

module.exports = anomaliesService
