 const sql = require("mssql");

 // config for your database
 var config = {
      user: 'sa',
      password: '$Beatles01',
      server: '172.17.0.2', 
      database: 'Bace_CRC' 
 };

sql.on('error', err => {
    // ... error handler
})
 
sql.connect(config).then(pool => {
    // Query
    
    return pool.request()
        .query('select top 1 * from Bace_CRC.dbo.C900_TAREAS')
}).then(result => {
    console.dir(result)
}).catch(err => {
  // ... error checks
});

module.exports = sql;



