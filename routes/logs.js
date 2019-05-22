var express = require('express');
var router = express.Router();
require('dotenv').config();
const { exec } = require('child_process');

router.get('/', function(req, res, next) {
	let logFile = process.env['output_log_file'];

	if(req.query.log === 'error') {
		logFile = process.env['error_log_file'];
	}
	if (!logFile) {
		res.send('No ' + logFile + ' defined in configuration');
		return;
	}
	const n = req.query.lines || 200;
	exec(`tail -n ${n} ${logFile}`, (err, stdout, stderr) => {
		if (err) {
			resp.send(err);
			console.log(err);
			return;
		}
		res.render('logs', { title: 'Femi Automated Deploy - Logs', content: stdout , message: logFile, error: err?'Error: ' + err:'' });

	});

	return;

});

module.exports = router;
