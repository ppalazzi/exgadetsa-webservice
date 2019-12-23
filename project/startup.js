const express = require('express')
const app = express();
var db = require('./dao/SqlServerDao.js');

app.get('/', (req, res) => {
  var result = db.query('select * from Bace_CRC.dbo.C900_TAREAS', function(err, result) {
    if (err) throw err;
  });
  console.log(result);
});

app.listen(4000, () => {
  console.log('Example app listening on port 4000!')
});
