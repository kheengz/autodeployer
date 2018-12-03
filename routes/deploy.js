var express = require('express');
var router = express.Router();
require('dotenv').config();
const { exec } = require('child_process');
router.post('/', function(req, res) {
    //console.log(' deploy ', req.body);
    const payload  = req.body;
    if (payload.push
        && payload.push.changes
        && payload.push.changes[0]
        && payload.push.changes[0].new
      ) {
        // run the deploy shell script
        const resp = res;
        const command = process.env[`${payload.push.changes[0].new.name}`];
        console.log(command)
        exec(command, (err, stdout, stderr) => {
            if (err) {
                resp.send( err);
                console.log(err);
                return;
            }
            resp.send( `${stdout}` );
        });
        // res.send( payload.push.changes[0].new );
        return;
    }
    res.send('Invalid request');

});
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
