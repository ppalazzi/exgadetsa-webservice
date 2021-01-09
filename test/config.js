'use strict'
require('../server.js')

const expect = require('chai').expect
const fetch = require('node-fetch')

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

var req = `http://${host}:${port}/app/`

module.exports = {
    expect: expect,
    fetch: fetch,
    req: req
}
