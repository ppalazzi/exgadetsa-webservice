'use static'
const config = require('config')
const sql = require('mssql')

const log4js = require('log4js')
const logger = log4js.getLogger('SqlServer-Connection')

const db = config.get('dbConfig').get('sqlServer')
const dbExga = config.get('dbConfig').get('sqlServerExga')

var options = {
    user: db.user,
    password: db.password,
    server: db.host,
    database: db.database
}

var optionsExga = {
    user: dbExga.user,
    password: dbExga.password,
    server: dbExga.host,
    database: dbExga.database
}

const dbClient = new sql.ConnectionPool(options)
    .connect()
    .then(pool => {
        logger.info('La conexion a la base de datos [Sistema_Integral_Exgadet], se genero exitosamente!:)')
        return pool
    })
    .catch(error => logger.error('ERROR: Al conectarse con la base. ' + error))


const dbClientExga = new sql.ConnectionPool(optionsExga)
    .connect()
    .then(pool => {
        logger.info('La conexion a la base de datos [Exgadet], se genero exitosamente!:)')
        return pool
    })
    .catch(error => logger.error('ERROR: Al conectarse con la base. ' + error))


module.exports = {
    sql, dbClient, dbClientExga
}
