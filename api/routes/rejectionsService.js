'use strict'
const { getRejectionsCodeByPartNumber, getRejectionsCode } = require('../controller/rejectionsController')

const getRejectionsByNumberPart = () => ({
    get: {
        '/app/data/rejections/:number': (req, res) => {
            const number = req.params.number
            getRejectionsCodeByPartNumber(number, res)
        },
        '/app/rejectionsCode': (req, res) => {
            getRejectionsCode(req, res)
        }

    },
})

module.exports = getRejectionsByNumberPart
