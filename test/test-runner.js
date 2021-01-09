'use strict'
const fs = require('fs')
var opn = require('better-opn')

// eslint-disable-next-line no-path-concat
var testFiles = fs.readdirSync(__dirname + '/test-unit')
testFiles.forEach(function (file) {
    require('./test-unit/' + file)
})

// Open pretty test results
opn('http://localhost:3000/test-reports/results.html')
