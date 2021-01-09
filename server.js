'use strict'
const config = require('config')
require('events').EventEmitter.prototype._maxListeners = 100

// Datos de arranque =====================
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const routes = require('./api/routes')

const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

const app = express()
app.use('/test-reports', express.static('./test/report'))

// Logger ================================
const log4js = require('log4js')
log4js.configure('./config/logger/log4js.json')
const logger = log4js.getLogger('server')

// Load Data =================================
const db = config.get('mongoTestData')
const exec = require('./config/database/mongo/scripts/mongoData')
if (db.recreate) exec.insertData()
if (db.delete) exec.deleteAllData()

// Coneccion a la base de datos SQL ==========================
const { dbClient } = require('./config/database/sql/sqlConnectionSetup')

// Configuracion Gral ===========================
app.set('etag', false)
app.use(cors())
app.use(helmet()) /* Seguridad para HTTP Headers */
app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto', format: ':method :url :status' }))
app.use(bodyParser.urlencoded({ extended: 'true' }))
app.use(bodyParser.json())
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

const Application = { app, dbClient }
routes(Application)

app.listen(port, host, () => {
    logger.info('Exgadet Api listening on port: ' + port)
})
