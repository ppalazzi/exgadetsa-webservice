'use strict'
const config = require('config')
const mongojs = require('mongojs')

const db = config.get('dbConfig').get('mongo')
const ENV = process.env.KEY_ENV

const user = (ENV === 'PROD') ? process.env.MONGO_USER : `${db.user}`
const password = (ENV === 'PROD') ? process.env.MONGO_PASSWORD : `${db.password}`
const host = (ENV === 'PROD') ? process.env.MONGO_HOST : `${db.host}`
const dbName = (ENV === 'PROD') ? process.env.MONGO_DBNAME : `${db.dbName}`

module.exports = mongojs(`${user}:${password}@${host}/${dbName}`,
    ['usuarios', 'anomalias_groups', 'tabs_relation', 'sidewalk', 'service_size', 'sections', 'gas_scape',
        'pipe_size', 'pipe_pressure', 'pipe_materials', 'materials', 'artifacs', 'accion_realizada', 'devicesInfo'])
